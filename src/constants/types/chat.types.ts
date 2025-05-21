export type MessageType = {
  id: string;
  name: string;
  profile_photo: string;
  message: string;
  timestamp: Date;
  isOwnMessage?: boolean;
};

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: Date;
  showAvatar?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  profile_photo: string;
  connectionDegree?: string;
}
