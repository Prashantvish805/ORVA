"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black">
      <h2 className="font-serif text-3xl text-white">Something went wrong</h2>
      <p className="max-w-md text-center text-white/50">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-4 border border-white/20 px-6 py-2 text-sm tracking-widest text-white transition-colors hover:bg-white/10"
      >
        Try Again
      </button>
    </div>
  );
}
