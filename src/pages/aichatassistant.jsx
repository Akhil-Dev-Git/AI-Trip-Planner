import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Compass, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Clock,
  Briefcase,
  Coffee
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

const API_BASE = "http://127.0.0.1:5001/api";

export default function AIChatAssistant() {
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const hasSentPrefill = useRef(false);
  
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your AI Travel Guide. How can I help you plan your next journey today?"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  // Parse markdown styling into basic HTML
  const parseMarkdown = (text) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    html = html.replace(/^### (.*?)$/gm, '<h4 class="text-sm font-bold text-gray-900 mt-2 mb-1">$1</h4>');
    html = html.replace(/^## (.*?)$/gm, '<h3 class="text-base font-bold text-gray-900 mt-3 mb-1.5">$1</h3>');
    html = html.replace(/^# (.*?)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    html = html.replace(/^\s*-\s+(.*?)$/gm, '<li class="ml-4 list-disc text-gray-700 my-0.5">$1</li>');
    html = html.replace(/^\s*\*\s+(.*?)$/gm, '<li class="ml-4 list-disc text-gray-700 my-0.5">$1</li>');
    html = html.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<li class="ml-4 list-decimal text-gray-700 my-0.5">$2</li>');

    const lines = html.split('\n');
    let insideList = false;
    const formattedLines = lines.map(line => {
      const isList = line.trim().startsWith('<li');
      if (isList && !insideList) {
        insideList = true;
        return '<ul class="space-y-0.5 my-1">' + line;
      }
      if (!isList && insideList) {
        insideList = false;
        return '</ul>' + (line.trim() ? `<p class="mb-2 text-gray-700 leading-relaxed text-sm">${line}</p>` : '');
      }
      if (line.trim().startsWith('<h')) {
        return line;
      }
      return line.trim() ? `<p class="mb-2 text-gray-700 leading-relaxed text-sm">${line}</p>` : '';
    });
    
    if (insideList) {
      formattedLines.push('</ul>');
    }

    return formattedLines.join('\n');
  };

  // Load models on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoadingModels(true);
        const response = await fetch(`${API_BASE}/ai/models`);
        const data = await response.json();
        setModels(data.models || []);
        setIsOnline(data.online || false);
        
        if (data.models && data.models.length > 0) {
          // Prefer coder or 8b model if available, otherwise first
          const preferred = data.models.find(m => m.includes("qwen3") || m.includes("8b")) || data.models[0];
          setSelectedModel(preferred);
        }
      } catch (err) {
        console.error("Failed to load models:", err);
        setIsOnline(false);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  // Handle URL prefill context
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const place = params.get("place");
    if (place && !hasSentPrefill.current) {
      hasSentPrefill.current = true;
      const prompt = `Suggest a detailed 3-day itinerary for a trip to ${place}.`;
      setInputText(prompt);
      // Wait slightly for model loading state before sending
      const timer = setTimeout(() => {
        handleSend(null, prompt);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [location.search, selectedModel]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async (e, customPrompt) => {
    if (e) e.preventDefault();
    const prompt = customPrompt || inputText;
    if (!prompt.trim() || isSending) return;

    setInputText("");
    const newMessages = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setIsSending(true);

    // Add an empty assistant message which we will populate chunk-by-chunk
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel || "qwen3:latest",
          messages: newMessages
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finished = false;
      let assistantText = "";

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.trim().startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.trim().slice(6));
              if (parsed.error) {
                assistantText = `Error: ${parsed.error}`;
                finished = true;
                break;
              }
              if (parsed.content) {
                assistantText += parsed.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantText
                  };
                  return updated;
                });
              }
              if (parsed.done) {
                finished = true;
                break;
              }
            } catch (e) {
              // Ignore partial chunk parse failures
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Error: Could not connect to the server. Please verify the application backend is active and running."
        };
        return updated;
      });
    } finally {
      setIsSending(false);
    }
  };

  const presetSuggestions = [
    { text: "Suggest a 3-day adventure itinerary for Wayanad", icon: Compass },
    { text: "Suggest packing tips and guidelines for Solo travel", icon: Briefcase },
    { text: "Top 5 street foods to try in Old Delhi", icon: Coffee },
    { text: "Help me budget a trip to Tokyo on a ₹50,000 budget", icon: Clock }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col realistic-bg">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
              AI Travel Assistant
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Interactive travel planner and itinerary guide for your journeys
            </p>
          </div>

          <div className="flex items-center bg-white p-2 rounded-xl shadow-sm border border-blue-50/50">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold">
              {isOnline ? (
                <span className="flex items-center gap-1 text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> Assistant: Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" /> Assistant: Offline
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chat window */}
        <Card className="flex-1 flex flex-col min-h-[500px] shadow-md border-blue-100/50 glass-panel overflow-hidden">
          <CardContent className="flex-1 p-0 flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[55vh]">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-teal-500 text-white' 
                      : 'bg-white border border-blue-100 text-blue-500'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-tr-none'
                      : 'bg-white/95 border border-blue-50 text-gray-800 rounded-tl-none'
                  }`}>
                    <div 
                      className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white' : ''}`}
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                    />
                  </div>
                </div>
              ))}
              
              {isSending && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-white border border-blue-100 text-blue-500 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/90 border border-blue-50 text-gray-500 rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions (rendered when chat is short) */}
            {messages.length === 1 && !isSending && (
              <div className="px-6 pb-6 pt-2 border-t border-blue-50/50 bg-blue-50/10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  Quick Suggestion Prompts
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {presetSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(null, suggestion.text)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-blue-100/50 bg-white/70 hover:bg-white hover:border-blue-300 hover:shadow-sm text-left transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <suggestion.icon className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-xs text-gray-700 font-medium leading-normal">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 border-t border-blue-100 bg-white/95">
              <form onSubmit={(e) => handleSend(e, null)} className="flex items-center gap-3">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    !isOnline 
                      ? "The Travel Assistant is currently offline. Please try again later..." 
                      : "Ask anything about itineraries, packing, or travel planning..."
                  }
                  className="flex-1 bg-gray-50 border-0 focus:bg-white focus:ring-1 focus:ring-blue-300 text-sm py-5 rounded-xl text-gray-800"
                  disabled={isSending || !isOnline}
                />
                <Button 
                  type="submit" 
                  disabled={!inputText.trim() || isSending || !isOnline}
                  className="rounded-xl px-5 py-5 bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
