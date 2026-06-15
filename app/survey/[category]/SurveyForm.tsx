"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SurveyConfig, Question } from "@/lib/surveys";

type Answers = Record<string, string | string[]>;

function RatingScale({
  value,
  onChange,
  max,
  lowLabel,
  highLabel,
}: {
  value?: string;
  onChange: (v: string) => void;
  max: number;
  lowLabel: string;
  highLabel: string;
}) {
  const nums = Array.from({ length: max + 1 }, (_, i) => i).filter((n) => (max === 5 ? n >= 1 : true));
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {nums.map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => onChange(String(n))}
            className={`h-10 w-10 rounded-full border text-sm font-semibold transition ${
              value === String(n)
                ? "bg-jazz-teal text-white border-jazz-teal"
                : "bg-white text-foreground border-jazz-teal-pale hover:border-jazz-teal"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-foreground/50 mt-1 normal-case tracking-normal">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value?: string | string[];
  onChange: (v: string | string[]) => void;
}) {
  switch (question.type) {
    case "single":
      return (
        <div className="flex flex-col gap-2">
          {question.options?.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 rounded-lg border border-jazz-teal-pale/60 px-4 py-2.5 cursor-pointer hover:bg-jazz-teal-pale/10 normal-case tracking-normal font-body"
            >
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-[var(--jazz-teal)] h-4 w-4"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      );

    case "multiple": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-col gap-2">
          {question.options?.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 rounded-lg border border-jazz-teal-pale/60 px-4 py-2.5 cursor-pointer hover:bg-jazz-teal-pale/10 normal-case tracking-normal font-body"
            >
              <input
                type="checkbox"
                checked={arr.includes(opt)}
                onChange={() => {
                  if (arr.includes(opt)) onChange(arr.filter((o) => o !== opt));
                  else onChange([...arr, opt]);
                }}
                className="accent-[var(--jazz-teal)] h-4 w-4"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    case "rating5":
      return (
        <RatingScale
          value={value as string}
          onChange={onChange}
          max={5}
          lowLabel="1 = sehr schlecht"
          highLabel="5 = sehr gut"
        />
      );

    case "nps":
      return (
        <RatingScale
          value={value as string}
          onChange={onChange}
          max={10}
          lowLabel="0 = unwahrscheinlich"
          highLabel="10 = sehr wahrscheinlich"
        />
      );

    case "text_short":
      return (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-jazz-teal-pale/60 px-4 py-2.5 text-sm normal-case tracking-normal font-body focus:outline-none focus:ring-2 focus:ring-jazz-teal"
        />
      );

    case "text_long":
      return (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-jazz-teal-pale/60 px-4 py-2.5 text-sm normal-case tracking-normal font-body focus:outline-none focus:ring-2 focus:ring-jazz-teal"
        />
      );

    default:
      return null;
  }
}

export default function SurveyForm({ survey }: { survey: SurveyConfig }) {
  const router = useRouter();
  const [step, setStep] = useState<"intro" | "form">("intro");
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [extraField, setExtraField] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAnswer = (id: string, v: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [id]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: survey.slug,
          anonymous,
          name,
          email,
          extraField,
          answers,
        }),
      });
      if (!res.ok) throw new Error("Fehler beim Absenden");
      router.push("/thanks");
    } catch {
      setError("Beim Absenden ist ein Fehler aufgetreten. Bitte versuche es erneut.");
      setSubmitting(false);
    }
  }

  if (step === "intro") {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-jazz-teal mb-4">{survey.title}</h2>
          <div className="text-sm sm:text-base text-foreground/80 whitespace-pre-line mb-4 normal-case tracking-normal font-body">
            {survey.intro}
          </div>
          <p className="text-sm font-semibold text-jazz-teal normal-case tracking-normal">
            Alle Fragen sind freiwillig.
          </p>
        </div>

        <section className="rounded-xl border border-jazz-teal-pale bg-white p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="font-semibold normal-case tracking-normal">Deine Kontaktangaben</p>

            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <span className="text-sm font-semibold normal-case tracking-normal">Teilnahme anonym</span>
              <span
                onClick={() => setAnonymous(!(anonymous ?? false))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  anonymous ? "bg-jazz-teal" : "bg-jazz-teal-pale/40"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    anonymous ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </label>
          </div>

          {!anonymous && (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-jazz-teal-pale/60 px-4 py-2.5 text-sm normal-case tracking-normal font-body focus:outline-none focus:ring-2 focus:ring-jazz-teal"
              />
              <input
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-jazz-teal-pale/60 px-4 py-2.5 text-sm normal-case tracking-normal font-body focus:outline-none focus:ring-2 focus:ring-jazz-teal"
              />
              {survey.extraFieldLabel && (
                <div>
                  <label className="block text-sm mb-1 normal-case tracking-normal text-foreground/70">
                    {survey.extraFieldLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={survey.extraFieldPlaceholder}
                    value={extraField}
                    onChange={(e) => setExtraField(e.target.value)}
                    className="w-full rounded-lg border border-jazz-teal-pale/60 px-4 py-2.5 text-sm normal-case tracking-normal font-body focus:outline-none focus:ring-2 focus:ring-jazz-teal"
                  />
                </div>
              )}
            </div>
          )}

          {anonymous && (
            <p className="text-sm text-foreground/60 normal-case tracking-normal">
              Du nimmst anonym teil – es werden keine Kontaktdaten erfasst.
            </p>
          )}
        </section>

        <button
          type="button"
          onClick={() => setStep("form")}
          className="w-full rounded-full bg-jazz-teal text-white font-semibold py-3 hover:bg-jazz-teal/90 transition disabled:opacity-40"
        >
          Weiter zu den Fragen
        </button>

        <p className="text-xs text-foreground/50 text-center normal-case tracking-normal">
          Die Teilnahme ist freiwillig. Die Umfrage kann anonym ausgefüllt werden.
          Kontaktangaben werden nur verwendet, falls Rückfragen nötig sind oder wenn Sie
          ausdrücklich kontaktiert werden möchten.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-jazz-teal">{survey.title}</h2>

      {/* Questions */}
      {survey.questions.map((q, i) => (
        <section key={q.id} className="rounded-xl border border-jazz-teal-pale bg-white p-5">
          <p className="font-semibold mb-3 normal-case tracking-normal">
            {i + 1}. {q.label}
          </p>
          <QuestionField question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
        </section>
      ))}

      {error && <p className="text-sm text-red-600 normal-case tracking-normal">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-jazz-teal text-white font-semibold py-3 hover:bg-jazz-teal/90 transition disabled:opacity-60"
      >
        {submitting ? "Wird gesendet ..." : "Absenden"}
      </button>

      <p className="text-xs text-foreground/50 text-center normal-case tracking-normal">
        Die Teilnahme ist freiwillig. Die Umfrage kann anonym ausgefüllt werden.
        Kontaktangaben werden nur verwendet, falls Rückfragen nötig sind oder wenn Sie
        ausdrücklich kontaktiert werden möchten.
      </p>
    </form>
  );
}
