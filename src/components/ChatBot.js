import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../chatbot.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-questify.onrender.com/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! I'm QuestBot, your productivity assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = { text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const userQuery = inputText;
    setInputText('');
    
    // Show bot is typing
    setIsTyping(true);
    
    try {
      // Call the Gemini API through our backend
      const response = await axios.post(`${API_BASE_URL}/gemini/chat`, {
        message: userQuery
      });
      
      // Add bot response
      const botMessage = { 
        text: response.data.response || response.data.fallbackResponse, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      // Use fallback response if available
      const fallbackResponse = error.response?.data?.fallbackResponse || getLocalResponse(userQuery);
      const botMessage = { text: fallbackResponse, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Fallback responses for when API calls fail
  const getLocalResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I assist you with your productivity today?";
    } else if (lowerMessage.includes('level') || lowerMessage.includes('xp')) {
      return "To level up faster, complete daily quests and focus training sessions. Each completed task gives you XP!";
    } else if (lowerMessage.includes('quest') || lowerMessage.includes('task')) {
      return "You can add new quests from your dashboard. Breaking down large tasks into smaller ones can help you make progress more consistently.";
    } else if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate')) {
      return "Try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break. Our Focus Training feature can help you practice this!";
    } else if (lowerMessage.includes('procrastinate') || lowerMessage.includes('procrastination')) {
      return "To beat procrastination, start with just 2 minutes of work on the task. Often, getting started is the hardest part!";
    } else if (lowerMessage.includes('motivate') || lowerMessage.includes('motivation')) {
      return "Visualize completing your tasks and the satisfaction you'll feel. Also, try to connect your tasks to your bigger goals and values.";
    } else if (lowerMessage.includes('help')) {
      return "I can help with productivity tips, task management strategies, focus techniques, and motivation. What specific area would you like help with?";
    } else if (lowerMessage.includes('thank')) {
      return "You're welcome! Remember, small consistent steps lead to big results. Anything else I can help with?";
    } else {
      return "I'm here to help boost your productivity! Try asking about focus techniques, beating procrastination, or effective task management.";
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>🤖 QuestBot</h3>
            <button className="close-button" onClick={toggleChat}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="message bot typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Ask about productivity..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`} 
        onClick={toggleChat}
      >
        {isOpen ? '×' : '🤖'}
      </button>
    </div>
  );
};

export default ChatBot;
