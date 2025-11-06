import { useState, useEffect, useRef } from 'react';
import { Application } from '../types';

interface AIModalProps {
  application: Application | null;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Mock AI responses based on application data
const getMockAIResponse = (application: Application, userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('fit') || lowerMessage.includes('score')) {
    return `The fit score of ${application.fitScore} for "${application.title}" indicates ${application.fitScore >= 80 ? 'strong' : application.fitScore >= 70 ? 'moderate' : 'limited'} alignment with your capabilities. Consider focusing on ${application.fitScore >= 80 ? 'high-priority opportunities' : 'areas that need improvement'} to increase your chances.`;
  }
  
  if (lowerMessage.includes('deadline') || lowerMessage.includes('due') || lowerMessage.includes('time')) {
    return `The deadline for "${application.title}" is ${new Date(application.dueDate).toLocaleDateString()}. You have ${Math.ceil((new Date(application.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining. ${application.percentComplete < 50 ? 'I recommend accelerating your progress to meet the deadline.' : 'You\'re on track, but stay focused to complete on time.'}`;
  }
  
  if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
    return `Current status: ${application.status}. Progress: ${application.percentComplete}%. ${application.status === 'Draft' ? 'Consider moving to Ready status when all requirements are met.' : application.status === 'Ready' ? 'You\'re ready to submit! Make sure all documents are finalized.' : 'Great progress! Keep up the momentum.'}`;
  }
  
  if (lowerMessage.includes('set-aside') || lowerMessage.includes('setaside')) {
    return `This opportunity is set aside for: ${application.setAside.join(', ')}. ${application.setAside.length > 1 ? 'Multiple set-asides increase your eligibility.' : 'Ensure you meet the specific requirements for this set-aside.'}`;
  }
  
  if (lowerMessage.includes('agency') || lowerMessage.includes('client')) {
    return `${application.agency} is the contracting agency. Research their past contracts and preferences to tailor your proposal effectively.`;
  }
  
  if (lowerMessage.includes('naics') || lowerMessage.includes('code')) {
    return `The NAICS code ${application.naics} categorizes this opportunity. Ensure your company's primary NAICS codes align with this classification.`;
  }
  
  // Default response
  return `I can help you with information about "${application.title}". Ask me about fit score, deadlines, status, set-asides, agency details, or NAICS codes. How can I assist you further?`;
};

export default function AIModal({ application, onClose }: AIModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (application) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm here to help you with "${application.title}". Ask me about fit scores, deadlines, status, set-asides, or any other details about this opportunity.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [application]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSend = async () => {
    if (!inputValue.trim() || !application || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI thinking delay (500-1500ms)
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

    // Generate mock response
    const aiResponse: Message = {
      role: 'assistant',
      content: getMockAIResponse(application, userMessage.content),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!application) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                AI Assistant
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {application.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about fit score, deadlines, status..."
                className="flex-1 input-field"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="btn-primary"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {/* Placeholder for OpenAI API integration */}
              {/* 
              To integrate with OpenAI API:
              
              const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                  model: 'gpt-4',
                  messages: [
                    { role: 'system', content: 'You are a helpful assistant for GSA opportunity management.' },
                    ...messages.map(m => ({ role: m.role, content: m.content }))
                  ]
                })
              });
              const data = await response.json();
              const aiMessage = data.choices[0].message.content;
              */}
              💡 This is a mock AI assistant. Replace with OpenAI API integration.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

