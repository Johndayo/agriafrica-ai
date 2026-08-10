import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { ChatSkeleton } from "@/components/SkeletonLoader";
import {
  Send,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  Wifi,
  ImagePlus,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ChatState = "IDLE" | "CONNECTING" | "STREAMING" | "ERROR";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Throttle/debounce hook — guards against rapid-fire API calls
// ---------------------------------------------------------------------------
// Uses a dual-layer approach: throttle window prevents rapid invocations,
// debounce ensures the final call fires after the quiet period.
// This prevents write amplification and ballooning API bills.
function useThrottledCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  throttleMs: number
): T {
  const lastFiredRef = useRef<number>(0);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    };
  }, []);

  return useCallback(
    (...args: unknown[]) => {
      const now = Date.now();
      const elapsed = now - lastFiredRef.current;

      // Throttle: block if within cooldown window
      if (elapsed < throttleMs) {
        // Debounce: schedule for when cooldown expires
        if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
        pendingTimerRef.current = setTimeout(() => {
          lastFiredRef.current = Date.now();
          callback(...args);
        }, throttleMs - elapsed);
        return;
      }

      // Fire immediately if cooldown has elapsed
      lastFiredRef.current = now;
      callback(...args);
    },
    [callback, throttleMs]
  ) as T;
}

