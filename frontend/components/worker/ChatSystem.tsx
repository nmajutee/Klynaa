/**
 * Real-time Chat Component for Worker-Customer Communication
 * Supports text messages, quick replies, and image sharing
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  PhotoIcon,
  FaceSmileIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_type: 'worker' | 'customer';
  message: string;
  image_url?: string;
  timestamp: string;
  is_read: boolean;
}

interface Conversation {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_avatar?: string;
  pickup_id?: number;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  status: 'active' | 'completed' | 'archived';
}

interface ChatSystemProps {
  conversations: Conversation[];
  selectedConversationId?: number;
  onSelectConversation?: (conversationId: number) => void;
  className?: string;
}

const ChatSystem: React.FC<ChatSystemProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickReplies = [
    "I'm on my way!",
    "Pickup completed successfully",
    "I'll be there in 10 minutes",
    "Could you please place the bin outside?",
    "Thank you for using Klynaa!"
  ];

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (conversationId: number) => {
    try {
      setLoading(true);
      // Mock messages - replace with actual API call
      const mockMessages: Message[] = [
        {
          id: 1,
          sender_id: 2,
          sender_name: 'John Doe',
          sender_type: 'customer',
          message: 'Hello! When will you be able to pick up my waste?',
          timestamp: '2024-01-15T10:30:00Z',
          is_read: true
        },
        {
          id: 2,
          sender_id: 1,
          sender_name: 'Worker',
          sender_type: 'worker',
          message: "I'm on my way! I'll be there in about 15 minutes.",
          timestamp: '2024-01-15T10:32:00Z',
          is_read: true
        },
        {
          id: 3,
          sender_id: 2,
          sender_name: 'John Doe',
          sender_type: 'customer',
          message: 'Great! I\'ve placed the bins outside the gate.',
          timestamp: '2024-01-15T10:35:00Z',
          is_read: true
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    const messageData = {
      conversation_id: selectedConversationId,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    // Optimistically add message to UI
    const optimisticMessage: Message = {
      id: Date.now(),
      sender_id: 1,
      sender_name: 'You',
      sender_type: 'worker',
      message: newMessage,
      timestamp: new Date().toISOString(),
      is_read: false
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      // Replace with actual API call
      console.log('Sending message:', messageData);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  const sendQuickReply = (reply: string) => {
    setNewMessage(reply);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversationId) return;

    try {
      // Handle image upload - replace with actual implementation
      console.log('Uploading image:', file);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!selectedConversationId) {
    return (
      <div className={`flex h-full ${className}`}>
        {/* Conversations List */}
        <div className="w-full lg:w-1/3 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            <p className="text-sm text-gray-500">Messages with customers</p>
          </div>

          <div className="divide-y divide-gray-200">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-4xl mb-2">💬</div>
                <p>No conversations yet</p>
                <p className="text-sm">Messages will appear here when customers contact you</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation?.(conversation.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {conversation.customer_avatar ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={conversation.customer_avatar}
                          alt={conversation.customer_name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {conversation.customer_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {conversation.unread_count > 0 && (
                        <div className="absolute -mt-2 -ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.customer_name}
                        </p>
                        {conversation.last_message_time && (
                          <p className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_time)}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                      {conversation.pickup_id && (
                        <p className="text-xs text-blue-600">
                          Pickup #{conversation.pickup_id}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Empty State */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a customer to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSelectConversation?.(0)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          {selectedConversation?.customer_avatar ? (
            <img
              className="h-10 w-10 rounded-full"
              src={selectedConversation.customer_avatar}
              alt={selectedConversation.customer_name}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {selectedConversation?.customer_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{selectedConversation?.customer_name}</h3>
            {selectedConversation?.pickup_id && (
              <p className="text-sm text-gray-500">Pickup #{selectedConversation.pickup_id}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <PhoneIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <MapPinIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-500">Loading messages...</div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === 'worker' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_type === 'worker'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.image_url && (
                  <img
                    src={message.image_url}
                    alt="Shared image"
                    className="rounded-lg mb-2 max-w-full"
                  />
                )}
                <p className="text-sm">{message.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender_type === 'worker' ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex space-x-2 overflow-x-auto">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => sendQuickReply(reply)}
              className="flex-shrink-0 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <PhotoIcon className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
              <FaceSmileIcon className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;