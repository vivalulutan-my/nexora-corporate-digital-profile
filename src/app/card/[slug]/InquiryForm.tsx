"use client";

import { useState } from "react";
import { submitInquiry } from "@/app/card/actions";

export default function InquiryForm({
  employeeId,
  companyId,
}: {
  employeeId: number;
  companyId: number;
  slug: string;
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
        className="mt-6 flex flex-col items-center gap-1 text-zinc-500"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white">
          &#128172;
        </span>
        <span className="text-[10px]">Inquiry</span>
      </button>
    );
  }

  return (
    <div className="mt-6 w-full rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      {sent ? (
        <p className="text-center text-sm text-green-600">
          Thanks! Your message has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            rows={3}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-900 py-2 text-sm font-semibold text-white"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
