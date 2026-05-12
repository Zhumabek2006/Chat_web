import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Sidebar } from '../components/Sidebar';
import { ChatWindow } from '../components/ChatWindow';
import { ResizableSidebar } from '../components/ResizableSidebar';
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
  // 'list' shows sidebar full-screen on mobile; 'chat' shows chat panel full-screen
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const selectedUserRef = useRef<User | null>(null);
  selectedUserRef.current = selectedUser;

  useEffect(() => {
    fetchUsers();
    if (!currentUser.id) return;

    wsService.connect(currentUser.id);

    const handler = (data: any) => {
      if (data.type === 'new_message') {
        const msg: Message = data.data;
        const current = selectedUserRef.current;
        if (current?.id) {
          const expectedConvId = [currentUser.id, current.id].sort().join('_');
          if (msg.conversation_id !== expectedConvId) return;
        } else {
          return;
        }
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } else if (data.type === 'typing') {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      } else if (data.type === 'presence') {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === data.user_id ? { ...u, status: data.online ? 'online' : 'offline' } : u
          )
        );
      }
    };

    wsService.onMessage(handler);

    return () => {
      wsService.removeMessageHandler(handler);
      wsService.disconnect();
    };
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const all = await userService.getUsers();
      setUsers(all.filter((u) => u.id !== currentUser.id));
    } catch {
      toast.error('Failed to load users');
    }
  };

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setMessages([]);
    // On mobile: switch to chat panel
    setMobileView('chat');
    if (!currentUser.id || !user.id) return;
    try {
      const convId = [currentUser.id, user.id].sort().join('_');
      setMessages(await messageService.getConversationMessages(convId));
    } catch {
      toast.error('Failed to load conversation');
    }
  };

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!selectedUser || !currentUser.id) return;
    if (!content.trim() && !imageUrl) return;
    try {
      const msg = await messageService.sendMessage({
        sender_id: currentUser.id,
        receiver_id: selectedUser.id!,
        content,
        image_url: imageUrl || null,
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleEditMessage = async (message: Message) => {
    if (!message.id) return;
    const newContent = prompt('Edit message:', message.content);
    if (!newContent || newContent === message.content) return;
    try {
      await messageService.editMessage(message.id, newContent);
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, content: newContent, edited: true } : m))
      );
      toast.success('Message edited');
    } catch {
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await messageService.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: 'This message was deleted.', deleted: true } : m
        )
      );
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleBack = () => {
    setMobileView('list');
  };

  return (
    <motion.div
      className="flex h-full overflow-hidden"
      style={{ background: 'var(--sp-base)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* ── DESKTOP LAYOUT (md+): side-by-side with resizable sidebar ── */}
      <div className="hidden md:flex h-full w-full overflow-hidden">
        <ResizableSidebar defaultWidth={280} minWidth={200} maxWidth={480}>
          <Sidebar
            currentUser={currentUser}
            users={users}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            onLogout={onLogout}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
        </ResizableSidebar>
        <ChatWindow
          currentUser={currentUser}
          selectedUser={selectedUser}
          messages={messages}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          isTyping={isTyping}
        />
      </div>

      {/* ── MOBILE LAYOUT (<md): single panel, animated slide ── */}
      <div className="flex md:hidden h-full w-full overflow-hidden relative">
        <AnimatePresence initial={false} mode="wait">
          {mobileView === 'list' ? (
            <motion.div
              key="sidebar"
              className="absolute inset-0"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
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
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              className="absolute inset-0"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <ChatWindow
                currentUser={currentUser}
                selectedUser={selectedUser}
                messages={messages}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                isTyping={isTyping}
                onBack={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
