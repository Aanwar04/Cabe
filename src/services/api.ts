import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import uuid from 'react-native-uuid';
import { Car, Project, CarFormData, ProjectFormData } from '../types';

const CARS_COLLECTION = 'cars';
const PROJECTS_COLLECTION = 'projects';

// Car Services
export const carService = {
  // Get all cars
  getAll: async (): Promise<Car[]> => {
    const snapshot = await firestore()
      .collection(CARS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
  },

  // Get car by ID
  getById: async (id: string): Promise<Car | null> => {
    const doc = await firestore().collection(CARS_COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Car : null;
  },

  // Create car
  create: async (data: CarFormData): Promise<Car> => {
    const carData = {
      ...data,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await firestore().collection(CARS_COLLECTION).add(carData);
    return { id: docRef.id, ...carData } as Car;
  },

  // Update car
  update: async (id: string, data: Partial<CarFormData>): Promise<void> => {
    await firestore()
      .collection(CARS_COLLECTION)
      .doc(id)
      .update({ ...data, updatedAt: new Date() });
  },

  // Delete car
  delete: async (id: string): Promise<void> => {
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

// Project Services
export const projectService = {
  // Get all projects
  getAll: async (): Promise<Project[]> => {
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
    
    return projectsWithCars;
  },

  // Get project by ID
  getById: async (id: string): Promise<Project | null> => {
    const doc = await firestore().collection(PROJECTS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    
    const project = { id: doc.id, ...doc.data() } as Project;
    if (project.carId) {
      project.car = await carService.getById(project.carId);
    }
    return project;
  },

  // Create project
  create: async (data: ProjectFormData): Promise<Project> => {
    const projectData = {
      ...data,
      status: 'pending' as const,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await firestore().collection(PROJECTS_COLLECTION).add(projectData);
    return { id: docRef.id, ...projectData } as Project;
  },

  // Update project
  update: async (id: string, data: Partial<Project>): Promise<void> => {
    await firestore()
      .collection(PROJECTS_COLLECTION)
      .doc(id)
      .update({ ...data, updatedAt: new Date() });
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    await firestore().collection(PROJECTS_COLLECTION).doc(id).delete();
  },

  // Update project status
  updateStatus: async (id: string, status: Project['status']): Promise<void> => {
    await firestore()
      .collection(PROJECTS_COLLECTION)
      .doc(id)
      .update({ status, updatedAt: new Date() });
  },
};
