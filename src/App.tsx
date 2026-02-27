import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MessageSquare, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Send, 
  Loader2, 
  ChevronRight,
  BookOpen,
  History,
  CheckCircle2,
  X,
  Mic,
  Music,
  FileAudio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeObjection } from './services/ai';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Script {
  title: string;
  content: string;
  logic: string;
}

interface CustomScript {
  id: number;
  objection_type: string;
  script_content: string;
  created_at: string;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [media, setMedia] = useState<{ base64: string; mime: string; type: 'image' | 'audio' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ objection_summary: string; scripts: Script[] } | null>(null);
  const [customScripts, setCustomScripts] = useState<CustomScript[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newCustom, setNewCustom] = useState({ type: '', content: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCustomScripts();
  }, []);

  const fetchCustomScripts = async () => {
    try {
      const res = await fetch('/api/scripts');
      const data = await res.json();
      setCustomScripts(data);
    } catch (err) {
      console.error('Error fetching scripts:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia({
          base64: (reader.result as string).split(',')[1],
          mime: file.type,
          type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!inputText && !media) return;
    setLoading(true);
    try {
      const data = await analyzeObjection({
        text: inputText,
        imageBase64: media?.type === 'image' ? media.base64 : undefined,
        audioBase64: media?.type === 'audio' ? media.base64 : undefined,
        mimeType: media?.mime
      });
      setResult(data);
    } catch (err) {
      console.error('Error generating scripts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustom = async () => {
    if (!newCustom.type || !newCustom.content) return;
    try {
      await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objection_type: newCustom.type,
          script_content: newCustom.content
        })
      });
      setNewCustom({ type: '', content: '' });
      setShowCustomForm(false);
      fetchCustomScripts();
    } catch (err) {
      console.error('Error saving script:', err);
    }
  };

  const handleDeleteCustom = async (id: number) => {
    try {
      await fetch(`/api/scripts/${id}`, { method: 'DELETE' });
      fetchCustomScripts();
    } catch (err) {
      console.error('Error deleting script:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-20 text-zinc-100">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-brand-primary shadow-lg shadow-orange-500/40 border-2 border-white/20 overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-8 h-8 text-white fill-current">
                {/* Speedometer background */}
                <path d="M20,70 A40,40 0 1,1 80,70" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
                {/* Speedometer needle/active part */}
                <path d="M20,70 A40,40 0 0,1 60,25" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                {/* Car silhouette simplified */}
                <path d="M30,75 L70,75 L65,60 L35,60 Z" />
                <circle cx="38" cy="78" r="4" />
                <circle cx="62" cy="78" r="4" />
                <path d="M40,60 L45,50 L55,50 L60,60" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter leading-none uppercase italic">
                Chicar<span className="text-brand-primary">Expert</span>
              </h1>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] leading-none">
                Consórcios
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowCustomForm(true)}
            className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:bg-orange-500/10 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Cadastrar Script
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input and Results */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Input Section */}
          <section className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={20} className="text-brand-primary" />
              <h2 className="font-semibold text-zinc-100">Nova Objeção de Consórcio</h2>
            </div>
            
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite a objeção do cliente... (ex: 'Prefiro financiamento', 'Demora muito para sair')"
                className="w-full h-32 p-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all resize-none text-zinc-100 placeholder:text-zinc-600"
              />
              
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => handleFileUpload(e, 'image')} 
                  accept="image/*" 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={audioInputRef} 
                  onChange={(e) => handleFileUpload(e, 'audio')} 
                  accept="audio/*" 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-2 rounded-lg transition-colors border",
                    media?.type === 'image' ? "bg-orange-500/20 text-brand-primary border-orange-500/30" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border-zinc-700"
                  )}
                  title="Anexar print da objeção"
                >
                  <ImageIcon size={20} />
                </button>

                <button 
                  onClick={() => audioInputRef.current?.click()}
                  className={cn(
                    "p-2 rounded-lg transition-colors border",
                    media?.type === 'audio' ? "bg-orange-500/20 text-brand-primary border-orange-500/30" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border-zinc-700"
                  )}
                  title="Anexar áudio do cliente"
                >
                  <Mic size={20} />
                </button>
              </div>
            </div>

            {media && (
              <div className="flex items-center justify-between bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  {media.type === 'image' ? <ImageIcon size={16} /> : <FileAudio size={16} />}
                  <span>{media.type === 'image' ? 'Imagem' : 'Áudio'} anexado com sucesso</span>
                </div>
                <button onClick={() => setMedia(null)} className="text-orange-400 hover:text-orange-300">
                  <X size={16} />
                </button>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={loading || (!inputText && !media)}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analisando Objeção...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Gerar Scripts de Contorno
                </>
              )}
            </button>
          </section>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 px-2">
                  <Search size={20} className="text-brand-primary" />
                  <h3 className="font-bold text-lg text-zinc-100">Mapa de Respostas: <span className="text-zinc-500 font-normal italic">{result.objection_summary}</span></h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {result.scripts.map((script, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card p-6 border-l-4 border-l-brand-primary"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-orange-100">{script.title}</h4>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded">IA Sugestão</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed mb-4 italic">"{script.content}"</p>
                      <div className="bg-black/40 p-3 rounded-lg border border-zinc-800">
                        <p className="text-xs text-brand-primary font-medium uppercase mb-1 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Por que funciona no Consórcio?
                        </p>
                        <p className="text-sm text-zinc-400">{script.logic}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Custom Scripts / History */}
        <div className="lg:col-span-4 space-y-6">
          <section className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History size={20} className="text-brand-primary" />
                <h2 className="font-semibold text-zinc-100">Meus Scripts</h2>
              </div>
              <span className="text-xs font-bold text-zinc-500">{customScripts.length}</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {customScripts.length === 0 ? (
                <div className="text-center py-8 text-zinc-600">
                  <p className="text-sm">Nenhum script cadastrado ainda.</p>
                </div>
              ) : (
                customScripts.map((s) => (
                  <div key={s.id} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 group relative">
                    <button 
                      onClick={() => handleDeleteCustom(s.id)}
                      className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <h5 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">{s.objection_type}</h5>
                    <p className="text-sm text-zinc-400 line-clamp-3 italic">"{s.script_content}"</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="font-bold mb-2 text-brand-primary">Dica de Especialista</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              No consórcio, a maior objeção é o tempo. Mostre que o consórcio é uma ferramenta de **construção de patrimônio** e não apenas uma compra imediata.
            </p>
          </div>
        </div>
      </main>

      {/* Custom Script Modal */}
      <AnimatePresence>
        {showCustomForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-zinc-100">Cadastrar Novo Script</h3>
                <button onClick={() => setShowCustomForm(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-1">Tipo de Objeção</label>
                  <input 
                    type="text" 
                    value={newCustom.type}
                    onChange={(e) => setNewCustom({ ...newCustom, type: e.target.value })}
                    placeholder="Ex: Taxa, Lance, Sorteio..."
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-1">Seu Script de Sucesso</label>
                  <textarea 
                    value={newCustom.content}
                    onChange={(e) => setNewCustom({ ...newCustom, content: e.target.value })}
                    placeholder="Escreva como você costuma responder..."
                    className="w-full h-32 p-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none resize-none text-zinc-100"
                  />
                </div>
                <button 
                  onClick={handleSaveCustom}
                  className="w-full btn-primary"
                >
                  Salvar no Mapa de Consórcio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}} />
    </div>
  );
}
