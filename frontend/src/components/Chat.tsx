'use client';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Chat({ filters, hasData }: { filters: any, hasData: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages as any);
    setInput('');

    try {
      const contextStr = Object.entries(filters || {})
        .filter(([_, v]) => v !== "")
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://precious-love-production-11e2.up.railway.app'}/api/chat`, { 
        message: input,
        context: contextStr || "None"
      });
      setMessages([...newMessages, { role: 'bot', text: res.data.response }] as any);
    } catch (e) {
      setMessages([...newMessages, { role: 'bot', text: 'Error connecting to AI.' }] as any);
    }
  };

  if (!hasData) return null;

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--card-dark)',
          color: 'var(--card-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          boxShadow: 'var(--shadow-soft)',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '350px',
      height: '500px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--card-light)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-soft)'
    }} className="chat-container">
      <div className="chat-header" style={{ justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <div style={{background: 'var(--card-dark)', borderRadius: '50%', padding: '4px', display: 'flex'}}>
            <Bot size={16} color="var(--card-green)" />
          </div>
          AI Analyst
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
      </div>
      <div className="chat-history" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
            I'm Chronos, your Geopolitical AI Analyst. Ask me anything about the data!
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`} style={{
            maxWidth: '85%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? 'var(--card-dark)' : 'var(--bg-base)',
            color: m.role === 'user' ? 'var(--text-light)' : 'var(--text-dark)',
            borderBottomRightRadius: m.role === 'user' ? '4px' : 'var(--radius-md)',
            borderBottomLeftRadius: m.role === 'bot' ? '4px' : 'var(--radius-md)',
            lineHeight: 1.5
          }}>
            <ReactMarkdown components={{
              p: ({node, ...props}) => <p style={{margin: '0 0 0.5rem 0'}} {...props}/>,
              ul: ({node, ...props}) => <ul style={{margin: '0 0 0.5rem 1.5rem'}} {...props}/>,
              ol: ({node, ...props}) => <ol style={{margin: '0 0 0.5rem 1.5rem'}} {...props}/>,
              li: ({node, ...props}) => <li style={{marginBottom: '0.25rem'}} {...props}/>,
              strong: ({node, ...props}) => <strong style={{fontWeight: 600}} {...props}/>,
            }}>
              {m.text}
            </ReactMarkdown>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="chat-input" style={{ display: 'flex', padding: '1rem', gap: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything..."
          style={{ flex: 1, background: 'var(--bg-base)', borderRadius: 'var(--radius-full)', border: 'none', padding: '0.875rem 1rem' }}
        />
        <button onClick={handleSend} style={{ background: 'var(--card-dark)', color: 'var(--text-light)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
