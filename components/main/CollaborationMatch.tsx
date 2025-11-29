"use client";
"use client";

import React, { useState } from "react";

const industries = [
  "Technology",
  "Healthcare",
  "Education",
  "Finance",
  "Other",
];

const projectTypes = [
  "Web App",
  "Mobile App",
  "Prototype",
  "Research / PoC",
  "Other",
];

const budgets = ["<$5k", "$5k-$20k", "$20k-$75k", ">75k"];

const teamSizes = ["Solo", "2-4", "5-10", "10+"];

const roles = [
  "Frontend Developer",
  "Fullstack Developer",
  "UI/UX Designer",
  "AI / Computer Vision Contributor",
];

export default function AiCollaborationMatch() {
  const [form, setForm] = useState({
    industry: industries[0],
    projectType: projectTypes[0],
    budget: budgets[0],
    teamSize: teamSizes[0],
    role: roles[0],
    userGoals: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/geminiproxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unknown error");
      setResult(json);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col items-center justify-center py-12 px-4">
      <h1 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 mb-8">
        ✨ Design My Perfect Project With Luis
      </h1>

      <div className="w-full max-w-3xl relative">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-700/20 via-purple-500/10 to-transparent blur-2xl transform -rotate-2 pointer-events-none" />

        <div className="relative bg-gray-900 rounded-lg p-6 shadow-md z-10">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-gray-300">Industry</span>
                <select
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  className="mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                >
                  {industries.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-300">Project Type</span>
                <select
                  value={form.projectType}
                  onChange={(e) => update("projectType", e.target.value)}
                  className="mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                >
                  {projectTypes.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-gray-300">Budget</span>
                <select
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  className="mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                >
                  {budgets.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-300">Team Size</span>
                <select
                  value={form.teamSize}
                  onChange={(e) => update("teamSize", e.target.value)}
                  className="mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                >
                  {teamSizes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-300">
                  Where should Luis fit?
                </span>
                <select
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  className="mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                >
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-300">
                Describe your project goals
              </label>
              <textarea
                value={form.userGoals}
                onChange={(e) => update("userGoals", e.target.value)}
                rows={4}
                placeholder="Describe the idea, audience, features, or constraints."
                className="w-full mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700 resize-y"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-md text-white disabled:opacity-60"
              >
                {loading ? "Generating…" : "✨ Build a Project With Luis"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    industry: industries[0],
                    projectType: projectTypes[0],
                    budget: budgets[0],
                    teamSize: teamSizes[0],
                    role: roles[0],
                    userGoals: "",
                  });
                  setResult(null);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-700 rounded-md text-white"
              >
                Reset
              </button>
            </div>
          </form>

          {error && <div className="mt-4 text-red-400">{error}</div>}

          {result && (
            <div className="mt-6 bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-white">Match Result</h3>

              <div className="mt-3 grid grid-cols-1 gap-4">
                {/* Overall score */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="text-3xl font-bold text-white">
                      {typeof result.compatibility_score === "number"
                        ? `${Math.round(result.compatibility_score)}`
                        : "—"}
                    </div>
                    <div className="text-xs text-gray-400">Compatibility</div>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-700 rounded h-3 overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-purple-600 to-cyan-400"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              Number(result.compatibility_score) || 0
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary and recommendation */}
                {result.summary && (
                  <div className="text-sm text-gray-200">
                    <strong className="text-white">Summary:</strong>{" "}
                    {String(result.summary)}
                  </div>
                )}

                {result.recommendation && (
                  <div className="text-sm text-gray-200">
                    <strong className="text-white">Recommendation:</strong>{" "}
                    {String(result.recommendation)}
                  </div>
                )}

                {/* Category breakdown */}
                {result.category_breakdown && (
                  <div className="pt-2">
                    <div className="text-sm text-gray-300 mb-2">
                      Category Breakdown
                    </div>
                    <div className="space-y-2">
                      {Object.entries(result.category_breakdown).map(
                        ([k, v]) => (
                          <div key={k} className="flex items-center gap-3">
                            <div className="w-36 text-xs text-gray-300 capitalize">
                              {k.replace(/[_-]/g, " ")}
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-gray-700 rounded h-2 overflow-hidden">
                                <div
                                  className="h-2 bg-gradient-to-r from-purple-500 to-cyan-400"
                                  style={{
                                    width: `${Math.max(
                                      0,
                                      Math.min(100, Number(v) || 0)
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="w-12 text-right text-xs text-gray-300">
                              {typeof v === "number" ? Math.round(v) : "—"}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={async () => {
                    if (!result) return;
                    const text = JSON.stringify(result, null, 2);
                    try {
                      if (
                        navigator.clipboard &&
                        navigator.clipboard.writeText
                      ) {
                        await navigator.clipboard.writeText(text);
                      } else {
                        const ta = document.createElement("textarea");
                        ta.value = text;
                        ta.style.position = "fixed";
                        ta.style.left = "-9999px";
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand("copy");
                        document.body.removeChild(ta);
                      }
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch (err) {
                      console.error("Copy failed", err);
                    }
                  }}
                  className="px-3 py-2 bg-gray-700 rounded text-white"
                >
                  {copied ? "Copied!" : "Copy JSON"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
