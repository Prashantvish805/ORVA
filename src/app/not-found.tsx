import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black">
      <h1 className="font-serif text-8xl font-bold text-white">404</h1>
      <h2 className="font-serif text-xl text-white/60">Page Not Found</h2>
      <p className="max-w-md text-center text-sm text-white/40">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-4 border border-white/20 px-6 py-2 text-sm tracking-widest text-white transition-colors hover:bg-white/10"
      >
        Back to Home
      </Link>
    </div>
  );
}
