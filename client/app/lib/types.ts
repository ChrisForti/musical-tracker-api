// Shared type definitions for the Musical Tracker application

export interface Musical {
  id: string;
  name: string; // Changed from title to match backend
  composer: string;
  lyricist: string;
  approved: boolean;
  synopsis?: string;
  posterId?: string;
  posterUrl?: string;
  createdAt: string;
}

export interface Actor {
  id: number;
  name: string;
  email: string;
  bio?: string;
  profileImageUrl?: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
}

export interface Theater {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  capacity?: number;
  verified: boolean;
  createdAt: string;
}

export interface Performance {
  id: number;
  date: string;
  time: string;
  musical: {
    id: number;
    title: string;
  };
  theater: {
    id: number;
    name: string;
    city: string;
  };
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  musicalId: number;
  musical?: {
    id: number;
    title: string;
  };
  createdAt: string;
}

export interface Casting {
  id: number;
  actorId: number;
  roleId: number;
  performanceId: number;
  actor?: Actor;
  role?: Role;
  performance?: Performance;
  createdAt: string;
}

// API Response types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Search and Filter types
export interface SearchFilters {
  query?: string;
  genre?: string;
  verified?: boolean;
  approved?: boolean;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}
