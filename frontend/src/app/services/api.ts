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
  image_url?: string | null;
  timestamp?: string;
  edited?: boolean;
  deleted?: boolean;
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

  uploadAvatar: async (userId: string, file: File): Promise<User> => {
    const form = new FormData();
    form.append('file', file);
    const response = await axios.patch(`${API_BASE_URL}/users/${userId}/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const messageService = {
  sendMessage: async (message: Omit<Message, 'id' | 'timestamp' | 'edited' | 'deleted' | 'conversation_id'>): Promise<Message> => {
    const response = await api.post('/messages', message);
    return response.data;
  },

  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/upload-image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url as string;
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
  private intentionalClose = false;

  connect(userId: string) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.intentionalClose = false;
    try {
      this.ws = new WebSocket(`ws://localhost:8000/ws/chat/${userId}`);
      this.ws.onopen = () => console.log('WebSocket connected');
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      this.ws.onerror = (error) => console.error('WebSocket error:', error);
      this.ws.onclose = () => {
        if (this.intentionalClose) return;
        console.log('WebSocket disconnected, attempting to reconnect...');
        this.reconnectTimeout = setTimeout(() => this.connect(userId), 3000);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  disconnect() {
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
