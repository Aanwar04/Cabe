// Async Storage utility for offline mode
// Install: npm install @react-native-async-storage/async-storage

// Placeholder until package is installed
const AsyncStorage = {
  setItem: async (_key: string, _value: string): Promise<void> => {
    console.log('[Storage] Set item (mock):', _key);
    return Promise.resolve();
  },
  getItem: async (_key: string): Promise<string | null> => {
    console.log('[Storage] Get item (mock):', _key);
    return Promise.resolve(null);
  },
  removeItem: async (_key: string): Promise<void> => {
    console.log('[Storage] Remove item (mock):', _key);
    return Promise.resolve();
  },
  clear: async (): Promise<void> => {
    console.log('[Storage] Clear (mock)');
    return Promise.resolve();
  },
  getAllKeys: async (): Promise<string[]> => {
    return Promise.resolve([]);
  },
  multiGet: async (_keys: string[]): Promise<[string, string][]> => {
    return Promise.resolve([]);
  },
  multiSet: async (_entries: [string, string][]): Promise<void> => {
    return Promise.resolve();
  },
  multiRemove: async (_keys: string[]): Promise<void> => {
    return Promise.resolve();
  },
};

// Uncomment after installing @react-native-async-storage/async-storage
/*
import AsyncStorage from '@react-native-async-storage/async-storage';
*/

// Storage keys
export const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  THEME_MODE: 'theme_mode',
  PENDING_SYNC: 'pending_sync',
  CACHED_PROJECTS: 'cached_projects',
  LAST_SYNC: 'last_sync',
};

// Generic storage functions
export const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

// JSON storage helpers
export const storageJson = {
  set: async <T>(key: string, value: T): Promise<void> => {
    await storage.setItem(key, JSON.stringify(value));
  },

  get: async <T>(key: string, defaultValue?: T): Promise<T | null> => {
    const value = await storage.getItem(key);
    if (value === null) {
      return defaultValue || null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue || null;
    }
  },
};

// User data storage
export const userStorage = {
  saveUser: async (userData: object): Promise<void> => {
    await storageJson.set(STORAGE_KEYS.USER_DATA, userData);
  },

  getUser: async (): Promise<object | null> => {
    return storageJson.get(STORAGE_KEYS.USER_DATA);
  },

  clearUser: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};

// Theme storage
export const themeStorage = {
  saveMode: async (mode: 'light' | 'dark' | 'system'): Promise<void> => {
    await storage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  },

  getMode: async (): Promise<'light' | 'dark' | 'system' | null> => {
    const mode = await storage.getItem(STORAGE_KEYS.THEME_MODE);
    return mode as 'light' | 'dark' | 'system' | null;
  },
};

// Pending sync queue for offline support
interface SyncItem {
  id: string;
  type: 'car' | 'project' | 'image';
  action: 'create' | 'update' | 'delete';
  data: object;
  timestamp: number;
}

export const syncQueue = {
  add: async (item: SyncItem): Promise<void> => {
    const existing = await storageJson.get<SyncItem[]>(STORAGE_KEYS.PENDING_SYNC, []);
    if (existing) {
      existing.push(item);
      await storageJson.set(STORAGE_KEYS.PENDING_SYNC, existing);
    } else {
      await storageJson.set(STORAGE_KEYS.PENDING_SYNC, [item]);
    }
  },

  getAll: async (): Promise<SyncItem[]> => {
    const result = await storageJson.get<SyncItem[]>(STORAGE_KEYS.PENDING_SYNC, []);
    return result || [];
  },

  clear: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.PENDING_SYNC);
  },

  remove: async (id: string): Promise<void> => {
    const items = await syncQueue.getAll();
    const filtered = items.filter(item => item.id !== id);
    await storageJson.set(STORAGE_KEYS.PENDING_SYNC, filtered);
  },
};

export default AsyncStorage;
