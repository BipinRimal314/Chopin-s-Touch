import React, { useState, useRef, useEffect } from 'react';
import { generatePracticeAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const CoachChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Bonjour. I am here to assist with your practice. How does your hand feel today? Are you staying supple?",
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const context = messages.slice(-5).map(m => `${m.role}: ${m.text}`).join('\n');
    const responseText = await generatePracticeAdvice(userMsg.text, context);

    const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center border border-amber-500/20">
          <Sparkles size={20} className="text-amber-500" />
        </div>
        <div>
          <h3 className="font-serif text-stone-100 font-medium">Maestro AI</h3>
          <p className="text-xs text-stone-500">Chopin Method Specialist</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? 'bg-stone-700' : 'bg-amber-900/50 text-amber-500'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`
              max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line
              ${msg.role === 'user' 
                ? 'bg-stone-800 text-stone-200 rounded-tr-none' 
                : 'bg-stone-950 border border-stone-800 text-stone-300 rounded-tl-none'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center text-amber-500">
               <Bot size={14} />
             </div>
             <div className="bg-stone-950 border border-stone-800 p-3 rounded-2xl rounded-tl-none">
               <div className="flex gap-1">
                 <span className="w-2 h-2 bg-stone-600 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-stone-600 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-stone-600 rounded-full animate-bounce delay-150"></span>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-stone-950 border-t border-stone-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about phrasing, wrist movement..."
            className="flex-1 bg-stone-900 border border-stone-800 text-stone-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-all placeholder:text-stone-600"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
