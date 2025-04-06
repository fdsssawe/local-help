// Update or create this file to include proper typing for Post

export interface Post {
  id?: number;
  skill?: string;
  description?: string;
  userId?: string;
  distance?: number;
  
  // Support both camelCase and snake_case field names for dates
  createdAt?: string | Date;
  created_at?: string | Date;
  updatedAt?: string | Date;
  updated_at?: string | Date;
  
  // Other potential fields
  latitude?: string | number;
  longitude?: string | number;
  // Add other fields as needed
}
