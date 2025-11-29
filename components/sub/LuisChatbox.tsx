"use client";
import React, { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const STORAGE_KEY = "luischatbox_history_v1";

export default function LuisChatbox({
  maxHeight = 220,
}: {
  maxHeight?: number;
}) {
  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      role: "assistant",
      text: "Hi — ask me about Luis' projects and skills.",
    },
  ]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<Msg[]>(messages);
  const [open, setOpen] = useState(true);

  // keep ref in sync with state to avoid stale closures
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // load saved history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // persist history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    // scroll to bottom on new message
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function sendMessage() {
    const text = value.trim();
    if (!text) return;
    const userMsg: Msg = { role: "user", text };

    // update UI immediately and keep ref in sync
    setMessages((m) => {
      const next = [...m, userMsg];
      messagesRef.current = next;
      return next;
    });
    setValue("");
    setLoading(true);

    try {
      const payload = {
        systemPrompt:
          "You are Luis' portfolio assistant. Be concise and reference Luis' strengths: Do not hallucinate. Frontend Development with React, Nodejs, Express, Next.js, Backend: Render, Neon, MongoDB, Cloudflare, R2, Posgresql, Supabase, UI/UX, wireframing, prototyping, and basic AI integration and Computer Vision. For the 3d configurator, used free api from sketchfab, additional api form wikipedia. 3D world tour uses 3js to generate an interactive glove with clickable locations, assets are stored in posgresql database.",
        messages: messagesRef.current.map((m) => ({
          role: m.role,
          text: m.text,
        })),
      };

      const res = await fetch("/api/geminichat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch (parseErr) {
        try {
          const textResp = await res.text();
          json = { reply: textResp };
        } catch (e) {
          json = null;
        }
      }

      if (!res.ok) {
        const errMsg = `Server error: ${res.status} ${res.statusText}`;
        console.error(errMsg, json);
        setMessages((m) => [...m, { role: "assistant", text: errMsg }]);
      } else {
        // prefer json.reply, fallback to debug or text
        const replyText =
          (json && (json.reply || json.result || json.answer)) || "(no reply)";
        setMessages((m) => [
          ...m,
          { role: "assistant", text: String(replyText) },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: "assistant", text: "Network error" }]);
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    setMessages([
      {
        role: "assistant",
        text: "Hi — ask me about Luis' projects and skills.",
      },
    ]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) sendMessage();
    }
  }

  // pointer tilt handlers: set CSS vars on the card element
  useEffect(() => {
    const el = containerRef.current?.closest(".card") as HTMLDivElement | null;
    if (!el) return;

    const node = el as HTMLDivElement;
    let raf: number | null = null;

    function setVars(px: number, py: number) {
      const rx = (0.5 - py) * 10; // rotateX
      const ry = (px - 0.5) * 10; // rotateY
      const tx = (px - 0.5) * 8; // translate x
      const ty = (py - 0.5) * 6; // translate y
      const hyp = Math.hypot(px - 0.5, py - 0.5);

      node.style.setProperty("--mx", `${px * 100}%`);
      node.style.setProperty("--my", `${py * 100}%`);
      node.style.setProperty("--posx", `${px * 100}%`);
      node.style.setProperty("--posy", `${py * 100}%`);
      node.style.setProperty("--rx", `${rx}deg`);
      node.style.setProperty("--ry", `${ry}deg`);
      node.style.setProperty("--tx", `${tx}px`);
      node.style.setProperty("--ty", `${ty}px`);
      node.style.setProperty("--hyp", `${hyp}`);
      node.style.setProperty("--s", `1.02`);
    }

    function resetVars() {
      node.style.setProperty("--mx", `50%`);
      node.style.setProperty("--my", `50%`);
      node.style.setProperty("--posx", `50%`);
      node.style.setProperty("--posy", `50%`);
      node.style.setProperty("--rx", `0deg`);
      node.style.setProperty("--ry", `0deg`);
      node.style.setProperty("--tx", `0px`);
      node.style.setProperty("--ty", `0px`);
      node.style.setProperty("--hyp", `0`);
      node.style.setProperty("--s", `1`);
    }

    const onPointerMove = (e: PointerEvent) => {
      if (raf) cancelAnimationFrame(raf);
      const rect = node.getBoundingClientRect();
      const px = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const py = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
      raf = requestAnimationFrame(() => setVars(px, py));
    };

    const onPointerEnter = () => {
      node.style.setProperty("--s", "1.02");
    };

    const onPointerLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      resetVars();
    };

    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerenter", onPointerEnter);
    node.addEventListener("pointerleave", onPointerLeave);

    // initialize vars
    resetVars();

    return () => {
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerenter", onPointerEnter);
      node.removeEventListener("pointerleave", onPointerLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return (
    <div className={`fixed bottom-24 right-6 z-[99999]`}>
      <div className={`card w-full max-w-md p-3 bg-transparent`}>
        <div className="card__translater">
          <div className="card__rotator">
            <div
              className="card__front card__content rounded-lg border border-[#2A0E61]"
              style={{
                ["--rx" as any]: "0deg",
                ["--ry" as any]: "0deg",
                ["--s" as any]: "1",
              }}
            >
              <div className="flex items-center mr-2 ml-3 justify-between mb-2">
                <div className="font-semibold text-sm text-white">
                  Luis Chat
                </div>
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="text-xs text-gray-200 px-2 py-1 rounded bg-gray-900/40 hover:bg-gray-900/60"
                  aria-label="Toggle chat"
                >
                  {open ? "−" : "+"}
                </button>
              </div>

              {open && (
                <div
                  ref={containerRef}
                  className="overflow-auto p-2 bg-transparent text-sm mb-2"
                  style={{ maxHeight }}
                >
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`mb-2 ${
                        m.role === "assistant" ? "text-white" : "text-cyan-200"
                      }`}
                    >
                      <div className="text-xs font-medium">
                        {m.role === "assistant" ? "Luis AI" : "You"}
                      </div>
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* always show input area so collapsed state still allows sending */}
              <div className="flex gap-2">
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask about a project... (Enter to send)"
                  rows={2}
                  disabled={loading}
                  aria-label="Luis chat input"
                  className="flex-1 p-2 border rounded text-sm resize-none disabled:opacity-10 bg-transparent text-cyan-200"
                />

                <div className="flex flex-col gap-2">
                  <button
                    onClick={sendMessage}
                    disabled={loading}
                    aria-label="Send message"
                    className="px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-500 text-white mr-2 rounded disabled:opacity-50 text-sm shadow-md"
                  >
                    {loading ? "..." : "Send"}
                  </button>
                  <button
                    onClick={clearHistory}
                    className="px-3 py-1 bg-black text-cyan-200 rounded mr-2 text-sm"
                    title="Clear conversation"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div
              className="card__shine pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
