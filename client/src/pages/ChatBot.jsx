import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { chatAPI } from '../services/api';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickReplyButtons, setQuickReplyButtons] = useState([]);
  const [chatSession, setChatSession] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    startChat();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = async () => {
    try {
      const response = await chatAPI.initializeChat();
      if (response.data.success) {
        const botMessage = response.data.message;
        const buttons = response.data.quickReplies || [];
        
        setMessages([
          {
            id: 1,
            type: 'bot',
            text: botMessage,
            timestamp: new Date()
          }
        ]);
        setQuickReplyButtons(buttons);
        setChatSession(response.data.sessionId);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      setMessages([
        {
          id: 1,
          type: 'bot',
          text: 'Sorry, there was an issue starting the chat. Please try again.',
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    
    if (!textToSend) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setQuickReplyButtons([]);
    setLoading(true);

    try {
      const response = await chatAPI.sendChatMessage({
        sessionId: chatSession,
        message: textToSend
      });

      if (response.data.success) {
        const botMsg = {
          id: Date.now() + 1,
          type: 'bot',
          text: response.data.message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMsg]);
        
        if (response.data.quickReplies) {
          setQuickReplyButtons(response.data.quickReplies);
        }

        // If chat is complete, show recommendations
        if (response.data.recommendations) {
          const recommendationMsg = {
            id: Date.now() + 2,
            type: 'bot',
            text: 'Based on your preferences, here are my top recommendations:',
            recommendations: response.data.recommendations,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, recommendationMsg]);
          setQuickReplyButtons([]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (button) => {
    handleSendMessage(button.text);
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setQuickReplyButtons([]);
    startChat();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-6">
      <div className="max-w-2xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-3xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={28} />
            <div>
              <h1 className="text-xl font-bold">Surf AI Assistant</h1>
              <p className="text-xs text-blue-100">Get personalized surf spot recommendations</p>
            </div>
          </div>
          <button
            onClick={resetChat}
            className="p-2 hover:bg-blue-500 rounded-full transition"
            title="Start new chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Loading chat...</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  
                  {/* Recommendations Display */}
                  {msg.recommendations && (
                    <div className="mt-4 space-y-2">
                      {msg.recommendations.map((spot, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            msg.type === 'user'
                              ? 'bg-blue-500'
                              : 'bg-white border border-gray-300'
                          }`}
                        >
                          <p className={`font-semibold text-sm ${msg.type === 'user' ? 'text-white' : 'text-gray-900'}`}>
                            {spot.name}
                          </p>
                          <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
                            📍 {spot.location.city}, {spot.location.country}
                          </p>
                          <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
                            ⭐ {spot.rating}/5 • 💵 ${spot.pricePerHour}/hr
                          </p>
                          {spot.description && (
                            <p className={`text-xs mt-2 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-700'}`}>
                              {spot.description.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Buttons */}
        {quickReplyButtons.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2">
            {quickReplyButtons.map((button, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(button)}
                disabled={loading}
                className="text-sm px-3 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition disabled:opacity-50 font-medium"
              >
                {button.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-300 p-4 bg-white rounded-b-3xl flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            disabled={loading || quickReplyButtons.length > 0}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-10 h-10"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
