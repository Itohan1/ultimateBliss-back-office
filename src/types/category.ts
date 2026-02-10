// src/types/category.ts

export interface Subcategory {
  subId?: number; // optional for new subcategories that aren’t saved yet
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface Category {
  _id?: string; // optional because new categories may not have an ID yet
  name: string;
  description?: string;
  isActive?: boolean;
  subcategories: Subcategory[];
  createdAt?: string;
  updatedAt?: string;
}
