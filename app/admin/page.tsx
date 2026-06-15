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
  const [view, setView] = useState<"responses" | "analysis" | "logs">("responses");
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

  async function handleDeleteSurvey(filterSlug: string) {
    if (filterSlug === "all") {
      if (!confirm("Wirklich ALLE Umfrage-Antworten aus allen Kategorien unwiderruflich löschen?")) return;
      await fetch(`/api/admin/responses?all=true`, { method: "DELETE" });
      setResponses([]);
      return;
    }

    const category = surveys[filterSlug].category;
    if (!confirm(`Wirklich alle Antworten der ${category}-Umfrage unwiderruflich löschen?`)) return;
    await fetch(`/api/admin/responses?category=${encodeURIComponent(category)}`, { method: "DELETE" });
    setResponses((prev) => prev.filter((r) => r.category !== category));
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

  const analysis = useMemo(() => {
    if (filter === "all") return null;
    const survey = surveys[filter];
    return survey.questions.map((q) => {
      const raw = filtered.map((r) => r.answers[q.id]).filter((v) => v !== undefined && v !== "");

      if (q.type === "single" || q.type === "multiple") {
        const counts: Record<string, number> = {};
        for (const opt of q.options || []) counts[opt] = 0;
        let total = 0;
        for (const v of raw) {
          const vals = Array.isArray(v) ? v : [v as string];
          for (const val of vals) {
            counts[val] = (counts[val] || 0) + 1;
            total++;
          }
        }
        const n = raw.length;
        return {
          id: q.id,
          label: q.label,
          kind: "choice" as const,
          n,
          bars: Object.entries(counts).map(([opt, c]) => ({
            opt,
            count: c,
            pct: total ? Math.round((c / (q.type === "multiple" ? n : total || 1)) * 100) : 0,
          })),
        };
      }

      if (q.type === "rating5" || q.type === "nps") {
        const values = raw.map((v) => Number(v)).filter((v) => !isNaN(v));
        const max = q.type === "rating5" ? 5 : 10;
        const min = q.type === "rating5" ? 1 : 0;
        const counts: Record<number, number> = {};
        for (let i = min; i <= max; i++) counts[i] = 0;
        for (const v of values) counts[v] = (counts[v] || 0) + 1;
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

        let nps: number | null = null;
        if (q.type === "nps" && values.length) {
          const promoters = values.filter((v) => v >= 9).length;
          const detractors = values.filter((v) => v <= 6).length;
          nps = Math.round(((promoters - detractors) / values.length) * 100);
        }

        return {
          id: q.id,
          label: q.label,
          kind: "scale" as const,
          n: values.length,
          avg,
          nps,
          max,
          bars: Object.entries(counts).map(([val, c]) => ({
            opt: val,
            count: c,
            pct: values.length ? Math.round((c / values.length) * 100) : 0,
          })),
        };
      }

      // text
      return {
        id: q.id,
        label: q.label,
        kind: "text" as const,
        n: raw.length,
        texts: raw as string[],
      };
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
          onClick={() => setView("analysis")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${
            view === "analysis" ? "bg-jazz-teal text-white border-jazz-teal" : "border-jazz-teal-pale"
          }`}
        >
          Auswertung
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

      {(view === "responses" || view === "analysis") && (
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

        {view === "responses" && (
        <a
          href={`/api/admin/export${filter === "all" ? "" : `?category=${filter}`}`}
          className="ml-auto rounded-full px-4 py-1.5 text-sm font-semibold bg-jazz-accent text-white"
        >
          CSV Export {filter === "all" ? "(alle)" : `(${surveys[filter].category})`}
        </a>
        )}

        {view === "responses" && (
        <button
          onClick={() => handleDeleteSurvey(filter)}
          className="rounded-full px-4 py-1.5 text-sm font-semibold border border-red-600 text-red-600 hover:bg-red-50"
        >
          {filter === "all" ? "Alle Umfragen löschen" : `${surveys[filter].category}-Umfrage löschen`}
        </button>
        )}
      </div>

      {loading && <p>Lade Daten ...</p>}

      {view === "analysis" && !loading && (
        filter === "all" ? (
          <p className="text-foreground/60">Bitte wähle eine Umfrage-Kategorie aus, um die Auswertung zu sehen.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {analysis?.map((a) => (
              <div key={a.id} className="rounded-xl border border-jazz-teal-pale bg-white p-4">
                <p className="font-semibold mb-3 normal-case tracking-normal">
                  {a.label} <span className="text-foreground/40 font-normal">(n={a.n})</span>
                </p>

                {a.kind === "choice" && (
                  <div className="flex flex-col gap-2">
                    {a.bars.map((b) => (
                      <div key={b.opt} className="flex items-center gap-3">
                        <span className="w-48 shrink-0 text-sm normal-case tracking-normal">{b.opt}</span>
                        <div className="flex-1 h-4 bg-jazz-teal-pale/20 rounded overflow-hidden">
                          <div
                            className="h-full bg-jazz-teal rounded"
                            style={{ width: `${b.pct}%` }}
                          />
                        </div>
                        <span className="w-20 shrink-0 text-sm text-right normal-case tracking-normal">
                          {b.count} ({b.pct}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {a.kind === "scale" && (
                  <>
                    <p className="text-2xl font-bold text-jazz-teal mb-3">
                      {a.avg !== null ? a.avg.toFixed(2) : "–"}{" "}
                      <span className="text-sm font-normal text-foreground/50">
                        {a.nps !== null ? `Ø, NPS ${a.nps}` : `/ ${a.max} Ø`}
                      </span>
                    </p>
                    <div className="flex flex-col gap-2">
                      {a.bars.map((b) => (
                        <div key={b.opt} className="flex items-center gap-3">
                          <span className="w-10 shrink-0 text-sm normal-case tracking-normal">{b.opt}</span>
                          <div className="flex-1 h-4 bg-jazz-teal-pale/20 rounded overflow-hidden">
                            <div
                              className="h-full bg-jazz-teal rounded"
                              style={{ width: `${b.pct}%` }}
                            />
                          </div>
                          <span className="w-20 shrink-0 text-sm text-right normal-case tracking-normal">
                            {b.count} ({b.pct}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {a.kind === "text" && (
                  <div className="flex flex-col gap-2">
                    {a.texts.length === 0 && (
                      <p className="text-sm text-foreground/50 normal-case tracking-normal">Keine Antworten.</p>
                    )}
                    {a.texts.map((t, i) => (
                      <p
                        key={i}
                        className="text-sm normal-case tracking-normal rounded-lg bg-jazz-teal-pale/10 px-3 py-2"
                      >
                        {t}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {view === "responses" && !loading && stats && (
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

      {view === "responses" && !loading && (
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
