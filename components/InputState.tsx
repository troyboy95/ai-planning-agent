import { useState, useRef, useEffect } from 'react';
import { SendHorizonal, AlertCircle } from 'lucide-react';

export function InputState({ onSubmit }: { onSubmit: (val: string) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = text.trim();
    if (clean.length < 20) {
      setError("Too brief. Please describe your problem in more detail.");
      return;
    }
    setError('');
    onSubmit(clean.substring(0, 1000));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full pt-[20vh]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">AI Planning Agent</h1>
        <p className="text-gray-500 text-lg">Decompose complex problems into actionable execution plans.</p>
      </div>

      <form onSubmit={handleSubmit} className="relative shadow-sm rounded-xl border bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-shadow">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Build a creator marketplace platform..."
          className="w-full min-h-[120px] max-h-[400px] resize-y bg-transparent p-4 pb-12 outline-none text-gray-800 placeholder:text-gray-400"
        />
        
        <div className="absolute bottom-3 right-3 left-4 flex justify-between items-center">
          <div className="text-xs text-gray-400 font-medium">
             <span className={text.length > 1000 ? 'text-red-500' : ''}>{text.length}</span> / 1000
          </div>
          <button
            type="submit"
            disabled={!text.trim() || text.length > 1000}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors flex items-center justify-center w-8 h-8"
          >
            <SendHorizonal className="w-4 h-4" />
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-3 text-sm text-red-500 flex items-center justify-center gap-1.5 font-medium animate-fade-in">
           <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
    </div>
  );
}
