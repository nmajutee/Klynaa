/**
 * Worker Chat Page - Real-Time Communication
 * Mobile-first chat interface with quick replies and image upload
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import PrivateRoute from '../../../components/PrivateRoute';
import { enhancedWorkerDashboardApi } from '../../../services/enhancedWorkerDashboardApi';
import { useChatSocket } from '../../../hooks/useChatSocket';
import type { ChatRoom, ChatMessage, QuickReply } from '../../../services/enhancedWorkerDashboardApi';

const WorkerChat: React.FC = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Presence / typing / read state
  const [presence, setPresence] = useState<'online' | 'offline'>('offline');
  const [isTyping, setIsTyping] = useState(false);
  const workerUserIdRef = useRef<number | null>(null);
  const lastReadSentRef = useRef<number>(0);
  const typingTimeoutRef = useRef<any>(null);

  // Auto-refresh interval for polling (replace with WebSocket later)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Memoized loaders to avoid hook dependency warnings
  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      const response = await enhancedWorkerDashboardApi.getChatMessages(Number(roomId));
      setMessages(response.data.messages);
      if (chatRoom && response.data.pickup.status !== chatRoom.pickup.status) {
        setChatRoom(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh messages:', error);
    }
  }, [roomId, chatRoom]);

  const loadChatData = useCallback(async () => {
    try {
      setLoading(true);
      const [chatResponse, repliesResponse] = await Promise.all([
        enhancedWorkerDashboardApi.getChatMessages(Number(roomId)),
        enhancedWorkerDashboardApi.getQuickReplies()
      ]);
      setChatRoom(chatResponse.data);
      setMessages(chatResponse.data.messages);
      setQuickReplies(repliesResponse.data.quick_replies);
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      loadChatData();
      // Polling fallback only if websocket not connected
      const interval = setInterval(() => {
        if (!socketConnectedRef.current) {
          loadMessages();
        }
      }, 4500);
      setRefreshInterval(interval);
      return () => { if (interval) clearInterval(interval); };
    }
  }, [roomId, loadChatData, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket integration
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const socketConnectedRef = useRef(false);
  const { connected, sendMessage: wsSendMessage, sendTyping, sendRead } = useChatSocket({
    roomId: roomId as string,
    token,
    enabled: Boolean(roomId && token),
    onMessage: (msg) => {
      // Append new message if not duplicate
      setMessages(prev => {
        const exists = prev.some(m => (m as any).message_id === msg.id || (m as any).id === msg.id);
        if (exists) return prev;
        return [...prev, {
          id: msg.id,
          message: msg.content,
          image_url: null,
          created_at: msg.created_at,
          sender: { id: msg.sender_id, name: '', is_worker: workerUserIdRef.current === msg.sender_id },
          is_read: msg.is_read
        } as any];
      });
      scrollToBottom();
    },
    onRead: ({ message_ids }) => {
      setMessages(prev => prev.map(m => (message_ids.includes((m as any).id) ? { ...m, is_read: true } : m)));
    },
    onTyping: ({ user_id, is_typing }) => {
      if (workerUserIdRef.current && user_id === workerUserIdRef.current) return; // ignore own typing
      if (is_typing) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2500);
      } else {
        setIsTyping(false);
      }
    },
    onPresence: ({ user_id, status }) => {
      if (workerUserIdRef.current && user_id === workerUserIdRef.current) return;
      setPresence(status === 'online' ? 'online' : 'offline');
    }
  });
  useEffect(() => { socketConnectedRef.current = connected; }, [connected]);

  // Derive worker user id once from existing messages
  useEffect(() => {
    if (!workerUserIdRef.current) {
      const workerMsg = messages.find(m => m.sender?.is_worker);
      if (workerMsg && workerMsg.sender?.id) {
        workerUserIdRef.current = workerMsg.sender.id as any;
      }
    }
  }, [messages]);

  // Typing notifications
  useEffect(() => {
    if (!socketConnectedRef.current) return;
    if (!newMessage) return;
    sendTyping(true);
    const to = setTimeout(() => sendTyping(false), 1500);
    return () => clearTimeout(to);
  }, [newMessage, sendTyping]);

  // Read receipts helper
  const sendReadReceipts = useCallback(() => {
    if (!socketConnectedRef.current) return;
    const now = Date.now();
    if (now - lastReadSentRef.current < 1500) return; // throttle
    const unreadIds = messages
      .filter(m => !m.sender.is_worker && !(m as any).is_read)
      .map(m => (m as any).id)
      .slice(-30);
    if (unreadIds.length) {
      sendRead(unreadIds as any);
      lastReadSentRef.current = now;
    }
  }, [messages, sendRead]);

  useEffect(() => { sendReadReceipts(); }, [messages, sendReadReceipts]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) {
        sendReadReceipts();
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [sendReadReceipts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;
    if (!roomId) return;
    try {
      setSending(true);
      if (socketConnectedRef.current && !selectedImage) {
        wsSendMessage(newMessage.trim());
      } else {
        await enhancedWorkerDashboardApi.sendMessage(Number(roomId), {
          message: newMessage.trim() || undefined,
          image: selectedImage || undefined
        });
        await loadMessages();
      }
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally { setSending(false); }
  };

  const handleQuickReply = async (replyText: string) => {
    if (!roomId) return;

    try {
      setSending(true);

      await enhancedWorkerDashboardApi.sendMessage(Number(roomId), {
        message: replyText
      });

      // Reload messages
      await loadMessages();
    } catch (error) {
      console.error('Failed to send quick reply:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPickupStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Chat room not found</p>
          <Link href="/worker/pickups" className="bg-green-600 text-white px-6 py-2 rounded-lg">
            Back to Pickups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PrivateRoute requiredRole="worker">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Head>
          <title>Chat - {chatRoom.customer.name} - Klynaa</title>
        </Head>

        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center space-x-3">
              <Link href="/worker/pickups" className="p-1 text-gray-500 hover:text-gray-700">
                ←
              </Link>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">
                      {chatRoom.customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h1 className="font-semibold text-gray-900 flex items-center gap-2">
                      {chatRoom.customer.name}
                      <span className={`inline-block w-2 h-2 rounded-full ${presence === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </h1>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span>Pickup #{chatRoom.pickup.id} • {chatRoom.pickup.location}</span>
                      {isTyping && (
                        <span className="text-purple-600 animate-pulse">typing…</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPickupStatusColor(chatRoom.pickup.status)}`}>
                  {chatRoom.pickup.status.replace('_', ' ').toUpperCase()}
                </span>

                {chatRoom.customer.phone && (
                  <a
                    href={`tel:${chatRoom.customer.phone}`}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    📞
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto max-w-md mx-auto w-full px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-gray-500">Start chatting with {chatRoom.customer.name}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender.is_worker ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.sender.is_worker
                    ? 'bg-green-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 shadow-sm border rounded-bl-none'
                }`}>
                  {message.image_url && (
                    <div className="mb-2">
                      <Image
                        src={message.image_url}
                        alt="Shared image"
                        width={300}
                        height={200}
                        className="max-w-full h-auto rounded"
                      />
                    </div>
                  )}

                  {message.message && (
                    <p className="text-sm">{message.message}</p>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <div className={`text-xs ${message.sender.is_worker ? 'text-green-100' : 'text-gray-500'}`}>
                      {getMessageTime(message.created_at)}
                    </div>
                    {message.sender.is_worker && (
                      <div className="text-[10px] text-green-100 ml-2">
                        {(message as any).is_read ? 'Read' : 'Sent'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {quickReplies.length > 0 && (
          <div className="bg-white border-t max-w-md mx-auto w-full px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {quickReplies.slice(0, 6).map((reply) => (
                <button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply.text)}
                  disabled={sending}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 disabled:opacity-50"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="bg-white border-t max-w-md mx-auto w-full px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded"
                  unoptimized={true}
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                >
                  ×
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Image ready to send</p>
                <p className="text-xs text-gray-500">{selectedImage?.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="bg-white border-t sticky bottom-0 max-w-md mx-auto w-full">
          <div className="flex items-center px-4 py-3 space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              📷
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            />

            <button
              onClick={handleSendMessage}
              disabled={sending || (!newMessage.trim() && !selectedImage)}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={socketConnectedRef.current ? 'Send (live)' : 'Send (fallback)'}
            >
              {sending ? '⏳' : (socketConnectedRef.current ? '⚡' : '➤')}
            </button>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default WorkerChat;