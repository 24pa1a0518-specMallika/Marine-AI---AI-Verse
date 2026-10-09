import React, { useState } from 'react';
import ProcessingPipeline from '../components/assistant/ProcessingPipeline';
import AIResponseCard from '../components/assistant/AIResponseCard';
import FleetContextSidebar from '../components/assistant/FleetContextSidebar';
import { Send, Mic, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeMarineQuery } from '../api/aiApi';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';

export default function AIAssistantPage() {
  const { selectedLocation } = useLocation();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: 'greeting-init',
      type: 'ai',
      data: {
        decisionStatus: null,
        safetyScore: null,
        riskScore: null,
        riskLevel: null,
        nearestPfz: null,
        pfzDistance: null,
        reason: 'Ready to analyze marine telemetry and conditions.',
        formattedAnswer: `Hello Captain! 🌊 I am Marine AI, your real-time maritime intelligence copilot.\n\nTelemetry for ${selectedLocation?.name || 'Bay of Bengal'} is active and synchronized. How can I assist your vessel today? Inquire about high-potential fishing zones (PFZ), safety risk assessment, or safe navigational routes.`,
        geofence: null
      }
    }
  ]);

  const handleSend = async (queryToSend) => {
    const userQuery = (queryToSend || inputText).trim();
    if (!userQuery || isProcessing) return;

    const userMsg = { id: Date.now(), type: 'user', text: userQuery };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await analyzeMarineQuery({
        query: userQuery,
        userLocation: {
          latitude: selectedLocation?.lat || 16.98,
          longitude: selectedLocation?.lon || 82.24
        },
        language: language.toLowerCase()
      });

      const aiData = res.data || res;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          data: aiData
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          data: {
            decisionStatus: 'UNKNOWN',
            safetyScore: null,
            riskScore: null,
            riskLevel: 'Unknown',
            reason: 'Live network link offline; unable to fetch local advisory assessment.',
            formattedAnswer: 'STATUS: UNKNOWN\nRisk: Unknown (Offline)\nReason: Live telemetry unavailable.',
            geofence: null
          }
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickChip = (chipText) => {
    const locName = selectedLocation?.name || 'Selected Coastal Area';
    const query = `${chipText} around ${locName}`;
    setInputText(query);
    handleSend(query);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#D8D2C2] tracking-tight">
            Marine AI Maritime Assistant
          </h1>
          <p className="text-xs md:text-sm text-[#8EA5B5] mt-0.5">
            Real-time advisory powered by INCOIS oceanography and IMD marine forecasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-mono bg-[#132C40] text-[#D8D2C2] px-3 py-1 rounded-lg border border-[#1E3F5A]">
            <MapPin className="w-3.5 h-3.5 text-[#C9A961]" />
            <span>{selectedLocation?.name} ({selectedLocation?.lat?.toFixed(2)}°, {selectedLocation?.lon?.toFixed(2)}°)</span>
          </span>
          <span className="text-xs font-mono bg-[#C9A961]/15 text-[#C9A961] px-2.5 py-1 rounded-lg border border-[#C9A961]/30 font-bold">
            {language}
          </span>
        </div>
      </div>

      {/* 2-COLUMN MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT MAIN CHAT COLUMN (8/12 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* CHAT STREAM CONTAINER */}
          <div className="space-y-6 min-h-[420px]">
            {messages.map((msg) => {
              if (msg.type === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="bg-[#143B5C] text-[#D8D2C2] border border-[#205388] text-xs px-4 py-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] font-medium leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="space-y-2">
                  <AIResponseCard
                    data={msg.data}
                    onViewAnalysis={() => navigate('/safety-risk')}
                    onShowRoute={() => navigate('/safe-routes', { state: { targetDate: msg.data.targetDate } })}
                  />
                </div>
              );
            })}

            {/* PROCESSING PIPELINE */}
            {isProcessing && <ProcessingPipeline />}
          </div>

          {/* CHAT INPUT AREA & QUICK CHIPS */}
          <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-4 space-y-3 sticky bottom-4 z-10">
            {/* QUICK SUGGESTION CHIPS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              {['Can I go fishing here?', 'Is it safe to go?', 'Nearest PFZ zone', 'Sea conditions & waves', 'Safe route coordinates'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleQuickChip(chip)}
                  className="bg-[#0B1E2D] hover:bg-[#1E3F5A] text-[#8EA5B5] hover:text-[#D8D2C2] text-[11px] font-mono px-3 py-1 rounded-full border border-[#1E3F5A] shrink-0 transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* INPUT FIELD BOX */}
            <div className="flex items-center gap-2 bg-[#0B1E2D] border border-[#1E3F5A] rounded-xl px-3.5 py-2.5 focus-within:border-[#C9A961] transition-all">
              <button
                type="button"
                className="text-[#C9A961] hover:text-[#D4BA7A] cursor-pointer"
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask e.g. 'Can I go fishing today?', 'Is it safe?'..."
                className="flex-1 bg-transparent text-xs text-[#D8D2C2] placeholder-[#8EA5B5]/60 focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={isProcessing || !inputText.trim()}
                className="w-8 h-8 rounded-lg bg-[#C9A961] hover:bg-[#D4BA7A] text-[#0B1E2D] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FLEET CONTEXT SIDEBAR (4/12 COLS) */}
        <div className="lg:col-span-4">
          <FleetContextSidebar />
        </div>
      </div>
    </div>
  );
}
