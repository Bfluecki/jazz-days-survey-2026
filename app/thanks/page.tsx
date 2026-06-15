import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background px-6 text-center">
      <h1 className="text-3xl font-bold text-jazz-teal mb-4">Vielen Dank!</h1>
      <p className="max-w-md text-foreground/80 normal-case tracking-normal mb-8">
        Vielen Dank für deine / Ihre Rückmeldung. Dein / Ihr Feedback hilft uns, die
        Jazz Days Ligerz weiterzuentwickeln.
      </p>
      <Link
        href="/"
        className="rounded-full bg-jazz-teal text-white font-semibold px-6 py-3 hover:bg-jazz-teal/90 transition"
      >
        Zurück zur Startseite
      </Link>
    </div>
  );
}
