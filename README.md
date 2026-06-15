# Jazz Days Ligerz 2026 – Umfrage-Tool

Online-Umfrage-Tool für Besucher, Helfer, Musiker und Partner der Jazz Days Ligerz 2026.

## Funktionen

- 4 separate Umfragen (Besucher, Helfer, Musiker, Partner), dynamisch aus `lib/surveys.ts` generiert
- Optionale Anonymität, Kontaktdaten und kategoriespezifisches Zusatzfeld
- Fragetypen: Single Choice, Multiple Choice, Bewertung 1–5, NPS 0–10, Freitext kurz/lang
- Speicherung in SQLite (`better-sqlite3`)
- Admin-Bereich (`/admin`, Basic Auth) mit Übersicht, Kennzahlen (Ø-Bewertungen, NPS) und CSV-Export

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Die App läuft danach auf http://localhost:3000.

## Admin-Zugang

Geschützt via HTTP Basic Auth. Standard-Zugangsdaten (bitte in Produktion per Env-Variable überschreiben):

- `ADMIN_USER` (Standard: `admin`)
- `ADMIN_PASSWORD` (Standard: `jazzdays2026`)

## Daten

Die SQLite-Datenbank wird im Verzeichnis `DB_DIR` (Standard: `./data`) als `survey.db` gespeichert.
Für Railway sollte ein Volume auf `/data` gemountet und `DB_DIR=/data` gesetzt werden.

## Deployment auf Railway

Das Repo enthält ein `Dockerfile` und `railway.json`. In Railway:

1. Neues Projekt aus diesem GitHub-Repo erstellen
2. Volume anlegen und unter `/data` mounten
3. Umgebungsvariablen setzen: `DB_DIR=/data`, `ADMIN_USER`, `ADMIN_PASSWORD`
4. Deploy starten – Railway baut automatisch via Dockerfile
