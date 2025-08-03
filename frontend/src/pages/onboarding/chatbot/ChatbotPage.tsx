import React, { useState } from 'react';

interface Message {
  text: string;
  isBot: boolean;
  suggestions?: string[];
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I'm your AI assistant. How can I help you today?",
      isBot: true,
      suggestions: ["Find Companies", "Learn More"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text, isBot: false }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/onboarding/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        text: data.message,
        isBot: true,
        suggestions: data.suggestions
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, I encountered an error. Please try again.",
        isBot: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="h-[500px] overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.isBot ? '' : 'text-right'}`}>
              <div className={`inline-block p-3 rounded-lg ${
                msg.isBot ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                <p>{msg.text}</p>
                {msg.suggestions && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.suggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="px-3 py-1 text-sm bg-white rounded-full hover:bg-gray-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
