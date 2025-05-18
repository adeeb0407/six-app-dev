import { CategoryTabs } from "./categoryTabs";

export type PostType = {
  id: string;
  username: string;
  age: string;
  title: string;
  description: string;
  timeAgo: string;
};

export enum ConnectionLevel {
  First = '1°',
  Second = '2°',
  Third = '3°',
}

export interface PostComponentProps {
  // Base props
  defaultTab?: CategoryTabs;
  onPost?: (text: string, activeTab: CategoryTabs) => void;
  
  // Modal specific props
  isModal?: boolean;
  modalPosition?: 'center' | 'bottom';
  visible?: boolean;
  onClose?: () => void;
  
  // New props
  defaultConnectionLevel?: ConnectionLevel;
}

export interface CategorySelectorProps {
  activeTab: CategoryTabs;
  onTabPress: (tab: CategoryTabs) => void;
}

export interface ConnectionSelectorProps {
  activeConnectionLevel: ConnectionLevel;
  onConnectionLevelChange: (level: ConnectionLevel) => void;
}