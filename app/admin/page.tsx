"use client";

import { useEffect, useMemo, useState } from "react";
import { surveys, surveyOrder } from "@/lib/surveys";

type ResponseRow = {
  id: number;
  category: string;
  created_at: string;
  anonymous: boolean;
  name: string | null;
  email: string | null;
  extra_field: string | null;
  answers: Record<string, string | string[]>;
};

type LogRow = {
  id: number;
  created_at: string;
  action: string;
  details: string | null;
  actor: string | null;
};

const actionLabels: Record<string, string> = {
  view_responses: "Antworten angesehen",
  export_csv: "CSV-Export",
  delete_response: "Antwort gelöscht",
};

export default function AdminPage() {
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<"responses" | "logs">("responses");
  const [loading, setLoading] = useState(true);

  function loadResponses() {
    fetch("/api/admin/responses")
      .then((r) => r.json())
      .then((data) => {
        setResponses(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadResponses();
  }, []);

  useEffect(() => {
    if (view === "logs") {
      fetch("/api/admin/logs")
        .then((r) => r.json())
        .then(setLogs);
    }
  }, [view]);

  async function handleDelete(id: number) {
    if (!confirm(`Antwort #${id} wirklich unwiderruflich löschen?`)) return;
    await fetch(`/api/admin/responses?id=${id}`, { method: "DELETE" });
    setResponses((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = useMemo(() => {
    if (filter === "all") return responses;
    const cat = surveys[filter]?.category;
    return responses.filter((r) => r.category === cat);
  }, [responses, filter]);

  const stats = useMemo(() => {
    if (filter === "all") return null;
    const survey = surveys[filter];
    return survey.questions
      .filter((q) => q.type === "rating5" || q.type === "nps")
      .map((q) => {
        const values = filtered
          .map((r) => r.answers[q.id])
          .filter((v): v is string => typeof v === "string" && v !== "")
          .map(Number);

        if (q.type === "rating5") {
          const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
          return { label: q.label, type: "rating5" as const, avg, n: values.length };
        } else {
          const promoters = values.filter((v) => v >= 9).length;
          const detractors = values.filter((v) => v <= 6).length;
          const nps = values.length
            ? Math.round(((promoters - detractors) / values.length) * 100)
            : null;
          return { label: q.label, type: "nps" as const, nps, n: values.length };
        }
      });
  }, [filtered, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const slug of surveyOrder) {
      c[slug] = responses.filter((r) => r.category === surveys[slug].category).length;
    }
    return c;
  }, [responses]);

  return (
    <div className="flex flex-col flex-1 bg-background px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-jazz-teal mb-6">Admin – Jazz Days Ligerz 2026</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("responses")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${
            view === "responses" ? "bg-jazz-teal text-white border-jazz-teal" : "border-jazz-teal-pale"
          }`}
        >
          Antworten
        </button>
        <button
          onClick={() => setView("logs")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${
            view === "logs" ? "bg-jazz-teal text-white border-jazz-teal" : "border-jazz-teal-pale"
          }`}
        >
          Aktivitäts-Log
        </button>
      </div>

      {view === "responses" && (
      <>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${
            filter === "all" ? "bg-jazz-teal text-white border-jazz-teal" : "border-jazz-teal-pale"
          }`}
        >
          Alle ({responses.length})
        </button>
        {surveyOrder.map((slug) => (
          <button
            key={slug}
            onClick={() => setFilter(slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${
              filter === slug ? "bg-jazz-teal text-white border-jazz-teal" : "border-jazz-teal-pale"
            }`}
          >
            {surveys[slug].category} ({counts[slug]})
          </button>
        ))}

        <a
          href={`/api/admin/export${filter === "all" ? "" : `?category=${filter}`}`}
          className="ml-auto rounded-full px-4 py-1.5 text-sm font-semibold bg-jazz-accent text-white"
        >
          CSV Export {filter === "all" ? "(alle)" : `(${surveys[filter].category})`}
        </a>
      </div>

      {loading && <p>Lade Daten ...</p>}

      {!loading && stats && (
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl border border-jazz-teal-pale bg-white p-4">
              <p className="text-sm font-medium mb-1 normal-case tracking-normal">{s.label}</p>
              {s.type === "rating5" ? (
                <p className="text-2xl font-bold text-jazz-teal">
                  {s.avg !== null ? s.avg.toFixed(2) : "–"}{" "}
                  <span className="text-sm font-normal text-foreground/50">/ 5 (n={s.n})</span>
                </p>
              ) : (
                <p className="text-2xl font-bold text-jazz-teal">
                  {s.nps !== null ? s.nps : "–"}{" "}
                  <span className="text-sm font-normal text-foreground/50">NPS (n={s.n})</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="overflow-x-auto rounded-xl border border-jazz-teal-pale bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-jazz-teal-pale text-left">
                <th className="p-3">Datum</th>
                <th className="p-3">Kategorie</th>
                <th className="p-3">Anonym</th>
                <th className="p-3">Name</th>
                <th className="p-3">E-Mail</th>
                <th className="p-3">Zusatzfeld</th>
                <th className="p-3">Antworten</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-jazz-teal-pale/40 align-top">
                  <td className="p-3 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString("de-CH")}
                  </td>
                  <td className="p-3 whitespace-nowrap">{r.category}</td>
                  <td className="p-3">{r.anonymous ? "Ja" : "Nein"}</td>
                  <td className="p-3">{r.name || "–"}</td>
                  <td className="p-3">{r.email || "–"}</td>
                  <td className="p-3">{r.extra_field || "–"}</td>
                  <td className="p-3 max-w-md">
                    <details>
                      <summary className="cursor-pointer text-jazz-teal">anzeigen</summary>
                      <pre className="whitespace-pre-wrap text-xs mt-2">
                        {JSON.stringify(r.answers, null, 2)}
                      </pre>
                    </details>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs font-semibold text-red-600 hover:underline normal-case tracking-normal"
                    >
                      löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-4 text-foreground/60">Keine Antworten vorhanden.</p>}
        </div>
      )}
      </>
      )}

      {view === "logs" && (
        <div className="overflow-x-auto rounded-xl border border-jazz-teal-pale bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-jazz-teal-pale text-left">
                <th className="p-3">Datum</th>
                <th className="p-3">Aktion</th>
                <th className="p-3">Details</th>
                <th className="p-3">Benutzer</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-jazz-teal-pale/40">
                  <td className="p-3 whitespace-nowrap">{new Date(l.created_at).toLocaleString("de-CH")}</td>
                  <td className="p-3">{actionLabels[l.action] || l.action}</td>
                  <td className="p-3 normal-case tracking-normal">{l.details || "–"}</td>
                  <td className="p-3">{l.actor || "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="p-4 text-foreground/60">Keine Log-Einträge vorhanden.</p>}
        </div>
      )}
    </div>
  );
}
