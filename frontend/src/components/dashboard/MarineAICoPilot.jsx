import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useLanguage } from '../../context/LanguageContext';

export default function MarineAICoPilot({ onNavigateToRoute }) {
  const { 
    messages, 
    sendMessage, 
    isProcessing, 
    isSpeaking, 
    speakMessage, 
    stopSpeaking,
    speechSupported
  } = useChat();

  const { language, t } = useLanguage();

  const [inputText, setInputText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [voiceNotice, setVoiceNotice] = useState(null);

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;
    const text = inputText.trim();
    setInputText('');
    await sendMessage(text);
  };

  const handleMicToggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice(t('voice_unsupported') || 'Speech recognition not supported in this browser.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langCode = language === 'TE' ? 'te-IN' : (language === 'TA' ? 'ta-IN' : (language === 'HI' ? 'hi-IN' : 'en-US'));
      recognition.lang = langCode;
      recognition.interimResults = false;

      setIsListening(true);
      setVoiceNotice(null);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          sendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.warn('SpeechRecognition error:', e);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setVoiceNotice(t('voice_mic_denied') || 'Microphone permission required for speech.');
        } else {
          setVoiceNotice(t('voice_unsupported') || 'Could not recognize speech.');
        }
        setTimeout(() => setVoiceNotice(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition exception:', err);
      setIsListening(false);
      setVoiceNotice(t('voice_unsupported') || 'Speech recognition not available.');
      setTimeout(() => setVoiceNotice(null), 4000);
    }
  };

  const handleSpeakToggle = (msgId, text) => {
    if (isSpeaking && speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      speakMessage(text, language);
    }
  };

  const renderStatusBadge = (status) => {
    if (status === 'SAFE') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3" />
          {t('safe') || 'SAFE'}
        </span>
      );
    }
    if (status === 'CAUTION') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3" />
          {t('caution') || 'CAUTION'}
        </span>
      );
    }
    if (status === 'NOT SAFE') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3 h-3" />
          {t('not_safe') || 'NOT SAFE'}
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`bg-[#132C40] rounded-2xl border border-[#1E3F5A] shadow-xl p-5 flex flex-col justify-between transition-all ${
      isCollapsed ? 'h-[72px]' : 'h-[520px]'
    }`}>
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E3F5A] shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#D8D2C2] flex items-center gap-1.5">
            <span>{t('copilot_title') || 'MARINE AI COPILOT'}</span>
            <MessageSquare className="w-4 h-4 text-[#C9A961]" />
          </h2>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E7C6B] animate-pulse"></span>
            <span className="text-[10px] text-[#3E7C6B] font-mono">
              {isProcessing ? (language === 'TE' ? 'విశ్లేషిస్తోంది...' : 'Analyzing...') : (language === 'TE' ? 'క్రియాశీలం' : 'Active')}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#8EA5B5] hover:text-[#D8D2C2] p-1 rounded-lg transition-colors cursor-pointer"
          title={isCollapsed ? "Expand Copilot" : "Collapse Copilot"}
          id="copilot-collapse-btn"
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* VOICE NOTIFICATION BANNER */}
          {voiceNotice && (
            <div className="bg-[#C9A961]/20 border border-[#C9A961]/40 text-[#C9A961] text-xs px-3 py-1.5 rounded-lg my-1 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span>{voiceNotice}</span>
            </div>
          )}

          {/* CHAT MESSAGES LOG (PERSISTENT VIA CHATCONTEXT) */}
          <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1">
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex flex-col items-end">
                    <span className="text-[10px] text-[#8EA5B5] font-mono mb-1">{msg.time}</span>
                    <div className="bg-[#143B5C] text-[#D8D2C2] border border-[#205388] text-xs px-3.5 py-2 rounded-xl rounded-tr-none shadow-xs max-w-[85%] font-medium leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              const isThisSpeaking = isSpeaking && speakingMsgId === msg.id;

              return (
                <div key={msg.id} className="flex flex-col items-start">
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#8EA5B5] font-mono">{msg.time}</span>
                      {msg.status && renderStatusBadge(msg.status)}
                      {msg.isFallback && (
                        <span className="text-[9px] text-[#C9A961] font-mono border border-[#C9A961]/30 px-1 rounded">
                          {t('source_fallback') || 'Offline'}
                        </span>
                      )}
                    </div>

                    {/* READ ALOUD AUDIO BUTTON (REQ 3) */}
                    <button
                      onClick={() => handleSpeakToggle(msg.id, msg.text)}
                      className={`p-1 rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                        isThisSpeaking
                          ? 'text-[#3E7C6B] bg-[#3E7C6B]/20 font-bold animate-pulse'
                          : 'text-[#8EA5B5] hover:text-[#D8D2C2] hover:bg-[#183852]'
                      }`}
                      title={isThisSpeaking ? (t('stop_audio') || 'Stop Voice') : (t('listen_response') || 'Read Aloud')}
                    >
                      {isThisSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="bg-[#0B1E2D] text-[#D8D2C2] border border-[#1E3F5A] text-xs p-3.5 rounded-xl rounded-tl-none shadow-xs max-w-[95%] space-y-2.5">
                    <p className="leading-relaxed whitespace-pre-line font-sans">
                      {msg.text}
                    </p>

                    {msg.actionText && (
                      <div>
                        <button
                          onClick={onNavigateToRoute}
                          className="w-full py-1.5 px-3 bg-transparent hover:bg-[#C9A961]/15 text-[#C9A961] border border-[#C9A961]/40 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>📖 {t('plot_safe_route') || msg.actionText}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* INPUT AREA WITH VOICE SPEECH RECOGNITION (REQ 3) */}
          <div className="pt-2 border-t border-[#1E3F5A] shrink-0 space-y-1.5">
            {isListening && (
              <div className="flex items-center gap-2 text-[#B8543C] text-xs font-semibold px-2">
                <span className="w-2 h-2 rounded-full bg-[#B8543C] animate-ping"></span>
                <span>{t('listening') || 'Listening (Speak question now)...'}</span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-[#0B1E2D] border border-[#1E3F5A] rounded-xl px-3.5 py-2.5 focus-within:border-[#C9A961] transition-all">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('ask_placeholder') || 'Ask Marine AI anything (e.g. Can I go fishing here?)...'}
                className="flex-1 bg-transparent text-[#D8D2C2] placeholder-[#8EA5B5] text-xs focus:outline-none"
                disabled={isProcessing}
                id="copilot-text-input"
              />

              {/* VOICE MIC BUTTON */}
              <button
                onClick={handleMicToggle}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isListening
                    ? 'bg-[#B8543C] text-white animate-pulse'
                    : 'text-[#C9A961] hover:text-[#D8D2C2] hover:bg-[#183852]'
                }`}
                title={isListening ? (t('stop_listening') || 'Stop Listening') : (t('voice_input') || 'Voice Input (Speak question)')}
                id="copilot-mic-btn"
                type="button"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* SEND BUTTON - DOMINANT BRASS ACCENT (#C9A961) */}
              <button
                onClick={handleSend}
                disabled={isProcessing || !inputText.trim()}
                className="w-7 h-7 rounded-lg bg-[#C9A961] hover:bg-[#D4BA7A] text-[#0B1E2D] font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-40"
                id="copilot-send-btn"
                title={t('send') || 'Send'}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
