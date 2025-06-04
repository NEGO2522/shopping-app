import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { ref, push, onValue, query, orderByChild } from 'firebase/database';
import { format } from 'date-fns';

function Chat({ recipientId, recipientName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Set current user
    setCurrentUser(auth.currentUser);

    // Create a unique chat ID (sorted UIDs to ensure same ID for both users)
    const chatId = [auth.currentUser.uid, recipientId].sort().join('_');
    
    // Listen for messages
    const messagesRef = query(
      ref(db, `chats/${chatId}/messages`),
      orderByChild('timestamp')
    );

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList = Object.values(messagesData);
        setMessages(messagesList);
      }
    });

    return () => unsubscribe();
  }, [recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const chatId = [auth.currentUser.uid, recipientId].sort().join('_');
    const messagesRef = ref(db, `chats/${chatId}/messages`);

    try {
      await push(messagesRef, {
        text: newMessage,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: Date.now(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-4 rounded-t-lg">
        <h3 className="text-white font-semibold text-lg">Chat with {recipientName}</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">💌</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentUser?.uid
                  ? 'bg-violet-100 text-violet-900'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {format(message.timestamp, 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors duration-200 flex items-center justify-center"
          >
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat; 