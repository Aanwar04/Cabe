import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOffline } from '../context/OfflineContext';

interface OfflineIndicatorProps {
  showSyncButton?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ showSyncButton = true }) => {
  const { isOffline, pendingSyncCount, syncNow, lastSyncTime, clearPendingSync } = useOffline();

  // Don't render anything if online
  if (!isOffline && pendingSyncCount === 0) {
    return null;
  }

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never synced';
    const diff = Date.now() - lastSyncTime;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    return `${Math.floor(diff / 3600000)} hr ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.icon}>{isOffline ? '📡' : '☁️'}</Text>
        <Text style={styles.text}>
          {isOffline
            ? 'You are offline - changes will be saved locally'
            : `${pendingSyncCount} item${pendingSyncCount !== 1 ? 's' : ''} pending sync`}
        </Text>
        {showSyncButton && !isOffline && pendingSyncCount > 0 && (
          <TouchableOpacity style={styles.syncButton} onPress={syncNow}>
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Show sync status when not offline but has pending items */}
      {!isOffline && pendingSyncCount > 0 && (
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>Last sync: {formatLastSync()}</Text>
          <TouchableOpacity onPress={clearPendingSync}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Compact banner version for headers
export const OfflineBanner: React.FC = () => {
  const { isOffline, pendingSyncCount } = useOffline();

  if (!isOffline) return null;

  return (
    <View style={styles.bannerCompact}>
      <Text style={styles.iconSmall}>📡</Text>
      <Text style={styles.bannerCompactText}>Offline Mode</Text>
      {pendingSyncCount > 0 && (
        <Text style={styles.bannerCompactSubtext}> ({pendingSyncCount} pending)</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingTop: 40, // Account for status bar
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  syncButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  syncButtonText: {
    color: '#FF9800',
    fontWeight: '600',
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  statusText: {
    color: '#E65100',
    fontSize: 12,
  },
  clearText: {
    color: '#FF6D00',
    fontSize: 12,
    fontWeight: '600',
  },
  bannerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  iconSmall: {
    fontSize: 14,
    marginRight: 4,
  },
  bannerCompactText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  bannerCompactSubtext: {
    color: '#fff',
    fontSize: 12,
  },
});

export default OfflineIndicator;
