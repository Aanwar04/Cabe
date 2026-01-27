import {useEffect} from 'react';
import Orientation from 'react-native-orientation-locker';

const useScreenOrientation = orientation => {
  useEffect(() => {
    // Lock the orientation based on the provided value
    switch (orientation) {
      case 'portrait':
        Orientation.lockToPortrait();
        break;
      case 'landscape':
        Orientation.lockToLandscape();
        break;

      default:
        Orientation.lockToPortrait(); // Default to portrait if invalid value
    }

    // Cleanup on unmount: Unlock all orientations
    return () => {
      Orientation.unlockAllOrientations();
    };
  }, [orientation]);
};

export default useScreenOrientation;
