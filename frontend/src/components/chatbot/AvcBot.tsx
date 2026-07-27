import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Check, Copy, RotateCcw, Send, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BASE_URL } from "@/lib/api/client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  conversation_id?: string | null;
  message?: string;
}

async function sendChat(message: string, conversationId: string | null): Promise<ChatResponse> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("avc_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/chatbot/message/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message, conversation_id: conversationId }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Chat failed (${response.status})`);
  }

  return response.json() as Promise<ChatResponse>;
}

export function AvcBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => composerRef.current?.focus(), 180);
    return () => window.clearTimeout(timer);
  }, [open]);

  async function send(text: string) {
    const value = text.trim();
    if (!value || loading) return;

    setInput("");
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: value };
    const assistantId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setLoading(true);

    try {
      const response = await sendChat(value, conversationId);
      setConversationId(response.conversation_id ?? null);
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content:
                  response.message?.trim() || "I’m sorry, I could not prepare a response just now.",
              }
            : message,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
      setMessages((current) => current.filter((item) => item.id !== assistantId));
    } finally {
      setLoading(false);
    }
  }

  function copyMessage(message: ChatMessage) {
    navigator.clipboard.writeText(message.content);
    setCopied(message.id);
    window.setTimeout(() => setCopied(null), 1500);
  }

  function clearConversation() {
    setMessages([]);
    setConversationId(null);
    setInput("");
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 22 }}
        className="fixed bottom-4 right-4 z-50 sm:bottom-5 sm:right-5"
      >
        <Button
          size="lg"
          onClick={() => setOpen((current) => !current)}
          className="h-12 rounded-full bg-primary px-4 text-primary-foreground shadow-lg transition-shadow hover:bg-primary/90 hover:shadow-xl"
          aria-label={open ? "Close AVC Assistant" : "Open AVC Assistant"}
        >
          {open ? <X className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">{open ? "Close" : "Ask AVC"}</span>
        </Button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            aria-label="AVC Assistant"
            className="fixed inset-x-3 bottom-20 z-50 flex h-[min(36rem,calc(100dvh-6.5rem))] max-h-[calc(100dvh-6.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl sm:inset-x-auto sm:right-5 sm:h-[min(38rem,calc(100dvh-8rem))] sm:w-[min(25rem,calc(100vw-2.5rem))]"
          >
            <header className="flex items-center gap-3 border-b border-border bg-gradient-primary px-4 py-3.5 text-primary-foreground">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">AVC Assistant</p>
                <p className="truncate text-xs text-primary-foreground/70">
                  Choir information and guidance
                </p>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearConversation}
                  className="h-8 w-8 text-primary-foreground/75 hover:bg-white/15 hover:text-primary-foreground"
                  aria-label="Start a new conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8 text-primary-foreground/75 hover:bg-white/15 hover:text-primary-foreground"
                aria-label="Close AVC Assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </header>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-3 text-center">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h2 className="text-base font-semibold">How can I help?</h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    Ask about choir resources, rehearsal preparation, music, or anything else
                    related to AVC.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col gap-1.5",
                        message.role === "user" ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm sm:max-w-[84%]",
                          message.role === "user"
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md border border-border bg-muted/65 text-foreground",
                        )}
                      >
                        {message.role === "assistant" && !message.content && loading ? (
                          <TypingDots />
                        ) : (
                          <div className="break-words [&_p]:my-1 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      {message.role === "assistant" && message.content && (
                        <button
                          type="button"
                          onClick={() => copyMessage(message)}
                          className="flex items-center gap-1 px-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {copied === message.id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied === message.id ? "Copied" : "Copy"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border bg-card p-3 sm:p-4">
              <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-1.5 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
                <Textarea
                  ref={composerRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Write your question…"
                  rows={1}
                  className="min-h-10 max-h-28 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
                />
                <Button
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="px-1 pt-2 text-[11px] text-muted-foreground">
                Press Enter to send · Shift + Enter for a new line
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-1.5" aria-label="AVC Assistant is typing">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70"
          animate={{ y: [0, -3, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.9, delay: index * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}
