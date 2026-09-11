"use client";

import { useRef, useState } from "react";
import { captureLead } from "@/app/card/actions";

function extractEmail(text: string) {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match ? match[0] : "";
}

function extractPhone(text: string) {
  const matches = text.match(/(?:\+?\d[\d\-\s]{7,}\d)/g);
  if (!matches) return "";
  return matches[0].replace(/\s+/g, " ").trim();
}

export default function LeadCaptureForm({
  employeeId,
  companyId,
}: {
  employeeId: number;
  companyId: number;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleScan() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setScanning(true);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();

      const foundEmail = extractEmail(text);
      const foundPhone = extractPhone(text);
      if (foundEmail) setEmail(foundEmail);
      if (foundPhone) setPhone(foundPhone);
    } finally {
      setScanning(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    await captureLead(formData);
    setPending(false);
    setSent(true);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Scan Card"
        className="flex aspect-square items-center justify-center rounded-2xl bg-red-500 text-xl text-white"
      >
        &#128248;
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-6 dark:bg-zinc-950 sm:rounded-2xl">
      {sent ? (
        <p className="text-center text-sm text-green-600">
          Contact saved! Thanks for connecting.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="hidden" name="employeeId" value={employeeId} />
          <input type="hidden" name="companyId" value={companyId} />

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Lead Capture
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-red-500"
            >
              Exit
            </button>
          </div>

          {imagePreview ? (
            <div className="relative h-40 w-full overflow-hidden rounded-lg border-2 border-dashed border-blue-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Captured card"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <p className="text-xs text-zinc-500">
              Snap a photo of the paper business card you were handed.
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            name="cardImage"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="input"
          />

          <input
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
          <input
            name="phone"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
          />
          <input
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            name="company"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="input"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleScan}
              disabled={!imagePreview || scanning}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {scanning ? "Scanning..." : "Scan"}
            </button>
            <button
              type="submit"
              disabled={pending || !name || !phone}
              className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg bg-zinc-500 py-2 text-sm font-semibold text-white"
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
