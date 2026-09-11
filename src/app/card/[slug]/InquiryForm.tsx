"use client";

import { useState } from "react";
import { submitInquiry } from "@/app/card/actions";

export default function InquiryForm({
  employeeId,
  companyId,
  buttonClass = "bg-blue-900 hover:bg-blue-800",
}: {
  employeeId: number;
  companyId: number;
  slug: string;
  buttonClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitInquiry(employeeId, companyId, name, phone, email, message);
    setSent(true);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1 text-zinc-500"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white">
          &#128172;
        </span>
        <span className="text-[10px]">Inquiry</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 dark:bg-zinc-950 sm:rounded-2xl">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Send Inquiry
        </h3>

        {sent ? (
          <p className="mt-6 text-center text-sm text-green-600">
            Thanks! Your message has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <input
              required
              placeholder="Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
            <input
              required
              placeholder="Phone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input"
              rows={4}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className={`flex-1 rounded-lg py-2 text-sm font-semibold text-white ${buttonClass}`}
              >
                Send
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-zinc-200 py-2 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
