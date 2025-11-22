import Image from "next/image";
import React from "react";
import GithubCard from "../sub/GithubCard";
import { SELECTED_REPOS } from "../constants/githubRepos";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  default_branch?: string;
};

export default async function Github({
  username = "flowprimedesign",
}: {
  username?: string;
}) {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = token
    ? { Authorization: `token ${token}` }
    : {};

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers,
      // cache for 5 minutes on the server
      next: { revalidate: 300 },
    });

    if (!userRes.ok) {
      return (
        <div className="p-4 text-sm text-red-300">
          Failed to load GitHub profile.
        </div>
      );
    }

    const user = await userRes.json();

    let repos: Repo[] = [];

    if (SELECTED_REPOS && SELECTED_REPOS.length > 0) {
      // Fetch the specific repos the user listed (limit to 6)
      const picks = SELECTED_REPOS.slice(0, 6);
      const fetches = await Promise.all(
        picks.map(async (rname) => {
          try {
            const res = await fetch(
              `https://api.github.com/repos/${username}/${rname}`,
              {
                headers,
                next: { revalidate: 300 },
              }
            );
            return res.ok ? await res.json() : null;
          } catch (e) {
            return null;
          }
        })
      );
      repos = fetches.filter(Boolean) as Repo[];
    } else {
      const reposRes = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=6&sort=updated`,
        { headers, next: { revalidate: 300 } }
      );

      repos = reposRes.ok ? await reposRes.json() : [];
    }

    // Check for a `walkthrough.gif` at the repo root (raw GitHub URL). We'll try HEAD requests in parallel.
    const gifChecks = await Promise.all(
      repos.map(async (r) => {
        const branch = (r as Repo).default_branch || "main";
        const gifUrl = `https://raw.githubusercontent.com/${username}/${r.name}/${branch}/walkthrough.gif`;
        try {
          const res = await fetch(gifUrl, {
            method: "HEAD",
            next: { revalidate: 300 },
          });
          return res.ok ? gifUrl : null;
        } catch (e) {
          return null;
        }
      })
    );

    return (
      <section id="github" className="py-6">
        <h1 className="text-[40px] font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 py-8">
          Github Activity Dashboard
        </h1>
        <div className="max-w-4xl mx-auto bg-[#03001466] p-6 rounded-lg border border-[#2A0E61]">
          <div className="flex items-center gap-4">
            <Image
              src={user.avatar_url}
              alt={user.login}
              width={90}
              height={90}
              className="rounded-full"
            />
            <div>
              <h3 className="text-xl font-semibold text-white">
                {user.name || user.login}
              </h3>
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-gray-300"
              >
                @{user.login} • {user.public_repos} Repos
              </a>
              {user.bio && (
                <p className="text-sm text-gray-400 mt-2">{user.bio}</p>
              )}
            </div>
          </div>

          {/* GitHub contributions heatmap (SVG). Using image tag against GitHub's contributions endpoint. */}
          <div className="mt-6 flex justify-center">
            <img
              src={`https://github.com/users/${username}/contributions`}
              alt={`${username} GitHub contributions`}
              className="w-full max-w-[900px]"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {repos.map((r, i) => (
              <GithubCard key={r.id} repo={r} gifUrl={gifChecks[i]} />
            ))}
          </div>
        </div>
      </section>
    );
  } catch (err) {
    return (
      <div className="p-4 text-sm text-red-300">
        Error fetching GitHub data.
      </div>
    );
  }
}
