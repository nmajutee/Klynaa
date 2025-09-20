export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'worker' | 'admin';
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}