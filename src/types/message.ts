export interface Message {
  id: string;
  content: string;
  uid: string;
  timestamp: number;
  favorites?: MessageFavorite[];
  replies?: ReplyMessage[];
}

export interface MessageFavorite {
  uid: string;
  timestamp: number;
}

export interface ReplyMessage extends ClientMessage {
  replyTo: string;
}

export interface ClientMessage extends Message {
  user?: {
    displayName: string;
    photoURL?: string;
    verified?: boolean;
  }
}