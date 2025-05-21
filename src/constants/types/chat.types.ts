export type MessageType = {
  id: string;
  name: string;
  profile_pic: string;
  message: string;
  timestamp: Date;
  isOwnMessage?: boolean;
};

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  showAvatar?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  connectionDegree: string;
}
