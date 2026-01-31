// Car Types
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage?: number;
  price?: number;
  condition?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  carId: string;
  car?: Car;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  images: string[];
  processedVideoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  isDealerAdmin: boolean;
  createdAt: Date;
}

// Form Types
export interface CarFormData {
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage?: number;
  price?: number;
  condition?: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  carId: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  displayName?: string;
}
