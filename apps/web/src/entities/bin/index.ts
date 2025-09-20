// Re-export shared types
export type { Bin, BinForm } from '@klynaa/types';

// Entity-specific UI components
export { BinStatusBadge } from './ui/BinStatusBadge';
export { BinCard } from './ui/BinCard';

// Entity model/hooks
export { useBin } from './model/useBin';