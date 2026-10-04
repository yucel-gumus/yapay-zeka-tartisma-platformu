"use client";

import Link from "next/link";

// Last line of defence for the public share page: any render error shows a
// recoverable screen instead of a blank page.
export default function SharedDebateError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div role="alert" className="surface section-pad max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-2">Tartışma görüntülenemedi</h1>
        <p className="helper mb-6">
          Bu kayıt okunurken beklenmeyen bir hata oluştu.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="btn btn-mint">
            Yeniden dene
          </button>
          <Link href="/" className="btn btn-outline">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
