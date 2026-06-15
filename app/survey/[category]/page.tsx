import { notFound } from "next/navigation";
import { surveys } from "@/lib/surveys";
import SurveyForm from "./SurveyForm";

export function generateStaticParams() {
  return Object.keys(surveys).map((category) => ({ category }));
}

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const survey = surveys[category];
  if (!survey) notFound();

  return (
    <div className="flex flex-col flex-1 items-center bg-background">
      <main className="flex flex-1 w-full max-w-2xl flex-col px-6 py-10 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-jazz-teal mb-4">{survey.title}</h1>
        <div className="text-sm sm:text-base text-foreground/80 whitespace-pre-line mb-6 normal-case tracking-normal font-body">
          {survey.intro}
        </div>
        <p className="text-sm font-semibold text-jazz-teal mb-8 normal-case tracking-normal">
          Alle Fragen sind freiwillig.
        </p>

        <SurveyForm survey={survey} />
      </main>
    </div>
  );
}