// ---------------------------------------------------------------------------
// Auto-scroll hook — requestAnimationFrame-based smooth scroll
// ---------------------------------------------------------------------------
// Pins the chat container to the bottom during streaming using
// requestAnimationFrame for jank-free scrolling on low-end devices.
function useAutoScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number>(0);
  const activeRef = useRef(false);

  const scrollStep = useCallback(() => {
    if (!containerRef.current || !activeRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
    rafIdRef.current = requestAnimationFrame(scrollStep);
  }, []);

  const startScroll = useCallback(() => {
    activeRef.current = true;
    rafIdRef.current = requestAnimationFrame(scrollStep);
  }, [scrollStep]);

  const stopScroll = useCallback(() => {
    activeRef.current = false;
    cancelAnimationFrame(rafIdRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return { containerRef, startScroll, stopScroll };
}

// ---------------------------------------------------------------------------
// AskAI — Streaming Conversational Engine
// ---------------------------------------------------------------------------
export default function AskAI() {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const { containerRef, startScroll, stopScroll } = useAutoScroll();

  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatState, setChatState] = useState<ChatState>("IDLE");

  // Refs — mutable state that doesn't trigger re-renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamBufferRef = useRef("");
  const mountedRef = useRef(true);

  // Keep mountedRef in sync
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------
  const generateId = useCallback(
    () =>
      `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  const validateSession = useCallback(async (): Promise<boolean> => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session) {
      toastError(t.error_unauthorized);
      return false;
    }
    return true;
  }, [t.error_unauthorized, toastError]);

  // -----------------------------------------------------------------------
  // Stream response — SSE via POST to edge function
  // -----------------------------------------------------------------------
  // Uses fetch + ReadableStream (not EventSource) because the edge function
  // requires POST with a JSON body and Authorization header.
  // Wraps the chunk buffer in the IDLE → CONNECTING → STREAMING → IDLE
  // state machine, with ERROR on failure.
  const streamResponse = useCallback(
    async (userMessage: string) => {
      const isValid = await validateSession();
      if (!isValid) {
        setChatState("ERROR");
        return;
      }

      // Enter CONNECTING state
      setChatState("CONNECTING");
      streamBufferRef.current = "";

      const assistantId = generateId();

      // Add placeholder for assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        },
      ]);

      // Build conversation payload
      const payload = {
        conversation_id: "local-session",
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: userMessage },
        ],
      };

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("No active session");

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(payload),
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // Transition to STREAMING state
        setChatState("STREAMING");
        startScroll();

        // Read SSE stream via ReadableStream
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE lines — each line is prefixed with "data: "
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();

            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              const text = parsed.text as string | undefined;
              if (text && mountedRef.current) {
                streamBufferRef.current += text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: streamBufferRef.current }
                      : m
                  )
                );
              }
            } catch {
              // Skip malformed SSE chunks
            }
          }
        }

        // Stream complete — transition to IDLE
        if (mountedRef.current) {
          setChatState("IDLE");
          stopScroll();
          success(t.chat_response_complete);
        }
      } catch (err: unknown) {
        stopScroll();

        // User-initiated abort (stop button)
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          if (mountedRef.current) {
            setChatState("IDLE");
            // Clear the empty assistant placeholder on abort
            setMessages((prev) =>
              prev.filter((m) => m.id !== assistantId || m.content !== "")
            );
          }
          return;
        }

        // Network or server error
        if (mountedRef.current) {
          setChatState("ERROR");
          toastError(t.error_network);
          // Remove the empty assistant placeholder on error
          setMessages((prev) =>
            prev.filter((m) => m.id !== assistantId)
          );
        }
      } finally {
        abortControllerRef.current = null;
        streamBufferRef.current = "";
      }
    },
    [
      messages,
      t.error_network,
      t.error_unauthorized,
      t.chat_response_complete,
      toastError,
      success,
      validateSession,
      generateId,
      startScroll,
      stopScroll,
    ]
  );

  // -----------------------------------------------------------------------
  // Send handler — throttled to prevent rapid-fire API calls
  // -----------------------------------------------------------------------
  const handleSendRaw = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (chatState === "STREAMING" || chatState === "CONNECTING") return;

    // Add user message to conversation
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      },
    ]);
    setInput("");
    inputRef.current?.focus();

    // Initiate streaming response
    streamResponse(trimmed);
  }, [input, chatState, generateId, streamResponse]);

  // Throttled send — 800ms cooldown between sends
  const handleSend = useThrottledCallback(handleSendRaw, 800);

  // -----------------------------------------------------------------------
  // Suggestion handler
  // -----------------------------------------------------------------------
  const handleSuggestion = useCallback(
    (text: string) => {
      if (chatState === "STREAMING" || chatState === "CONNECTING") return;

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "user",
          content: text,
          timestamp: Date.now(),
        },
      ]);
      streamResponse(text);
    },
    [chatState, generateId, streamResponse]
  );

  // -----------------------------------------------------------------------
  // Stop generation — abort in-flight request, clear buffer
  // -----------------------------------------------------------------------
  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    streamBufferRef.current = "";
    stopScroll();
  }, [stopScroll]);

  // -----------------------------------------------------------------------
  // Keyboard handler — Enter to send (Shift+Enter for newline)
  // -----------------------------------------------------------------------
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // -----------------------------------------------------------------------
  // State badge — visual indicator of connection state
  // -----------------------------------------------------------------------
  const stateBadge = useMemo(() => {
    switch (chatState) {
      case "CONNECTING":
        return (
          <span className="chat-badge chat-badge-connecting">
            {t.loading}
          </span>
        );
      case "STREAMING":
        return (
          <span className="chat-badge chat-badge-streaming">
            {t.chat_streaming}
          </span>
        );
      case "ERROR":
        return (
          <span className="chat-badge chat-badge-error">
            <AlertCircle size={14} /> {t.error_network}
          </span>
        );
      default:
        return (
          <span className="chat-badge chat-badge-idle">
            <Wifi size={14} /> {t.online}
          </span>
        );
    }
  }, [chatState, t]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="chat-page">
      {/* Header with state badge */}
      <header className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-logo">AI</div>
          <h1 className="chat-header-title">{t.app_name}</h1>
        </div>
        <div className="chat-header-right">{stateBadge}</div>
      </header>

      {/* Messages container — scrollable, rAF-pinned during streaming */}
      <div ref={containerRef} className="chat-messages">
        {messages.length === 0 && chatState === "IDLE" ? (
          /* Empty state with suggestion pills */
          <div className="chat-empty">
            <Sparkles className="chat-empty-icon" size={64} />
            <h2 className="chat-empty-title">{t.chat_empty_title}</h2>
            <p className="chat-empty-subtitle">{t.chat_empty_subtitle}</p>
            <div className="chat-suggestions">
              {[
                t.chat_suggestion_1,
                t.chat_suggestion_2,
                t.chat_suggestion_3,
                t.chat_suggestion_4,
              ].map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestion(text)}
                  className="chat-suggestion-pill"
                  style={{ touchAction: "manipulation" }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message bubbles */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${
                msg.role === "user"
                  ? "chat-bubble-user"
                  : "chat-bubble-assistant"
              }`}
            >
              <div className="chat-bubble-avatar">
                {msg.role === "user" ? (
                  <User size={16} />
                ) : (
                  <Bot size={16} />
                )}
              </div>
              <div className="chat-bubble-content">
                <p className="chat-bubble-text">
                  {msg.content || t.loading}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Streaming skeleton while waiting for first chunk */}
        {chatState === "STREAMING" && !streamBufferRef.current && (
          <ChatSkeleton />
        )}
      </div>

      {/* Input bar — 48px touch targets, green send button */}
      <footer className="chat-input-bar">
        <button
          type="button"
          className="chat-attach-btn"
          aria-label={t.chat_attach_image}
          style={{ touchAction: "manipulation" }}
        >
          <ImagePlus size={20} />
        </button>
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder={t.chat_input_placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={chatState === "STREAMING" || chatState === "CONNECTING"}
          className="chat-input"
          aria-label={t.chat_message_input}
        />
        {chatState === "STREAMING" || chatState === "CONNECTING" ? (
          <button
            type="button"
            onClick={handleStop}
            className="chat-send-btn chat-stop-btn"
            aria-label={t.chat_stop_generation}
            style={{ touchAction: "manipulation" }}
          >
            <div className="chat-stop-icon" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="chat-send-btn"
            aria-label={t.chat_send_message}
            style={{ touchAction: "manipulation" }}
          >
            <Send size={18} />
          </button>
        )}
      </footer>
    </div>
  );
}
