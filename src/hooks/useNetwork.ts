import { useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Network status type
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: 'none' | 'wifi' | 'cellular' | 'unknown';
  details: NetInfoState['details'];
}

// Custom hook for network connectivity
export const useNetwork = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
    details: null,
  });

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        details: state.details,
      });
    });

    // Initial check
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        details: state.details,
      });
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
};

// Hook to check if online (has internet access)
export const useIsOnline = (): boolean => {
  const { isInternetReachable } = useNetwork();
  return isInternetReachable;
};

// Hook with offline/online event callbacks
export const useNetworkCallback = (
  onOnline: () => void,
  onOffline: () => void
): NetworkStatus => {
  const [status, setStatus] = useNetwork();
  const previousStatus = useRef<boolean | null>(null);

  useEffect(() => {
    if (previousStatus.current !== null && status.isConnected !== previousStatus.current) {
      if (status.isConnected) {
        onOnline();
      } else {
        onOffline();
      }
    }
    previousStatus.current = status.isConnected;
  }, [status.isConnected, onOnline, onOffline]);

  return status;
};

export default useNetwork;
