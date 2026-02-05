import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import uuid from 'react-native-uuid';
import { Car, Project, CarFormData, ProjectFormData } from '../types';
import { syncQueue, storageJson, STORAGE_KEYS } from '../utils/storage';
import { useNetwork } from '../hooks/useNetwork';

const CARS_COLLECTION = 'cars';
const PROJECTS_COLLECTION = 'projects';

// Helper to check if we're online
const checkOnline = (): boolean => {
  // Use NetInfo to check connectivity
  // This is a simple check - in production, use the actual NetInfo state
  return true; // Assume online by default, actual check happens at call site
};

// Generate offline ID (temporary ID for offline operations)
const generateOfflineId = (): string => {
  return `offline_${uuid.v4()}`;
};

// Car Services with Offline Support
export const carService = {
  // Get all cars with offline caching
  getAll: async (): Promise<Car[]> => {
    try {
      const snapshot = await firestore()
        .collection(CARS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
      
      const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
      
      // Cache cars locally
      await storageJson.set(STORAGE_KEYS.CACHED_PROJECTS, cars);
      
      return cars;
    } catch (error) {
      console.error('Error fetching cars, falling back to cache:', error);
      // Fall back to cached data
      const cached = await storageJson.get<Car[]>(STORAGE_KEYS.CACHED_PROJECTS, []);
      return cached || [];
    }
  },

  // Get car by ID
  getById: async (id: string): Promise<Car | null> => {
    // Check if it's an offline ID
    if (id.startsWith('offline_')) {
      const items = await syncQueue.getAll();
      const pendingCar = items.find(item => item.id === id && item.type === 'car');
      if (pendingCar) {
        return pendingCar.data as Car;
      }
      return null;
    }

    try {
      const doc = await firestore().collection(CARS_COLLECTION).doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } as Car : null;
    } catch (error) {
      console.error('Error fetching car:', error);
      return null;
    }
  },

  // Create car - works offline
  create: async (data: CarFormData, isOffline = false): Promise<Car> => {
    const carData = {
      ...data,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isOffline) {
      // Generate temporary offline ID
      const offlineId = generateOfflineId();
      const offlineCar = { id: offlineId, ...carData };
      
      // Add to sync queue
      await syncQueue.add({
        id: offlineId,
        type: 'car',
        action: 'create',
        data: carData,
        timestamp: Date.now(),
      });
      
      return offlineCar as Car;
    }

    const docRef = await firestore().collection(CARS_COLLECTION).add(carData);
    return { id: docRef.id, ...carData } as Car;
  },

  // Update car - works offline
  update: async (id: string, data: Partial<CarFormData>, isOffline = false): Promise<void> => {
    if (isOffline) {
      // Add to sync queue
      await syncQueue.add({
        id: uuid.v4() as string,
        type: 'car',
        action: 'update',
        data: { id, ...data },
        timestamp: Date.now(),
      });
      return;
    }

    await firestore()
      .collection(CARS_COLLECTION)
      .doc(id)
      .update({ ...data, updatedAt: new Date() });
  },

  // Delete car - works offline
  delete: async (id: string, isOffline = false): Promise<void> => {
    if (isOffline) {
      // Add to sync queue
      await syncQueue.add({
        id: uuid.v4() as string,
        type: 'car',
        action: 'delete',
        data: { id },
        timestamp: Date.now(),
      });
      return;
    }

    await firestore().collection(CARS_COLLECTION).doc(id).delete();
  },

  // Upload car image
  uploadImage: async (carId: string, imagePath: string): Promise<string> => {
    const filename = `${carId}/${uuid.v4()}.jpg`;
    const reference = storage().ref(filename);
    await reference.putFile(imagePath);
    return await reference.getDownloadURL();
  },
};

// Project Services with Offline Support
export const projectService = {
  // Get all projects with offline caching
  getAll: async (): Promise<Project[]> => {
    try {
      const snapshot = await firestore()
        .collection(PROJECTS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
      
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      
      // Fetch car data for each project
      const projectsWithCars = await Promise.all(
        projects.map(async project => {
          if (project.carId) {
            const car = await carService.getById(project.carId);
            return { ...project, car: car || undefined };
          }
          return project;
        })
      );
      
      // Cache projects locally
      await storageJson.set(STORAGE_KEYS.CACHED_PROJECTS, projectsWithCars);
      
      return projectsWithCars;
    } catch (error) {
      console.error('Error fetching projects, falling back to cache:', error);
      // Fall back to cached data
      const cached = await storageJson.get<Project[]>(STORAGE_KEYS.CACHED_PROJECTS, []);
      return cached || [];
    }
  },

  // Get project by ID
  getById: async (id: string): Promise<Project | null> => {
    // Check if it's an offline ID
    if (id.startsWith('offline_')) {
      const items = await syncQueue.getAll();
      const pendingProject = items.find(item => item.id === id && item.type === 'project');
      if (pendingProject) {
        return pendingProject.data as Project;
      }
      return null;
    }

    try {
      const doc = await firestore().collection(PROJECTS_COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      
      const project = { id: doc.id, ...doc.data() } as Project;
      if (project.carId) {
        project.car = await carService.getById(project.carId);
      }
      return project;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  },

  // Create project - works offline
  create: async (data: ProjectFormData, isOffline = false): Promise<Project> => {
    const projectData = {
      ...data,
      status: 'pending' as const,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isOffline) {
      // Generate temporary offline ID
      const offlineId = generateOfflineId();
      const offlineProject = { id: offlineId, ...projectData };
      
      // Add to sync queue
      await syncQueue.add({
        id: offlineId,
        type: 'project',
        action: 'create',
        data: projectData,
        timestamp: Date.now(),
      });
      
      return offlineProject as Project;
    }

    const docRef = await firestore().collection(PROJECTS_COLLECTION).add(projectData);
    return { id: docRef.id, ...projectData } as Project;
  },

  // Update project - works offline
  update: async (id: string, data: Partial<Project>, isOffline = false): Promise<void> => {
    if (isOffline) {
      // Add to sync queue
      await syncQueue.add({
        id: uuid.v4() as string,
        type: 'project',
        action: 'update',
        data: { id, ...data },
        timestamp: Date.now(),
      });
      return;
    }

    await firestore()
      .collection(PROJECTS_COLLECTION)
      .doc(id)
      .update({ ...data, updatedAt: new Date() });
  },

  // Delete project - works offline
  delete: async (id: string, isOffline = false): Promise<void> => {
    if (isOffline) {
      // Add to sync queue
      await syncQueue.add({
        id: uuid.v4() as string,
        type: 'project',
        action: 'delete',
        data: { id },
        timestamp: Date.now(),
      });
      return;
    }

    await firestore().collection(PROJECTS_COLLECTION).doc(id).delete();
  },

  // Update project status - works offline
  updateStatus: async (id: string, status: Project['status'], isOffline = false): Promise<void> => {
    if (isOffline) {
      // Add to sync queue
      await syncQueue.add({
        id: uuid.v4() as string,
        type: 'project',
        action: 'update',
        data: { id, status },
        timestamp: Date.now(),
      });
      return;
    }

    await firestore()
      .collection(PROJECTS_COLLECTION)
      .doc(id)
      .update({ status, updatedAt: new Date() });
  },
};

// Export sync queue helper
export { syncQueue };
