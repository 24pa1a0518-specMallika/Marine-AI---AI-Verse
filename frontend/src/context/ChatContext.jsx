import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { analyzeMarineQuery, generateDynamicMarineFallback } from '../api/aiApi';
import { useLocation } from './LocationContext';
import { useLanguage } from './LanguageContext';

const ChatContext = createContext();

export const createHelloGreeting = (locationName = 'Bay of Bengal', lang = 'EN') => {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let text = `Hello Captain! 🌊 I am Marine AI, your real-time maritime intelligence copilot.\n\nLive oceanographic telemetry for ${locationName} is active and synchronized with INCOIS and IMD marine forecasts. How can I assist your vessel today? Inquire about high-potential fishing zones (PFZ), safety risk scores, or safe navigational routes.`;

  if (lang === 'TE') {
    text = `నమస్కారం కెప్టెన్! 🌊 నేను మెరైన్ AI, మీ రియల్ టైమ్ సముద్ర సలహాదారుని.\n\n${locationName} కోసం INCOIS మరియు IMD సమాచారం సమకాలీకరించబడింది. ఈ రోజు మీ ప్రయాణానికి లేదా వేటకు నేను ఎలా సహాయపడగలను?`;
  } else if (lang === 'TA') {
    text = `வணக்கம் கேப்டன்! 🌊 நான் Marine AI, உங்கள் கடல்சார் நுண்ணறிவு உதவியாளர்.\n\n${locationName} பகுதிக்குரிய INCOIS மற்றும் IMD நேரலைத் தரவுகள் தயாராக உள்ளன. இன்று உங்கள் படகுப் பயணத்திற்கு நான் எவ்வாறு உதவ முடியும்?`;
  } else if (lang === 'HI') {
    text = `नमस्ते कैप्टन! 🌊 मैं मरीन AI, आपका रीयल-टाइम समुद्री इंटेलिजेंस को-पायलट हूँ।\n\n${locationName} के लिए INCOIS और IMD डेटा सक्रिय है। आज मैं आपकी यात्रा या मछली पकड़ने के मार्ग में क्या सहायता कर सकता हूँ?`;
  }

  return {
    id: `greeting-${Date.now()}`,
    sender: 'ai',
    time: now,
    text,
    status: 'SAFE',
    actionText: 'Explore PFZ Zones',
    actionType: 'map',
    isGreeting: true
  };
};

export function ChatProvider({ children }) {
  const { selectedLocation } = useLocation();
  const { language } = useLanguage();

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('marine_ai_chat_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if session contains old static dummy questions, if so purge
          const hasOldStatic = parsed.some(
            (m) => m.id === 'msg-init-1' || (typeof m.text === 'string' && m.text.includes('Where is the nearest high potential PFZ'))
          );
          if (!hasOldStatic) return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not restore chat session:', e);
    }
    return [createHelloGreeting(selectedLocation?.name || 'Bay of Bengal', language)];
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Synchronize with sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('marine_ai_chat_session', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist chat session:', e);
    }
  }, [messages]);

  // Check speech recognition capability
  useEffect(() => {
    const hasSTT = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const hasTTS = 'speechSynthesis' in window;
    setSpeechSupported(hasSTT && hasTTS);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speakMessage = useCallback((text, targetLang = language) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langCode = targetLang === 'TE' ? 'te-IN' : (targetLang === 'TA' ? 'ta-IN' : (targetLang === 'HI' ? 'hi-IN' : 'en-US'));
    utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase()));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const sendMessage = useCallback(async (queryText) => {
    if (!queryText || !queryText.trim() || isProcessing) return;

    const trimmed = queryText.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      time: now,
      text: trimmed
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const activeLat = selectedLocation?.lat ?? 16.98;
      const activeLon = selectedLocation?.lon ?? 82.24;

      const aiResult = await analyzeMarineQuery({
        query: trimmed,
        userLocation: {
          latitude: activeLat,
          longitude: activeLon
        },
        language: language.toLowerCase()
      });

      const resData = aiResult.data || aiResult;
      const responseText = resData.formattedAnswer || resData.answer || resData.reason || 'Telemetry analysis complete.';
      
      // ONLY attach safety decision status if this is a safety query or intent is FISHING_SAFETY or RISK
      const isSafety = Boolean(
        resData.isSafetyQuery ?? 
        (resData.intent === 'FISHING_SAFETY' || resData.intent === 'RISK')
      );
      const status = isSafety && resData.decisionStatus ? resData.decisionStatus : null;

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: responseText,
        status,
        actionText: isSafety ? 'Plot Safe Route' : (resData.intent === 'PFZ' ? 'Show on Map' : null),
        actionType: isSafety ? 'route' : (resData.intent === 'PFZ' ? 'map' : null),
        isFallback: !!aiResult.isFallback,
        rawData: resData
      };

      setMessages((prev) => [...prev, aiMsg]);
      return aiMsg;
    } catch (err) {
      console.warn('AI analysis error, providing dynamic marine fallback:', err);
      const activeLat = selectedLocation?.lat ?? 16.98;
      const activeLon = selectedLocation?.lon ?? 82.24;
      const fallbackResult = generateDynamicMarineFallback({
        query: trimmed,
        userLocation: { latitude: activeLat, longitude: activeLon },
        language: language.toLowerCase()
      });

      const isSafety = fallbackResult.isSafetyQuery;
      const fallbackMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: fallbackResult.answer,
        status: isSafety ? (fallbackResult.decisionStatus || 'SAFE') : null,
        actionText: isSafety ? 'Plot Safe Route' : (fallbackResult.intent === 'PFZ' ? 'Show on Map' : null),
        actionType: isSafety ? 'route' : (fallbackResult.intent === 'PFZ' ? 'map' : null),
        isFallback: true,
        rawData: fallbackResult
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      return fallbackMsg;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, language, selectedLocation]);

  const clearChat = useCallback(() => {
    const greeting = createHelloGreeting(selectedLocation?.name || 'Bay of Bengal', language);
    setMessages([greeting]);
    try {
      sessionStorage.setItem('marine_ai_chat_session', JSON.stringify([greeting]));
    } catch (e) {
      console.warn('Failed to clear chat session:', e);
    }
  }, [selectedLocation, language]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        clearChat,
        isProcessing,
        isSpeaking,
        speakMessage,
        stopSpeaking,
        speechSupported
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export default ChatContext;
