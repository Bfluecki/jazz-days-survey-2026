import Link from "next/link";
import { surveys, surveyOrder } from "@/lib/surveys";

const descriptions: Record<string, string> = {
  besucher: "Du warst an den Jazz Days 2026 dabei? Erzähl uns, wie es dir gefallen hat.",
  helfer: "Danke für deinen Einsatz! Gib uns Feedback zu Organisation und Ablauf.",
  musiker: "Ihr habt an den Jazz Days gespielt? Wir freuen uns auf euer Feedback.",
  partner: "Du warst als Partner oder Carnozet-Betreiber dabei? Hier geht's zur Umfrage.",
};

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-background">
      <main className="flex flex-1 w-full max-w-2xl flex-col items-center px-6 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-jazz-teal text-center mb-2">
          Jazz Days Ligerz 2026
        </h1>
        <h2 className="text-lg sm:text-xl font-medium text-foreground/70 text-center mb-8 normal-case tracking-normal">
          Umfrage
        </h2>

        <p className="text-center text-foreground/80 mb-10 max-w-md">
          Bitte wähle aus, welche Umfrage du ausfüllen möchtest. Alle Fragen sind
          freiwillig und können anonym beantwortet werden.
        </p>

        <div className="w-full flex flex-col gap-4">
          {surveyOrder.map((slug) => {
            const s = surveys[slug];
            return (
              <Link
                key={slug}
                href={`/survey/${slug}`}
                className="block rounded-xl border border-jazz-teal-pale bg-white px-6 py-5 shadow-sm transition hover:shadow-md hover:border-jazz-teal hover:bg-jazz-teal-pale/10"
              >
                <h3 className="text-xl font-semibold text-jazz-teal mb-1">{s.title}</h3>
                <p className="text-sm text-foreground/70 normal-case tracking-normal font-body">
                  {descriptions[slug]}
                </p>
              </Link>
            );
          })}
        </div>

        <p className="text-xs text-foreground/50 mt-12 text-center max-w-md">
          Die Teilnahme ist freiwillig. Die Umfrage kann anonym ausgefüllt werden.
          Kontaktangaben werden nur verwendet, falls Rückfragen nötig sind oder wenn
          Sie ausdrücklich kontaktiert werden möchten.
        </p>
      </main>
    </div>
  );
}
