"use client";

import React, { useState } from "react";

interface Props {
  src?: string;
  title?: string;
  description?: string;
  images?: string[]; // optional explicit image URL(s)
}

const CollaborationForm = ({
  src = "/CardImage.png",
  title = "AI Collaboration",
  description = "Tell us about your idea and what you're looking for.",
  images,
}: Props) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Developer",
    projectType: "AI",
    message: "",
  });

  const image = images && images.length > 0 ? images[0] : src;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // replace with API call when ready
    console.log("Collaboration form submitted:", form);
    alert("Form submitted — check console for values (dev only)");
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="w-full h-48 md:h-60 lg:h-72 bg-black flex items-center justify-center">
        <img src={image} alt={title} className="max-h-full object-contain" />
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-semibold text-white text-center">
          Collaboration Form
        </h2>
        <p className="mt-2 text-gray-300 text-center">{description}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-gray-300">Name</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              type="text"
              placeholder="Your name"
              className="w-full mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300">Role</label>
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                className="w-full mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700"
              >
                <option>Developer</option>
                <option>Designer</option>
                <option>Researcher</option>
                <option>Product Manager</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">Project Type</label>
              <select
                value={form.projectType}
                onChange={(e) => update("projectType", e.target.value)}
                className="w-full mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700"
              >
                <option>AI</option>
                <option>AR/VR</option>
                <option>Web</option>
                <option>Mobile</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              rows={4}
              placeholder="Describe the idea or collaboration you're seeking"
              className="w-full mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700 resize-y"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 text-white bg-gradient-to-r from-purple-600 to-cyan-500 rounded-md hover:from-purple-700 hover:to-cyan-400 transition-all duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollaborationForm;
