// Global React types - makes React.FC, React.ReactNode, etc. available without explicit React import
import { FC, ReactNode, ComponentType, Component } from 'react';

declare global {
  namespace React {
    export { FC, ReactNode, ComponentType, Component };
  }
}

export {};