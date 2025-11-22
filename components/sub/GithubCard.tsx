import React from "react";

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
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="p-4 bg-[#07031a] border border-[#2A0E61] rounded-md transition-all duration-300 flex flex-col md:flex-row gap-4 items-start relative group overflow-visible hover:z-20 hover:shadow-2xl hover:ring-2 hover:ring-purple-400"
    >
      {/* Preview container: animate max-height to reveal more content without scaling */}
      <div className="w-full md:w-48 rounded-md overflow-hidden border border-[#1f1333] max-h-32 group-hover:max-h-[18rem] transition-all duration-300">
        {gifUrl ? (
          <img
            src={gifUrl}
            alt={`${repo.name} walkthrough`}
            loading="lazy"
            className="w-full h-auto object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-[#050218] flex items-center justify-center text-sm text-gray-500">
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
    </a>
  );
};

export default GithubCard;
