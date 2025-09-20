import React from 'react';
import { useCreatePickup } from '@klynaa/api';
import { Card, Button, FormField, Dropdown } from '@klynaa/ui';

export interface RequestPickupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const RequestPickupForm: React.FC<RequestPickupFormProps> = ({
  onSuccess,
  onCancel,
  className,
}) => {
  const [formData, setFormData] = React.useState({
    binId: '',
    scheduledTime: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
  });

  const createPickup = useCreatePickup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPickup.mutateAsync({
        binId: formData.binId,
        scheduledTime: formData.scheduledTime,
        priority: formData.priority,
        notes: formData.notes || undefined,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Failed to request pickup:', error);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low - Within 3 days' },
    { value: 'medium', label: 'Medium - Within 24 hours' },
    { value: 'high', label: 'High - Within 6 hours' },
    { value: 'urgent', label: 'Urgent - ASAP' },
  ];

  return (
    <Card className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">Request Pickup</h2>

        <FormField
          id="binId"
          label="Bin ID"
          value={formData.binId}
          onChange={(e) => setFormData({ ...formData, binId: e.target.value })}
          required
          helperText="Enter the bin ID or scan QR code"
        />

        <FormField
          id="scheduledTime"
          label="Preferred Pickup Time"
          type="datetime-local"
          value={formData.scheduledTime}
          onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority Level
          </label>
          <Dropdown
            options={priorityOptions}
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as any })}
            placeholder="Select priority level"
          />
        </div>

        <FormField
          id="notes"
          label="Additional Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          helperText="Optional: Special instructions or bin condition"
        />

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={createPickup.isPending}
            className="flex-1"
          >
            {createPickup.isPending ? 'Submitting...' : 'Request Pickup'}
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

        {createPickup.error && (
          <p className="text-red-600 text-sm">
            Failed to request pickup. Please try again.
          </p>
        )}
      </form>
    </Card>
  );
};