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
        <SurveyForm survey={survey} />
      </main>
    </div>
  );
}
