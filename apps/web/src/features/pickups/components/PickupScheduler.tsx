import React from 'react';
import { useCreatePickup } from '@klynaa/api';
import { Card, Button, FormField, Dropdown } from '@klynaa/ui';

export interface PickupSchedulerProps {
  binId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const PickupScheduler: React.FC<PickupSchedulerProps> = ({
  binId,
  onSuccess,
  onCancel,
  className,
}) => {
  const [formData, setFormData] = React.useState({
    binId: binId || '',
    scheduledTime: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
    estimatedDuration: '30',
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
        estimatedDuration: parseInt(formData.estimatedDuration),
      });

      onSuccess?.();
    } catch (error) {
      console.error('Failed to schedule pickup:', error);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <Card className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">Schedule Pickup</h2>

        <FormField
          id="binId"
          label="Bin ID"
          value={formData.binId}
          onChange={(e) => setFormData({ ...formData, binId: e.target.value })}
          required
          disabled={!!binId}
        />

        <FormField
          id="scheduledTime"
          label="Scheduled Time"
          type="datetime-local"
          value={formData.scheduledTime}
          onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
          required
        />

        <Dropdown
          options={priorityOptions}
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value as any })}
          placeholder="Select priority"
        />

        <FormField
          id="estimatedDuration"
          label="Estimated Duration (minutes)"
          type="number"
          value={formData.estimatedDuration}
          onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
          required
        />

        <FormField
          id="notes"
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          helperText="Optional additional information"
        />

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={createPickup.isPending}
            className="flex-1"
          >
            {createPickup.isPending ? 'Scheduling...' : 'Schedule Pickup'}
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
            Failed to schedule pickup. Please try again.
          </p>
        )}
      </form>
    </Card>
  );
};