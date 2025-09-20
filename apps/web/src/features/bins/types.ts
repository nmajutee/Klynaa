export interface Bin {
  id: string;
  type: 'general' | 'recyclable' | 'organic' | 'hazardous';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  capacity: number;
  currentLevel: number;
  status: 'active' | 'inactive' | 'full' | 'maintenance';
  lastEmptied?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export type BinStatus = Bin['status'];

export interface BinFilters {
  type?: Bin['type'];
  status?: BinStatus;
  location?: string;
}