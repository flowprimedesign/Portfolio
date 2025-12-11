import Image from "next/image";
import React from "react";
import GithubCard from "../sub/GithubCard";
import { SELECTED_REPOS } from "../constants/githubRepos";
import db from "../../lib/db";

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

    // Prefer R2-hosted GIFs recorded in our `images` table. Fall back to a
    // raw GitHub `walkthrough.gif` when no DB mapping exists.
    const GIF_MAP: Record<string, string[]> = {
      // Map repo name -> possible filenames stored in R2 / DB
      "3D-HyperCar-Configurator": ["3DCarConfigurator.gif"],
      "3D-F1-World-Tour": ["3DF1WorldTour.gif", "3DF1WorldTour2.gif"],
      "Cyberpunk-Crew-Database": ["CyberpunkGP.gif"],
      "F1-API-Dashboard": [
        "F1DashboardAPIFilters.gif",
        "F1DashboardAPIRoutes.gif",
      ],
      "F1-Driver-Database": [
        "F1DriversDatabaseBackend.gif",
        "F1DriversDatabaseFrontend.gif",
      ],
      "CruxList-Climbing-Community": ["CruxList.gif"],
    };

    const gifChecks = await Promise.all(
      repos.map(async (r) => {
        // First try DB lookups for known filenames
        const candidates = GIF_MAP[r.name] || [];
        for (const fname of candidates) {
          try {
            const res = await db.query(
              `SELECT url FROM images WHERE filename = $1 LIMIT 1`,
              [fname]
            );
            const row = res.rows?.[0];
            if (row?.url) {
              // If the stored URL points at the R2 endpoint (private), route
              // the preview through our server stream endpoint so the browser
              // doesn't need a public/presigned URL.
              try {
                const u = new URL(row.url);
                const bucketSegment = `/${process.env.R2_BUCKET}/`;
                let key = null as string | null;
                if (u.pathname.includes(bucketSegment)) {
                  key = u.pathname.split(bucketSegment).pop() || null;
                } else {
                  // fallback: use last path segment (filename)
                  key = u.pathname.split("/").pop() || null;
                }
                if (key)
                  return `/api/uploads/stream?key=${encodeURIComponent(key)}`;
              } catch (e) {
                return row.url; // if parsing fails, fall back to stored URL
              }
            }
          } catch (e) {
            // ignore DB errors and continue to fallback
          }
        }

        // // Fallback: check raw GitHub walkthrough.gif at repo root
        // const branch = (r as Repo).default_branch || "main";
        // const gifUrl = `https://raw.githubusercontent.com/${username}/${r.name}/${branch}/walkthrough.gif`;
        // try {
        //   const res = await fetch(gifUrl, {
        //     method: "HEAD",
        //     next: { revalidate: 300 },
        //   });
        //   return res.ok ? gifUrl : null;
        // } catch (e) {
        //   return null;
        // }
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
