"use client";

import React, { useState, KeyboardEvent } from "react";

type Props = {
  repo: {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
  };
  gifUrl?: string | null;
};

const GithubCard = ({ repo, gifUrl }: Props) => {
  const [magnified, setMagnified] = useState(false);
  // no timers - magnify stays until user toggles or another card magnifies

  // When a card magnifies, notify others via a global CustomEvent so only one stays magnified.
  const announceMagnify = (id: number) => {
    try {
      window.dispatchEvent(
        new CustomEvent("githubcard-magnify", { detail: id })
      );
    } catch (e) {
      // ignore (server-side or unsupported)
    }
  };

  const collapse = () => {
    setMagnified(false); // Simplified collapse function
  };

  const toggle = () => {
    setMagnified((s) => {
      const next = !s;
      if (next) {
        // announce to others that this card is magnified
        announceMagnify(repo.id);
      }
      return next;
    });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  React.useEffect(() => {
    const handler = (ev: Event) => {
      const custom = ev as CustomEvent<number>;
      if (!custom?.detail) return;
      const id = custom.detail as number;
      if (id !== repo.id) collapse();
    };
    window.addEventListener("githubcard-magnify", handler as EventListener);
    return () => {
      window.removeEventListener(
        "githubcard-magnify",
        handler as EventListener
      );
    };
  }, [repo.id]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={onKey}
      className={`p-4 bg-[#07031a] border border-[#2A0E61] rounded-md transform transition-transform duration-300 flex flex-col md:flex-row gap-4 items-start relative overflow-visible hover:z-20 hover:shadow-2xl hover:ring-2 hover:ring-purple-400 ${
        magnified ? "scale-125 md:scale-150 z-50" : ""
      }`}
    >
      {/* Preview container: animate max-height to reveal more content without scaling */}
      <div className="w-full md:w-64 rounded-md overflow-hidden border border-[#1f1333] h-64">
        {gifUrl ? (
          <img
            src={gifUrl}
            alt={`${repo.name} walkthrough`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-56 bg-[#050218] flex items-center justify-center text-sm text-gray-500">
            No preview
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-white font-medium">{repo.name}</h4>
          <div className="text-xs text-gray-300 flex items-center gap-2">
            {/* stars or other meta could go here */}
          </div>
        </div>
        {repo.description && (
          <p className="text-sm text-gray-400 mt-2">{repo.description}</p>
        )}
        {repo.language && (
          <div className="mt-3 text-xs text-gray-300">{repo.language}</div>
        )}
      </div>
    </div>
  );
};

export default GithubCard;
