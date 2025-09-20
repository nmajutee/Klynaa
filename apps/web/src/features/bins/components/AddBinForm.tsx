import React from 'react';
import { useCreateBin } from '@klynaa/api';
import { Card, Button, FormField, Dropdown } from '@klynaa/ui';

export interface AddBinFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const AddBinForm: React.FC<AddBinFormProps> = ({
  onSuccess,
  onCancel,
  className,
}) => {
  const [formData, setFormData] = React.useState({
    type: 'general' as 'general' | 'recyclable' | 'organic' | 'hazardous',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
  });

  const createBin = useCreateBin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createBin.mutateAsync({
        type: formData.type,
        location: {
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        capacity: parseInt(formData.capacity),
      });

      onSuccess?.();
    } catch (error) {
      console.error('Failed to create bin:', error);
    }
  };

  const binTypeOptions = [
    { value: 'general', label: 'General Waste' },
    { value: 'recyclable', label: 'Recyclable' },
    { value: 'organic', label: 'Organic' },
    { value: 'hazardous', label: 'Hazardous' },
  ];

  return (
    <Card className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">Add New Bin</h2>

        <Dropdown
          options={binTypeOptions}
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value as any })}
          placeholder="Select bin type"
        />

        <FormField
          id="address"
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="latitude"
            label="Latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            required
          />

          <FormField
            id="longitude"
            label="Longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            required
          />
        </div>

        <FormField
          id="capacity"
          label="Capacity (Liters)"
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          required
        />

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={createBin.isPending}
            className="flex-1"
          >
            {createBin.isPending ? 'Creating...' : 'Create Bin'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>

        {createBin.error && (
          <p className="text-red-600 text-sm">
            Failed to create bin. Please try again.
          </p>
        )}
      </form>
    </Card>
  );
};