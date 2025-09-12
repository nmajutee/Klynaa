import React, { useEffect, useState, useRef } from 'react';            // Set chat room info (assuming first message has room info)
            if (chatResponse.results.length > 0) {
                setChatRoom(chatResponse.results[0].room);
            }t { useRouter } from 'next/router';
import {
    PaperAirplaneIcon,
    PhotoIcon,
    MapPinIcon,
    ClockIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import { workerDashboardApi } from '../../services/workerDashboardApi';
import { useAuthStore } from '../../stores';
import Layout from '../../components/Layout';
import type { ChatRoom, ChatMessage, PickupTask } from '../../types';

const WorkerChatPage: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { pickup } = router.query;

    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pickupDetails, setPickupDetails] = useState<PickupTask | null>(null);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'worker') {
            router.push('/auth/login');
            return;
        }

        if (pickup) {
            loadChatData();
        }
    }, [isAuthenticated, user, router, pickup]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChatData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load chat room and pickup details
            const chatResponse = await workerDashboardApi.getChatMessages(pickup as string);
            // For now, get pickup details from worker pickups
            const pickupResponse = await workerDashboardApi.getWorkerPickups({});
            const currentPickup = pickupResponse.results.find(p => p.id === pickup);

            setMessages(chatResponse.results);
            setPickupDetails(currentPickup || null);

            setMessages(chatResponse.results);
            setPickupDetails(pickupResponse);

            // Set chat room info (assuming first message has room info)
            if (chatResponse.results.length > 0) {
                setChatRoom(chatResponse.results[0].room);
            }

        } catch (err: any) {
            console.error('Failed to load chat data:', err);
            setError(err.message || 'Failed to load chat');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);

            await workerDashboardApi.sendChatMessage(pickup as string, {
                content: newMessage,
                message_type: 'text'
            });

            setNewMessage('');

            // Reload messages
            await loadChatData();

        } catch (err: any) {
            console.error('Failed to send message:', err);
            alert('Failed to send message: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const sendQuickReply = async (replyText: string) => {
        try {
            setSending(true);

            await workerDashboardApi.sendChatMessage(pickup as string, {
                content: replyText,
                message_type: 'quick_reply'
            });

            await loadChatData();

        } catch (err: any) {
            console.error('Failed to send quick reply:', err);
            alert('Failed to send message: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setSending(true);

            await workerDashboardApi.sendChatMessage(pickup as string, {
                content: 'Image shared',
                message_type: 'text',
                image: file
            });

            await loadChatData();

        } catch (err: any) {
            console.error('Failed to send image:', err);
            alert('Failed to send image: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const quickReplies = [
        "I'm on my way!",
        "Running 5 minutes late",
        "I'm here for pickup",
        "Pickup completed successfully",
        "Please prepare the waste for collection",
        "Thank you!"
    ];

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadChatData}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header with pickup details */}
                {pickupDetails && (
                    <div className="bg-white border-b p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h1 className="text-lg font-semibold text-gray-900">
                                    Pickup #{pickupDetails.id}
                                </h1>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    <span>{pickupDetails.pickup_address || 'Address not available'}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    <span>{new Date(pickupDetails.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    pickupDetails.status === 'accepted' ? 'text-blue-600 bg-blue-50' :
                                    pickupDetails.status === 'in_progress' ? 'text-purple-600 bg-purple-50' :
                                    pickupDetails.status === 'completed' ? 'text-green-600 bg-green-50' :
                                    'text-gray-600 bg-gray-50'
                                }`}>
                                    {pickupDetails.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <button className="p-2 text-gray-600 hover:text-gray-900">
                                    <PhoneIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className={`flex ${
                                message.sender.id === user?.id ? 'justify-end' : 'justify-start'
                            }`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.sender.id === user?.id
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-900 border'
                                }`}>
                                    {message.message_type === 'image' && message.image && (
                                        <img
                                            src={message.image}
                                            alt="Shared image"
                                            className="w-full h-auto rounded mb-2"
                                        />
                                    )}
                                    <p className="text-sm">{message.message}</p>
                                    <p className={`text-xs mt-1 ${
                                        message.sender.id === user?.id
                                            ? 'text-green-100'
                                            : 'text-gray-500'
                                    }`}>
                                        {formatMessageTime(message.created_at)}
                                        {message.is_read && message.sender.id === user?.id && (
                                            <span className="ml-1">✓✓</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <div className="bg-white border-t p-4">
                    <p className="text-sm text-gray-600 mb-2">Quick replies:</p>
                    <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply, index) => (
                            <button
                                key={index}
                                onClick={() => sendQuickReply(reply)}
                                disabled={sending}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message Input */}
                <div className="bg-white border-t p-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-600 hover:text-gray-900"
                            disabled={sending}
                        >
                            <PhotoIcon className="h-5 w-5" />
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                disabled={sending}
                                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                            />
                        </div>

                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || sending}
                            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default WorkerChatPage;