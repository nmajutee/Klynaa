export interface Pickup {
  id: string;
  bin: {
    id: string;
    type: 'general' | 'recyclable' | 'organic' | 'hazardous';
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
  worker?: {
    id: string;
    name: string;
    phone: string;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  status: 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime: string;
  completedTime?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number;
  actualDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PickupRequest {
  binId: string;
  scheduledTime: string;
  priority?: Pickup['priority'];
  notes?: string;
  estimatedDuration?: number;
}

export type PickupStatus = Pickup['status'];