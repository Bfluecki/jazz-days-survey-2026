export type QuestionType =
  | "single"
  | "multiple"
  | "rating5"
  | "nps"
  | "text_short"
  | "text_long";

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  options?: string[];
}

export interface SurveyConfig {
  slug: string;
  category: "Besucher" | "Helfer" | "Musiker" | "Partner";
  title: string;
  intro: string;
  extraFieldLabel: string;
  extraFieldPlaceholder: string;
  questions: Question[];
}

const ENTWICKLUNG_OPTIONS = [
  "Deutlich verbessert",
  "Eher verbessert",
  "Unverändert",
  "Eher verschlechtert",
  "Deutlich verschlechtert",
  "Kann ich nicht beurteilen",
];

const WIEDER_OPTIONS = ["Ja sicher", "Wahrscheinlich", "Vielleicht", "Nein"];

export const surveys: Record<string, SurveyConfig> = {
  besucher: {
    slug: "besucher",
    category: "Besucher",
    title: "Besucherumfrage",
    extraFieldLabel: "",
    extraFieldPlaceholder: "",
    intro: `Vielen Dank für Ihren Besuch an den Jazz Days Ligerz 2026.

Die Jazz Days Ligerz werden vom Jazz Club Ligerz organisiert und leben vom Zusammenspiel von Musik, Winzerdorf, Carnozets, Open-Air-Bühnen und vielen engagierten Helfern und Partnern.

Mit dieser kurzen Umfrage möchten wir erfahren, wie Sie die Jazz Days erlebt haben. Ihre Rückmeldung hilft uns, die Veranstaltung weiterzuentwickeln.`,
    questions: [
      {
        id: "q1",
        type: "single",
        label: "An welchen Jazz Days haben Sie teilgenommen?",
        options: ["Nur 2026", "2024 und 2026", "2022 und 2026", "2022, 2024 und 2026"],
      },
      {
        id: "q2",
        type: "single",
        label: "An welchem Tag waren Sie anwesend?",
        options: ["Freitag", "Samstag", "Beide Tage"],
      },
      { id: "q3", type: "rating5", label: "Wie zufrieden sind Sie insgesamt mit den Jazz Days Ligerz 2026?" },
      { id: "q4", type: "rating5", label: "Wie beurteilen Sie die Atmosphäre der Jazz Days?" },
      { id: "q5", type: "rating5", label: "Wie beurteilen Sie das Musikprogramm?" },
      {
        id: "q6",
        type: "rating5",
        label:
          "Wie beurteilen Sie die Mischung aus Open-Air-Bühnen, Carnozets, Kreuzsaal und Jazz Club Aarbergerhus?",
      },
      {
        id: "q7",
        type: "single",
        label: "Wie beurteilen Sie die Gehdistanzen zwischen den Spielorten?",
        options: ["Zu kurz", "Genau richtig", "Eher zu weit", "Deutlich zu weit"],
      },
      {
        id: "q8",
        type: "single",
        label: "Haben Distanzen oder Zeitüberschneidungen Ihren Konzertbesuch beeinflusst?",
        options: ["Gar nicht", "Wenig", "Teilweise", "Stark"],
      },
      {
        id: "q9",
        type: "multiple",
        label: "Welche Spielorte haben Ihnen besonders gefallen?",
        options: ["Open-Air-Bühnen", "Carnozets", "Kreuzsaal", "Jazz Club Aarbergerhus"],
      },
      { id: "q10", type: "rating5", label: "Wie beurteilen Sie das Verpflegungsangebot?" },
      {
        id: "q11",
        type: "single",
        label: "Wie haben Sie von den Jazz Days erfahren?",
        options: ["Freunde/Bekannte", "Facebook", "Instagram", "Website", "Flyer/Plakate", "Medien", "Andere"],
      },
      {
        id: "q12",
        type: "single",
        label: "Wie beurteilen Sie die Entwicklung der Jazz Days gegenüber früheren Ausgaben?",
        options: ENTWICKLUNG_OPTIONS,
      },
      {
        id: "q13",
        type: "single",
        label: "Wie beurteilen Sie den heutigen Zweijahres-Rhythmus?",
        options: ["Genau richtig", "Eher zu häufig", "Eher zu selten"],
      },
      { id: "q14", type: "nps", label: "Wie wahrscheinlich würden Sie die Jazz Days weiterempfehlen?" },
      { id: "q15", type: "text_long", label: "Was sollen wir beibehalten oder verbessern?" },
    ],
  },

  helfer: {
    slug: "helfer",
    category: "Helfer",
    title: "Helferumfrage",
    extraFieldLabel: "Einsatzbereich (optional)",
    extraFieldPlaceholder: "z. B. Bar, Einlass, Bühnenteam ...",
    intro: `Vielen Dank für deinen Einsatz an den Jazz Days Ligerz 2026.

Ohne die vielen Helfer wären die Jazz Days nicht möglich. Mit deinem Engagement trägst du wesentlich dazu bei, dass Besucher, Musiker und Partner ein unvergessliches Festival erleben können.

Mit dieser kurzen Umfrage möchten wir erfahren, wie du die Organisation, Kommunikation und Zusammenarbeit erlebt hast.`,
    questions: [
      { id: "q1", type: "text_short", label: "In welchem Bereich warst du tätig?" },
      {
        id: "q2",
        type: "single",
        label: "Hast du bereits früher an den Jazz Days mitgeholfen?",
        options: ["2022", "2024", "Erstmals 2026"],
      },
      { id: "q3", type: "rating5", label: "Wie beurteilst du die Einsatzplanung?" },
      { id: "q4", type: "rating5", label: "Wie beurteilst du die Informationen vor dem Anlass?" },
      { id: "q5", type: "rating5", label: "Wie beurteilst du die Kommunikation mit dem OK?" },
      { id: "q6", type: "rating5", label: "Wie beurteilst du die Betreuung während des Anlasses?" },
      { id: "q7", type: "rating5", label: "Wie beurteilst du die Verpflegung?" },
      { id: "q8", type: "rating5", label: "Wie beurteilst du die Anzahl Helfer im Einsatz?" },
      { id: "q9", type: "rating5", label: "Hast du dich für deinen Einsatz wertgeschätzt gefühlt?" },
      { id: "q10", type: "rating5", label: "Wie beurteilst du die Atmosphäre der Jazz Days?" },
      { id: "q11", type: "rating5", label: "Wie beurteilst du die Organisation insgesamt?" },
      {
        id: "q12",
        type: "single",
        label: "Wie beurteilst du die Entwicklung der Jazz Days?",
        options: ENTWICKLUNG_OPTIONS,
      },
      {
        id: "q13",
        type: "single",
        label: "Wie beurteilst du den heutigen Zweijahres-Rhythmus?",
        options: ["Genau richtig", "Eher zu häufig", "Eher zu selten"],
      },
      {
        id: "q14",
        type: "single",
        label: "Würdest du bei den nächsten Jazz Days wieder mithelfen?",
        options: WIEDER_OPTIONS,
      },
      { id: "q15", type: "text_long", label: "Was sollen wir beibehalten oder verbessern?" },
    ],
  },

  musiker: {
    slug: "musiker",
    category: "Musiker",
    title: "Musikerumfrage",
    extraFieldLabel: "Band / Projekt (optional)",
    extraFieldPlaceholder: "Name der Band oder des Projekts",
    intro: `Vielen Dank, dass ihr Teil der Jazz Days Ligerz 2026 wart.

Die Jazz Days Ligerz bieten Musikern die Möglichkeit, in einer einzigartigen Umgebung vor Publikum aufzutreten – in Carnozets, auf Open-Air-Bühnen, im Kreuzsaal oder im Jazz Club Aarbergerhus.

Mit dieser Umfrage möchten wir erfahren, wie ihr die Vorbereitung, Betreuung, Infrastruktur und Atmosphäre erlebt habt.`,
    questions: [
      {
        id: "q1",
        type: "single",
        label: "Auf welchem Spielort seid ihr aufgetreten?",
        options: ["Open-Air-Bühne", "Carnozet", "Kreuzsaal", "Jazz Club Aarbergerhus"],
      },
      {
        id: "q2",
        type: "single",
        label: "Seid ihr bereits früher an den Jazz Days aufgetreten?",
        options: ["2022", "2024", "Erstmals 2026"],
      },
      { id: "q3", type: "rating5", label: "Wie beurteilt ihr die Kommunikation vor dem Anlass?" },
      { id: "q4", type: "rating5", label: "Wie beurteilt ihr die Informationen vor dem Anlass?" },
      { id: "q5", type: "rating5", label: "Wie beurteilt ihr die Organisation insgesamt?" },
      { id: "q6", type: "rating5", label: "Wie beurteilt ihr die Betreuung vor Ort?" },
      { id: "q7", type: "rating5", label: "Wie beurteilt ihr euren Spielort?" },
      { id: "q8", type: "rating5", label: "Wie beurteilt ihr die Tonanlage?" },
      { id: "q9", type: "rating5", label: "Wie beurteilt ihr die Beleuchtung?" },
      { id: "q10", type: "rating5", label: "Wie beurteilt ihr die technische Betreuung?" },
      { id: "q11", type: "rating5", label: "Wie beurteilt ihr Publikum und Stimmung?" },
      { id: "q12", type: "rating5", label: "Wie beurteilt ihr die Besucherfrequenz während eures Auftritts?" },
      {
        id: "q13",
        type: "single",
        label: "Wie beurteilt ihr die Entwicklung der Jazz Days?",
        options: ENTWICKLUNG_OPTIONS,
      },
      {
        id: "q14",
        type: "single",
        label: "Würdet ihr wieder an den Jazz Days auftreten?",
        options: WIEDER_OPTIONS,
      },
      { id: "q15", type: "text_long", label: "Was sollen wir beibehalten oder verbessern?" },
    ],
  },

  partner: {
    slug: "partner",
    category: "Partner",
    title: "Partnerumfrage",
    extraFieldLabel: "Standort / Carnozet (optional)",
    extraFieldPlaceholder: "Name des Standorts oder Carnozets",
    intro: `Vielen Dank für deine Unterstützung der Jazz Days Ligerz 2026.

Die Jazz Days Ligerz sind nur dank der Zusammenarbeit mit Partnern, Carnozet-Betreibern, Sponsoren und Unterstützern möglich.

Mit dieser kurzen Umfrage möchten wir erfahren, wie du die Zusammenarbeit, Organisation, Besucherströme und den Nutzen der Veranstaltung erlebt hast.`,
    questions: [
      { id: "q1", type: "text_short", label: "Welchen Standort bzw. welches Carnozet hast du betrieben?" },
      {
        id: "q2",
        type: "single",
        label: "Warst du bereits früher als Partner bei den Jazz Days dabei?",
        options: ["2022", "2024", "Erstmals 2026"],
      },
      { id: "q3", type: "rating5", label: "Wie beurteilst du die Zusammenarbeit mit dem OK?" },
      { id: "q4", type: "rating5", label: "Wie beurteilst du die Informationen vor dem Anlass?" },
      { id: "q5", type: "rating5", label: "Wie beurteilst du die Unterstützung durch das OK?" },
      { id: "q6", type: "rating5", label: "Wie beurteilst du die Lage deines Standorts?" },
      { id: "q7", type: "rating5", label: "Wie beurteilst du die Besucherfrequenz an deinem Standort?" },
      { id: "q8", type: "rating5", label: "Wie beurteilst du die Besucherführung im Dorf?" },
      { id: "q9", type: "rating5", label: "Entsprachen die Besucherströme deinen Erwartungen?" },
      { id: "q10", type: "rating5", label: "Hat die zugeteilte Band aus deiner Sicht zu deinem Standort gepasst?" },
      { id: "q11", type: "rating5", label: "Wie beurteilst du die technische Infrastruktur Ton und Licht?" },
      { id: "q12", type: "rating5", label: "Wie beurteilst du den wirtschaftlichen Erfolg deines Standorts?" },
      {
        id: "q13",
        type: "single",
        label: "Wie beurteilst du die Entwicklung der Jazz Days?",
        options: ENTWICKLUNG_OPTIONS,
      },
      {
        id: "q14",
        type: "single",
        label: "Würdest du bei den nächsten Jazz Days wieder als Partner teilnehmen?",
        options: WIEDER_OPTIONS,
      },
      { id: "q15", type: "text_long", label: "Was sollen wir beibehalten oder verbessern?" },
    ],
  },
};

export const surveyOrder = ["besucher", "helfer", "musiker", "partner"] as const;
