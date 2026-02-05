import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useNetwork } from '../hooks/useNetwork';
import { syncQueue, STORAGE_KEYS, storageJson } from '../utils/storage';
import { showToast, showSuccess, showWarning, showInfo } from '../utils/toast';

// Types
interface OfflineContextType {
  isOffline: boolean;
  pendingSyncCount: number;
  lastSyncTime: number | null;
  syncNow: () => Promise<void>;
  clearPendingSync: () => Promise<void>;
  addToSyncQueue: (item: SyncQueueItem) => Promise<void>;
}

interface SyncQueueItem {
  id: string;
  type: 'car' | 'project' | 'image';
  action: 'create' | 'update' | 'delete';
  data: object;
  timestamp: number;
}

interface OfflineProviderProps {
  children: ReactNode;
}

// Create context
const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Sync manager singleton for background syncing
let syncManager: {
  isSyncing: boolean;
  processQueue: () => Promise<void>;
} | null = null;

// Initialize sync manager
const getSyncManager = () => {
  if (!syncManager) {
    syncManager = {
      isSyncing: false,
      processQueue: async () => {
        if (syncManager!.isSyncing) return;
        syncManager!.isSyncing = true;

        try {
          const items = await syncQueue.getAll();
          if (items.length === 0) return;

          console.log(`[OfflineContext] Processing ${items.length} pending items...`);

          for (const item of items) {
            try {
              // Process based on type and action
              await processSyncItem(item);
              await syncQueue.remove(item.id);
              console.log(`[OfflineContext] Synced item: ${item.id}`);
            } catch (error) {
              console.error(`[OfflineContext] Failed to sync item ${item.id}:`, error);
            }
          }
        } finally {
          syncManager!.isSyncing = false;
        }
      },
    };
  }
  return syncManager;
};

// Process individual sync item
const processSyncItem = async (item: SyncQueueItem): Promise<void> => {
  // Import API service dynamically to avoid circular dependency
  let carService: any;
  let projectService: any;

  try {
    const api = await import('../services/api');
    carService = api.carService;
    projectService = api.projectService;
  } catch (error) {
    console.error('[OfflineContext] Failed to import API service:', error);
    return;
  }

  const data = item.data as any;

  switch (item.type) {
    case 'car':
      if (item.action === 'create') {
        await carService.create(data);
      } else if (item.action === 'update') {
        await carService.update(data.id, data);
      } else if (item.action === 'delete') {
        await carService.delete(data.id);
      }
      break;
    case 'project':
      if (item.action === 'create') {
        await projectService.create(data);
      } else if (item.action === 'update') {
        await projectService.update(data.id, data);
      } else if (item.action === 'delete') {
        await projectService.delete(data.id);
      }
      break;
    default:
      console.warn(`[OfflineContext] Unknown sync item type: ${item.type}`);
  }
};

// Provider component
export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const network = useNetwork();
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const previousIsConnected = useRef<boolean | null>(null);

  // Update offline status based on network
  useEffect(() => {
    const wasOffline = previousIsConnected.current === false;
    const isNowOnline = network.isConnected;

    setIsOffline(!network.isConnected);

    // Show toast when going offline
    if (wasOffline && !isNowOnline) {
      showWarning('You are now offline. Changes will be saved locally.');
    }

    // Auto-sync when coming back online
    if (wasOffline && isNowOnline) {
      showSuccess('You are back online. Syncing data...');
      syncNow();
    }

    previousIsConnected.current = network.isConnected;
  }, [network.isConnected]);

  // Load pending sync count on mount
  useEffect(() => {
    loadPendingCount();
  }, []);

  // Load pending sync count
  const loadPendingCount = async () => {
    const items = await syncQueue.getAll();
    setPendingSyncCount(items.length);
  };

  // Add item to sync queue
  const addToSyncQueue = useCallback(async (item: SyncQueueItem) => {
    await syncQueue.add(item);
    setPendingSyncCount(prev => prev + 1);
    showInfo('Saved locally. Will sync when online.');
  }, []);

  // Trigger manual sync
  const syncNow = useCallback(async () => {
    const manager = getSyncManager();
    await manager.processQueue();
    await loadPendingCount();
    setLastSyncTime(Date.now());
  }, []);

  // Clear all pending sync items
  const clearPendingSync = useCallback(async () => {
    await syncQueue.clear();
    setPendingSyncCount(0);
  }, []);

  // Value object
  const value: OfflineContextType = {
    isOffline,
    pendingSyncCount,
    lastSyncTime,
    syncNow,
    clearPendingSync,
    addToSyncQueue,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

// Custom hook to use offline context
export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

// Export sync helper for direct use
export { getSyncManager };
export type { SyncQueueItem };
