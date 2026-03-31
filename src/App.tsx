import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Trash2, Zap, Info, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { chatStream, Message } from './services/gemini';

const Logo = ({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };
  
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-10 h-10"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${sizes[size]} overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-100`}>
        <Sparkles className={`${iconSizes[size]} text-white`} />
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]" />
      </div>
      {size !== "lg" && (
        <span className={`${size === "sm" ? "text-lg" : "text-xl"} font-bold tracking-tight text-gray-900`}>
          Chat Bot <span className="text-indigo-600">Development</span>
        </span>
      )}
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let assistantContent = '';
      const stream = chatStream(messages, input);
      
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        assistantContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantContent;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <Logo />
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            className="p-2.5 text-gray-400 hover:text-red-500 transition-all rounded-xl hover:bg-red-50 group"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 max-w-2xl mx-auto py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Logo size="lg" className="flex-col !gap-6" />
              <div className="mt-4">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  Chat Bot <span className="text-indigo-600">Development</span>
                </h2>
                <p className="text-lg text-gray-500 mt-2 font-medium">
                  Your AI Development Assistant
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {[
                { icon: Zap, label: "Fast & Precise", desc: "Real-time responses with high accuracy." },
                { icon: MessageSquare, label: "Context Aware", desc: "Remembers your conversation history." },
                { icon: Info, label: "Expert Knowledge", desc: "Trained on vast amounts of data." }
              ].map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
                >
                  <feature.icon className="w-6 h-6 text-indigo-600 mb-2 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-900">{feature.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="w-full space-y-3">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Try asking</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Explain quantum entanglement simply",
                  "Write a Python script to scrape a website",
                  "Help me debug my React useEffect hook",
                  "Create a study plan for organic chemistry"
                ].map((suggestion, i) => (
                  <motion.button
                    key={suggestion}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    onClick={() => setInput(suggestion)}
                    className="text-left p-4 text-sm text-gray-600 bg-white border border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all shadow-sm hover:shadow-md group"
                  >
                    <span className="group-hover:text-indigo-600 transition-colors">{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`flex-1 max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                  }`}>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-6 bg-white border-t border-gray-200">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
          <p className="text-[10px] text-center text-gray-400 mt-3">
            Chat Bot Development can make mistakes. Check important info.
          </p>
      </footer>
    </div>
  );
}
