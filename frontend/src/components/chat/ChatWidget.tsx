import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { Send, X, MessageCircle, Bot, User, Zap, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, isStreaming } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-[84px] right-4 sm:bottom-6 sm:right-6 z-[90] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[min(100vw-1rem,380px)] sm:w-[380px] h-[68vh] max-h-[560px] bg-white dark:bg-dark-card rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-dark-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-4 py-4 sm:p-6 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0">
                  <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-[11px] sm:text-sm uppercase tracking-widest">TECHSTORE AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-primary-100 uppercase opacity-80">Đang trực tuyến</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-6 custom-scrollbar dark:bg-dark-bg/50">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mb-1">
                      <Zap className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <div 
                    className={`max-w-[82%] p-3 sm:p-4 rounded-2xl text-[13px] sm:text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-dark-border text-slate-800 dark:text-dark-text rounded-bl-none'
                    }`}
                  >
                    {msg.content || (isStreaming && index === messages.length - 1 ? (
                       <RefreshCcw className="h-4 w-4 animate-spin opacity-50" />
                    ) : null)}
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-dark-card border-t border-gray-100 dark:border-dark-border">
               <div className="flex items-center gap-2 bg-white dark:bg-dark-bg p-2 rounded-2xl border border-gray-200 dark:border-dark-border shadow-inner focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                 <input 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                   placeholder="Nhập câu hỏi của bạn..."
                   className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] sm:text-sm px-2 sm:px-3 dark:text-white"
                   disabled={isStreaming}
                 />
                 <button 
                   onClick={handleSend}
                   disabled={isStreaming || !input.trim()}
                   className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-dark-border text-white rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 flex-shrink-0"
                 >
                   <Send className="h-4 w-4" />
                 </button>
               </div>
               <p className="text-[9px] text-center text-gray-400 mt-2 sm:mt-3 font-medium uppercase tracking-tighter">
                 Cung cấp bởi Gemini 2.0 Flash &bull; Trợ giúp 24/7
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-dark-bg rounded-full animate-bounce" />
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
