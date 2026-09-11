"use client";

import { useState } from "react";
import { login } from "./actions";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await login(email, password);
    setSuccess(result.success);
    setNotice(result.message);
    setPending(false);
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-screen">
      <div className="flex flex-col justify-center gap-6 px-10 py-20 md:w-1/2 md:px-20 bg-gradient-to-br from-[#1e3a8a] to-[#0b1638] text-white">
        <h1 className="text-5xl font-bold">Nexora</h1>
        <p className="text-2xl font-medium text-blue-100">
          The Next Generation Corporate Identity Platform
        </p>
        <p className="max-w-md text-blue-200/80 leading-7">
          Manage corporate digital identity, employee profiles, and digital
          business cards securely in one unified platform.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-300">
            Secure Login
          </h2>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Access your Nexora dashboard
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-blue-900 py-3 font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
            >
              {pending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {notice && (
            <p
              className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                success
                  ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                  : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
              }`}
            >
              {notice}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between text-sm">
            <a href="#" className="text-blue-700 hover:underline dark:text-blue-400">
              Forgot password?
            </a>
            <a href="#" className="text-blue-700 hover:underline dark:text-blue-400">
              Subscribe
            </a>
          </div>
        </div>

        <p className="mt-10 text-xs text-zinc-400">
          Nexora Platform &copy; Corporate Digital Profile
        </p>
      </div>
    </div>
  );
}
