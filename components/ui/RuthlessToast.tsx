"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getUnreadAccountabilityMessages,
  markAccountabilityMessageAsRead,
  runAuditor,
} from "@/app/actions/accountability";
import { Skull, AlertTriangle, ChevronRight, Trophy, Sparkles, X } from "lucide-react";

type Message = {
  id: string;
  message: string;
  isAllClear: boolean;
};

export function RuthlessToast() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    async function initAuditor() {
      await runAuditor();
      const unread = await getUnreadAccountabilityMessages();
      if (unread && (unread as any[]).length > 0) {
        const parsed = (unread as any[]).map((m) => {
          const isAllClear = m.message.startsWith("[ALL_CLEAR]");
          return {
            id: m.id,
            message: isAllClear ? m.message.replace("[ALL_CLEAR]", "") : m.message,
            isAllClear,
          };
        });
        setMessages(parsed);
        // Small delay so the slide-in animation is visible
        setTimeout(() => setVisible(true), 300);
      }
    }
    initAuditor();
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!visible || messages.length === 0) return;

    const fullText = messages[currentIndex]?.message || "";
    setDisplayedText("");
    setIsTyping(true);

    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [visible, currentIndex, messages]);

  const dismissCurrent = useCallback(async () => {
    const msg = messages[currentIndex];
    if (!msg) return;

    await markAccountabilityMessageAsRead(msg.id);

    if (currentIndex < messages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setVisible(false);
      setTimeout(() => {
        setMessages([]);
        setCurrentIndex(0);
      }, 400);
    }
  }, [messages, currentIndex]);

  if (messages.length === 0) return null;

  const current = messages[currentIndex];
  const isAllClear = current.isAllClear;

  return (
    <div
      className={`fixed bottom-5 right-5 z-[999] w-full max-w-sm transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      {/* Glowing border */}
      <div
        className="absolute -inset-[1px] rounded-xl opacity-50"
        style={{
          background: isAllClear
            ? "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)"
            : "linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)",
          animation: "ruthless-border-glow 4s ease-in-out infinite",
        }}
      />

      <div className="relative bg-zinc-950/95 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl">
        {/* Top accent line */}
        <div
          className="h-[2px] w-full"
          style={{
            background: isAllClear
              ? "linear-gradient(90deg, transparent, #34d399, #10b981, #34d399, transparent)"
              : "linear-gradient(90deg, transparent, #ef4444, #dc2626, #ef4444, transparent)",
          }}
        />

        {/* Header */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                isAllClear
                  ? "bg-emerald-950/80 border-emerald-800/50"
                  : "bg-red-950/80 border-red-800/50"
              }`}
            >
              {isAllClear ? (
                <Trophy className="w-4 h-4 text-emerald-500" />
              ) : (
                <Skull className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div>
              <h3
                className={`text-[10px] font-bold uppercase tracking-[0.25em] ${
                  isAllClear ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {isAllClear ? "All Streaks Intact" : "Accountability Breach"}
              </h3>
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest">
                {isAllClear ? "The Coach is impressed" : "The Enforcer has spoken"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <span className="text-[9px] text-zinc-500 font-mono border border-zinc-800 rounded px-1.5 py-0.5">
                {currentIndex + 1}/{messages.length}
              </span>
            )}
            <button
              onClick={dismissCurrent}
              className="text-zinc-600 hover:text-zinc-300 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Body */}
        <div className="px-4 py-3">
          <div className="flex gap-2 items-start">
            {isAllClear ? (
              <Sparkles className="w-3.5 h-3.5 text-emerald-700/60 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-red-700/60 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-zinc-300 text-xs leading-relaxed font-mono min-h-[36px]">
              {displayedText}
              {isTyping && (
                <span
                  className={`inline-block w-[1.5px] h-3 ml-[1px] align-text-bottom ${
                    isAllClear ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  style={{ animation: "ruthless-blink 0.6s step-end infinite" }}
                />
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <p className="text-[9px] text-zinc-700 italic">
            {isAllClear ? "Sent begrudgingly." : "Sent involuntarily."}
          </p>

          {currentIndex < messages.length - 1 ? (
            <button
              onClick={dismissCurrent}
              className={`group flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider
                rounded-md transition-all duration-300 border ${
                  isAllClear
                    ? "bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 border-emerald-900/40"
                    : "bg-red-950/50 hover:bg-red-900/60 text-red-400 border-red-900/40"
                }`}
            >
              Next
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <button
              onClick={dismissCurrent}
              className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider
                text-white rounded-md transition-all duration-300 ${
                  isAllClear
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
            >
              {isAllClear ? "I know." : "Fine, I'll do it."}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
