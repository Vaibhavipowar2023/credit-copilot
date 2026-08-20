import { useState, useRef, useEffect } from "react";
import { Send, Loader2, FileText, BookOpen, Hash } from "lucide-react";
import { askDocument } from "../lib/api";
import Markdown from "react-markdown";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm your **Credit & Covenant Risk Copilot**. Ask me anything about your uploaded credit agreement.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question, sources: [] }]);
    setLoading(true);

    try {
      const res = await askDocument(question);
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.answer, sources: data.sources || [] },
        ]);
      } else {
        const err = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `Error: ${err.detail || res.statusText}`, sources: [] },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Network error. Is the backend running?", sources: [] },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Ask the Copilot</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ask questions about your credit agreement — grounded in the actual document
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] sm:max-w-2xl rounded-2xl px-5 py-3 ${
                msg.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              {/* Markdown-rendered content */}
              <div
                className={`chat-markdown text-sm leading-relaxed ${
                  msg.role === "user" ? "text-white [&_strong]:text-white [&_a]:text-blue-200" : ""
                }`}
              >
                <Markdown>{msg.text}</Markdown>
              </div>

              {/* Sources — always visible when present */}
              {msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    <BookOpen size={12} />
                    Sources ({msg.sources.length})
                  </div>
                  <div className="space-y-2">
                    {msg.sources.map((s, j) => (
                      <div
                        key={j}
                        className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Hash size={11} className="text-brand-500" />
                          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                            Chunk {s.chunk_index}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {s.content.length > 300 ? s.content.slice(0, 300) + "…" : s.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 size={16} className="animate-spin" /> Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4">
        <form onSubmit={handleSend} className="flex gap-3 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the credit agreement..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition placeholder:text-gray-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-xl transition disabled:opacity-40"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
