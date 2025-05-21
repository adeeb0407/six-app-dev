import { CategoryTabs } from "./categoryTabs";

export interface Post {
  id: string;
  user_id: string;
  content: string;
  category: CategoryTabs;
  hide_from_chat: boolean;
  expires_at: string | null;
  locked: boolean;
  created_at: string;
  connectiontype: ConnectionLevel | null;
  keyword_summary: string[];
  user_interested: boolean
  user_accepted: boolean
}

export interface PostInput {
  user_id: string
  content: string;
  category: CategoryTabs;
  hide_from_chat: boolean;
  connectiontype: ConnectionLevel | null;
}

export enum ConnectionLevel {
  First = '1',
  Second = '2',
  Third = '3',
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