"use client";
import React, { useState } from "react";
import LuisChatbox from "../sub/LuisChatbox";

type Msg = { role: "user" | "assistant"; text: string };

export default function LuisChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi — ask me about a project and I'll evaluate it.",
    },
  ]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = value.trim();
    if (!text) return;
    const userMsg: Msg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/geminichat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt:
            "You are Luis' portfolio assistant. Answer concisely and reference Luis' strengths: React, Node, Supabase, UI/UX, prototyping, and basic AI/CV.",
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });
      const json = await res.json();
      const replyText = json?.reply ?? "No response from AI.";
      const assistantMsg: Msg = { role: "assistant", text: replyText };
      setMessages((m) => [...m, assistantMsg]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Error contacting AI." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4  rounded shadow">
      {/* <div className="mb-3 font-semibold">Luis Chat</div> */}
      {/* <div className="h-64 overflow-auto p-2 border rounded bg-gray-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${
              m.role === "assistant" ? "text-gray-800" : "text-blue-700"
            }`}
          >
            <div className="text-sm font-medium">
              {m.role === "assistant" ? "Luis AI" : "You"}
            </div>
            <pre className="whitespace-pre-wrap text-sm">{m.text}</pre>
          </div>
        ))}
      </div> */}

      {/* <div className="mt-3 flex gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 p-2 border rounded"
          rows={2}
          placeholder="Ask Luis AI about a project..."
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Send"}
        </button> */}
      {/* </div> */}
      {/* mount compact fixed chatbox so it's visible site-wide */}
      <LuisChatbox />
    </div>
  );
}
