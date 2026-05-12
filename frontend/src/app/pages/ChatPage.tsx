import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Sidebar } from '../components/Sidebar';
import { ChatWindow } from '../components/ChatWindow';
import { User, Message, userService, messageService, wsService } from '../services/api';

interface ChatPageProps {
  currentUser: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function ChatPage({ currentUser, onLogout, theme, onToggleTheme }: ChatPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchUsers();
    if (currentUser.id) {
      wsService.connect(currentUser.id);
      wsService.onMessage(handleWebSocketMessage);
    }

    return () => {
      wsService.disconnect();
    };
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await userService.getUsers();
      const filteredUsers = fetchedUsers.filter(u => u.id !== currentUser.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'new_message') {
      setMessages(prev => [...prev, data.data]);
    } else if (data.type === 'typing') {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    } else if (data.type === 'presence') {
      setUsers(prev => prev.map(u => 
        u.id === data.user_id ? { ...u, status: data.online ? 'online' : 'offline' } : u
      ));
    }
  };

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    if (!currentUser.id || !user.id) return;
    try {
      const conversationId = [currentUser.id, user.id].sort().join('_');
      const history = await messageService.getConversationMessages(conversationId);
      setMessages(history);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedUser || !currentUser.id) return;

    try {
      const msg = await messageService.sendMessage({
        sender_id: currentUser.id,
        receiver_id: selectedUser.id!,
        content
      });
      // The websocket will broadcast this to both users, so we don't need to manually append it locally if we rely on WS.
      // But for better UI, we can just let WS handle receiving it back if configured in backend to send to self.
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleEditMessage = async (message: Message) => {
    if (!message.id) return;
    const newContent = prompt('Edit message:', message.content);
    if (!newContent || newContent === message.content) return;

    try {
      await messageService.editMessage(message.id, newContent);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === message.id
            ? { ...msg, content: newContent, edited: true }
            : msg
        )
      );
      toast.success('Message edited');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      await messageService.deleteMessage(messageId);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: 'This message was deleted.', deleted: true }
            : msg
        )
      );
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  return (
    <motion.div
      className="h-screen flex overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar
        currentUser={currentUser}
        users={users}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        onLogout={onLogout}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <ChatWindow
        currentUser={currentUser}
        selectedUser={selectedUser}
        messages={messages}
        onSendMessage={handleSendMessage}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        isTyping={isTyping}
      />
    </motion.div>
  );
}
