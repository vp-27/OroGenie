import React, { useState } from 'react';
import axios from 'axios';

const AIChatbot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const sendMessage = async () => {
    if (message.trim() === '') return;
  
    const newMessage = { user: 'You', text: message };
    setChatHistory([...chatHistory, newMessage]);
  
    try {
      const response = await axios.post('/chat', { message });
      let aiReply = response.data.reply;
      // Replace "Gemini" with "OroGenie" in the response
      aiReply = aiReply.replace("Gemini", "OroGenie");
      setChatHistory([...chatHistory, newMessage, { user: 'AI', text: aiReply }]);
    } catch (error) {
      console.error('Error communicating with AI:', error);
    }
  
    setMessage('');
  };
  

  return (
    <div className="ai-chatbot">
      <div className="chat-window">
        {chatHistory.map((entry, index) => (
          <div key={index} className={`chat-entry ${entry.user}`}>
            <strong>{entry.user}:</strong> {entry.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default AIChatbot;
