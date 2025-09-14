import React, { useState } from 'react';
import Head from 'next/head';
import WorkerLayout from '../../components/WorkerLayout';
import { useAuthStore } from '../../stores';
import {
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    BellIcon,
    UserCircleIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface Message {
    id: number;
    senderId: number;
    senderName: string;
    senderRole: 'customer' | 'worker' | 'system';
    content: string;
    timestamp: string;
    isRead: boolean;
}

interface Chat {
    id: number;
    pickupId?: number;
    customerName: string;
    customerAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    status: 'active' | 'completed' | 'system';
    messages: Message[];
}

const Messages = () => {
    const { user } = useAuthStore();
    const [selectedChat, setSelectedChat] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');

    // Mock data - replace with actual API call
    const chats: Chat[] = [
        {
            id: 1,
            pickupId: 1234,
            customerName: 'Marie Ngando',
            lastMessage: 'Thank you for accepting the pickup! When will you arrive?',
            lastMessageTime: '10 min ago',
            unreadCount: 2,
            status: 'active',
            messages: [
                {
                    id: 1,
                    senderId: 100,
                    senderName: 'Marie Ngando',
                    senderRole: 'customer',
                    content: 'Hello! I have a pickup request for general waste.',
                    timestamp: '2:30 PM',
                    isRead: true
                },
                {
                    id: 2,
                    senderId: 1,
                    senderName: user?.first_name || 'Worker',
                    senderRole: 'worker',
                    content: 'Hi Marie! I accepted your pickup request. I will be there in about 30 minutes.',
                    timestamp: '2:35 PM',
                    isRead: true
                },
                {
                    id: 3,
                    senderId: 100,
                    senderName: 'Marie Ngando',
                    senderRole: 'customer',
                    content: 'Perfect! The bins are located at the back of the building.',
                    timestamp: '2:40 PM',
                    isRead: true
                },
                {
                    id: 4,
                    senderId: 100,
                    senderName: 'Marie Ngando',
                    senderRole: 'customer',
                    content: 'Thank you for accepting the pickup! When will you arrive?',
                    timestamp: '2:50 PM',
                    isRead: false
                }
            ]
        },
        {
            id: 2,
            pickupId: 1235,
            customerName: 'Jean Baptiste',
            lastMessage: 'The recyclable materials are ready for collection',
            lastMessageTime: '1 hour ago',
            unreadCount: 1,
            status: 'active',
            messages: [
                {
                    id: 5,
                    senderId: 101,
                    senderName: 'Jean Baptiste',
                    senderRole: 'customer',
                    content: 'Hi! The recyclable materials are ready for collection. There are about 3 bags.',
                    timestamp: '1:50 PM',
                    isRead: false
                }
            ]
        },
        {
            id: 3,
            customerName: 'System Notifications',
            lastMessage: 'Weekly performance summary available',
            lastMessageTime: '2 hours ago',
            unreadCount: 0,
            status: 'system',
            messages: [
                {
                    id: 6,
                    senderId: 0,
                    senderName: 'Klynaa System',
                    senderRole: 'system',
                    content: 'Congratulations! You completed 8 pickups this week. Your performance rating is 4.8/5.',
                    timestamp: '12:30 PM',
                    isRead: true
                }
            ]
        }
    ];

    const activeChat = selectedChat ? chats.find(c => c.id === selectedChat) : null;

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedChat) return;

        // TODO: Implement API call to send message
        console.log('Sending message:', newMessage);
        setNewMessage('');

        // Mock adding message to chat
        alert('Message sent successfully!');
    };

    const handleMarkAsRead = (chatId: number) => {
        // TODO: Implement API call to mark messages as read
        console.log('Marking chat as read:', chatId);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <ClockIcon className="h-4 w-4 text-blue-500" />;
            case 'completed':
                return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
            case 'system':
                return <BellIcon className="h-4 w-4 text-purple-500" />;
            default:
                return null;
        }
    };

    return (
        <WorkerLayout>
            <Head>
                <title>Messages & Chat - Worker Portal</title>
            </Head>

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Messages & Chat</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Communicate with customers and receive system notifications
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="flex h-96">
                            {/* Chat List */}
                            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                                <div className="p-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {chats.map((chat) => (
                                        <button
                                            key={chat.id}
                                            onClick={() => {
                                                setSelectedChat(chat.id);
                                                if (chat.unreadCount > 0) {
                                                    handleMarkAsRead(chat.id);
                                                }
                                            }}
                                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                                                selectedChat === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-3">
                                                    <div className="relative">
                                                        {chat.status === 'system' ? (
                                                            <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center">
                                                                <BellIcon className="h-5 w-5 text-white" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-10 w-10 bg-gray-400 rounded-full flex items-center justify-center">
                                                                <UserCircleIcon className="h-6 w-6 text-white" />
                                                            </div>
                                                        )}
                                                        {getStatusIcon(chat.status) && (
                                                            <div className="absolute -bottom-1 -right-1">
                                                                {getStatusIcon(chat.status)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {chat.customerName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {chat.lastMessageTime}
                                                            </p>
                                                        </div>
                                                        {chat.pickupId && (
                                                            <p className="text-xs text-gray-500">
                                                                Pickup #{chat.pickupId}
                                                            </p>
                                                        )}
                                                        <p className="text-sm text-gray-600 truncate mt-1">
                                                            {chat.lastMessage}
                                                        </p>
                                                    </div>
                                                </div>

                                                {chat.unreadCount > 0 && (
                                                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 flex flex-col">
                                {activeChat ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="p-4 border-b border-gray-200">
                                            <div className="flex items-center space-x-3">
                                                {activeChat.status === 'system' ? (
                                                    <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                                                        <BellIcon className="h-4 w-4 text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="h-8 w-8 bg-gray-400 rounded-full flex items-center justify-center">
                                                        <UserCircleIcon className="h-5 w-5 text-white" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {activeChat.customerName}
                                                    </h3>
                                                    {activeChat.pickupId && (
                                                        <p className="text-xs text-gray-500">
                                                            Pickup #{activeChat.pickupId}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {activeChat.messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${
                                                        message.senderRole === 'worker' ? 'justify-end' : 'justify-start'
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-xs px-4 py-2 rounded-lg ${
                                                            message.senderRole === 'worker'
                                                                ? 'bg-blue-600 text-white'
                                                                : message.senderRole === 'system'
                                                                ? 'bg-purple-100 text-purple-900'
                                                                : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                    >
                                                        <p className="text-sm">{message.content}</p>
                                                        <p className={`text-xs mt-1 ${
                                                            message.senderRole === 'worker' ? 'text-blue-100' : 'text-gray-500'
                                                        }`}>
                                                            {message.timestamp}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Message Input */}
                                        {activeChat.status !== 'system' && (
                                            <div className="border-t border-gray-200 p-4">
                                                <div className="flex space-x-4">
                                                    <input
                                                        type="text"
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                        placeholder="Type your message..."
                                                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleSendMessage();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={handleSendMessage}
                                                        disabled={!newMessage.trim()}
                                                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <PaperAirplaneIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Select a conversation</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Choose a chat from the list to start messaging.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WorkerLayout>
    );
};

export default Messages;