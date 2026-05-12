import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id?: string;
  username: string;
  status?: 'online' | 'offline';
  avatar?: string;
  last_seen?: string;
}

export interface Message {
  id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp?: string;
  edited?: boolean;
  conversation_id?: string;
}

export const userService = {
  login: async (credentials: any): Promise<User> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  createUser: async (userData: any): Promise<User> => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get(`/users/search?q=${query}`);
    return response.data;
  },
};

export const messageService = {
  sendMessage: async (message: Message): Promise<Message> => {
    const response = await api.post('/messages', message);
    return response.data;
  },

  getMessages: async (): Promise<Message[]> => {
    const response = await api.get('/messages');
    return response.data;
  },

  getConversationMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  },

  searchMessages: async (query: string): Promise<Message[]> => {
    const response = await api.get(`/messages/search?q=${query}`);
    return response.data;
  },

  deleteMessage: async (messageId: string): Promise<Message> => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  editMessage: async (messageId: string, content: string): Promise<Message> => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data;
  },
};

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageHandlers: ((message: any) => void)[] = [];
  // Flag to prevent automatic reconnect after an intentional disconnect
  private intentionalClose = false;

  connect(userId: string) {
    // Avoid creating a duplicate socket if one is already open/connecting
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.intentionalClose = false;

    try {
      this.ws = new WebSocket(`ws://localhost:8000/ws/chat/${userId}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        // Do NOT reconnect if this was a deliberate close (e.g. logout / unmount)
        if (this.intentionalClose) return;
        console.log('WebSocket disconnected, attempting to reconnect...');
        this.reconnectTimeout = setTimeout(() => {
          this.connect(userId);
        }, 3000);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  disconnect() {
    // Mark as intentional BEFORE closing so onclose won't schedule a reconnect
    this.intentionalClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (message: any) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

export const wsService = new WebSocketService();
