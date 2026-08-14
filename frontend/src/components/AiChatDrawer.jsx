import { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../api/aiApi.js';

const GREETING = {
  role: 'assistant',
  content: "Hi! I'm your venue assistant. Ask me about courts, pricing, locations or availability.",
};

export default function AiChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([GREETING]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChatMessage(
        updatedMessages.map(({ role, content }) => ({ role, content }))
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: error.message, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-overlay transition-transform duration-200 hover:scale-105 hover:bg-brand-700 active:scale-95"
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-40 flex h-[min(500px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-overlay animate-slide-up sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-brand-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} aria-hidden="true" />
              <span className="font-bold">Venue Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-brand-100 transition-colors hover:bg-white/15 hover:text-white"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50 p-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Bot size={15} aria-hidden="true" />
                  </span>
                )}

                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-brand-600 text-white'
                      : msg.isError
                        ? 'rounded-bl-sm border border-red-200 bg-red-50 text-red-700'
                        : 'rounded-bl-sm border border-ink-200 bg-white text-ink-700'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-200 text-ink-600">
                    <User size={15} aria-hidden="true" />
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Bot size={15} aria-hidden="true" />
                </span>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-500">
                  <Loader2 size={14} className="animate-spin text-brand-600" aria-hidden="true" />
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-ink-200 bg-white p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about courts, times, pricing…"
              className="form-input py-2"
              disabled={loading}
              aria-label="Message the assistant"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary shrink-0 !px-3"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
