import Link from "next/link";

export default function Header() {
  return (
    <header>
      <div className="bg-[#f0f0f0] px-6 py-4">
        <Link href="/" className="font-heading text-lg font-bold text-black tracking-tight">
          Jazz Days Ligerz
        </Link>
      </div>
      <div className="bg-black px-6 py-10 sm:py-14">
        <h1 className="font-heading text-4xl sm:text-6xl font-bold leading-[0.95] text-white">
          Jazz Days
          <br />
          Ligerz
        </h1>
        <p className="mt-3 text-sm sm:text-base text-white/70 normal-case tracking-normal font-body">
          Umfrage 2026
        </p>
      </div>
      <div className="h-2 bg-jazz-teal-pale" />
    </header>
  );
}
