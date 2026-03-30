'use client';

import { Sparkles, Send, Store, Sunrise, Waves } from 'lucide-react';
import { useState } from 'react';

export default function CreateItineraryPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Halo! Saya asisten perjalanan pribadimu. Mau ke mana dan apa preferensimu?',
      timestamp: 'TAPROUTE AI • JUST NOW',
    }
  ]);

  const preferences = [
    { label: 'Cari UMKM Lokal', icon: Store, value: 'umkm' },
    { label: 'Budaya', icon: Sunrise, value: 'culture' },
    { label: 'Pantai', icon: Waves, value: 'beach' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-2rem)] p-4 md:p-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full relative">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto w-full pb-32 space-y-8 no-scrollbar pt-4">
          
          {messages.map((msg, i) => (
            <div key={i} className="flex gap-4">
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-greenDark flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                  <Sparkles size={16} className="text-white" />
                </div>
              )}
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end w-full' : 'items-start'}`}>
                <div className={`${
                  msg.role === 'assistant' 
                    ? 'bg-beigeLight border border-gray-100/50' 
                    : 'bg-greenDark text-white'
                  } rounded-2xl p-5 mb-2 max-w-md shadow-sm text-[15px] font-medium leading-relaxed`}
                >
                  {msg.text}
                </div>
                
                {msg.role === 'assistant' && (
                  <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 pl-2">
                    {msg.timestamp}
                  </span>
                )}

                {/* Preference Chips (hanya muncul di bubble assistant pertama/spesifik) */}
                {msg.role === 'assistant' && i === 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 ml-2">
                    {preferences.map((pref, idx) => {
                      const Icon = pref.icon;
                      return (
                        <button key={idx} onClick={() => setMessages([...messages, { role: 'user', text: `Saya ingin liburan dengan tipe ${pref.label}.`, timestamp: 'JUST NOW'}])} className="flex items-center gap-2 bg-white hover:bg-beigeLight border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm">
                          <Icon size={14} className="text-greenDark" />
                          <span>{pref.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

        </div>

        {/* Input Form Fixed Bottom Area */}
        <div className="absolute bottom-4 left-0 right-0 w-full">
          <div className="bg-white p-2 md:p-3 rounded-[2rem] shadow-xl shadow-greenDark/5 border border-gray-100 flex items-center relative">
            <input 
              type="text" 
              placeholder="Ketik rencana perjalananmu di sini..." 
              className="w-full bg-transparent px-6 py-4 outline-none text-sm font-medium placeholder:text-gray-400"
            />
            <button className="bg-greenDark hover:bg-[#20401b] w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0 transition-transform active:scale-95 shadow-md absolute right-2">
              <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
            </button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">Powered by Taproute GPT-4 Premium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
