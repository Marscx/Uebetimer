# Übemappe – gemeinsames Dateiformat der Übe-Tools

Eine **Übemappe** ist eine JSON-Datei, die dem Schüler / der Schülerin gehört. Sie hält fest,
woran gearbeitet wird (z. B. Übeplan und Übe-Journal), damit man in der nächsten Lektion
oder auf einem anderen Gerät am selben Ort weitermachen kann.

- Gespeichert wird **nur in der Datei** und im Browser des Geräts (localStorage) –
  nichts auf dem Server, keine Konten, keine Datenbank.
- Geteilt wird die Datei wie ein Foto: per WhatsApp, Mail, AirDrop oder in «Dateien».
- Der Code dafür steht in `mappe.js` und ist in allen Tools gleich (wie `marke.css`),
  ebenso diese Beschreibung. Bei Änderungen in allen Tools ersetzen.
- Tools mit Übemappe: Übe-Timer (`uebetimer`), Würfel (`wuerfel`); Schülergespräch (`gespraech`)
  auf der Übersichtsseite marcscheidegger.ch/mappe.html (Code: `js/gespraech.js` der Website).

## Aufbau (Version 1)

```json
{
  "format": "uebemappe",
  "version": 1,
  "name": "Lea",
  "erstellt": "2026-11-19T14:05:00.000Z",
  "geaendert": "2026-11-19T15:10:00.000Z",
  "tools": {
    "uebetimer": { "version": 1, "…": "…" },
    "wuerfel":   { "version": 1, "…": "…" }
  }
}
```

| Feld | Bedeutung |
|---|---|
| `format` | immer `"uebemappe"` – daran erkennt ein Tool die Datei |
| `version` | Version des Mappen-Formats. Neuere Versionen lehnt ein älteres Tool ab, ältere liest es weiter. |
| `name` | freiwillig, z. B. Vorname. Steht nur in der Datei. |
| `erstellt`, `geaendert` | Zeitstempel (ISO 8601, UTC) |
| `tools` | je Tool ein eigener Teil mit eigener `version` |

**Regel:** Ein Tool liest und schreibt nur seinen eigenen Teil. Teile anderer Tools – auch
unbekannte – bleiben beim Speichern unverändert. So kann eine Mappe von Tool zu Tool wandern.

## Teil `uebetimer` (Version 1)

```json
{
  "version": 1,
  "plan": [ { "thema": "Tonleitern", "sekunden": 600 } ],
  "journal": [
    {
      "start": "2026-11-19T14:05:00.000Z",
      "ende":  "2026-11-19T14:35:00.000Z",
      "notizen": "Allgemeine Notizen zur Übesession",
      "uebungen": [
        {
          "thema": "Tonleitern",
          "geplant": 600,
          "geuebt": 612,
          "start": "2026-11-19T14:05:00.000Z",
          "ende":  "2026-11-19T14:15:12.000Z",
          "status": "erledigt",
          "notiz": "Tempo 80 klappt"
        }
      ]
    }
  ]
}
```

- `plan`: das Übeprogramm (Thema und Dauer in Sekunden). Beim Öffnen einer Mappe wird es
  übernommen – so kann die Lehrperson einen Plan vorbereiten und als Mappe schicken.
- `journal`: alle Übesessions, älteste zuerst. `status` ist `erledigt`, `übersprungen`,
  `abgebrochen` oder `nicht geübt`; Zeiten in Sekunden.

## Teil `wuerfel` (Version 1)

```json
{
  "version": 1,
  "lernstand": { "C": { "ja": 3, "nein": 1, "zuletzt": "ja" } },
  "verlauf": [ { "zeit": "2026-11-19T14:20:00.000Z", "akkord": "Dm", "gewusst": false } ],
  "caged": { "pentatonik": true, "leitGleit": false, "mollDurZahlen": false }
}
```

- `lernstand`: pro Akkord der 1. Lage, wie oft gewusst / nicht gewusst und die letzte Antwort.
  Gewusste Akkorde kommen im Würfel nicht mehr vor.
- `verlauf`: jede Antwort mit Zeitstempel, älteste zuerst (höchstens 1000 Einträge).
- `caged`: Anzeige-Einstellungen des CAGED-Würfels.
- Wer eine Mappe öffnet, arbeitet mit deren Lernstand weiter – so können mehrere
  Schüler/innen am selben iPad je ihre eigene Mappe öffnen.

## Teil `gespraech` (Version 1)

Schülergespräch, ausgefüllt auf marcscheidegger.ch/mappe.html. Keine Noten: Sterne zeigen
Stand und Schwerpunkte, die Lücke zwischen «wichtig» und «kann ich» zeigt mögliche Ziele.

```json
{
  "version": 1,
  "gespraeche": [
    {
      "datum": "2027-06-20",
      "schuljahr": "2026/27",
      "spieljahr": 3, "band": 1, "konzerte": 2,
      "bewertung": { "barre": { "sus": 2, "wichtig": 5, "lp": 2 } },
      "notizen": { "akkordspiel": "Barré F klappt noch nicht sauber" },
      "ueben": { "ist": 2, "ziel": 4 },
      "handlungen": [ { "ziel": "Akkordspiel: Barré Akkorde", "massnahme": "Täglich 5 min F-Dur", "bis": "Weihnachten" } ],
      "allgemein": "Notizen zum Gespräch",
      "kennzahlen": { "sessions": 120, "uebezeit": 172800, "wochenMitUeben": 34, "akkordeGewusst": 15, "akkordeNeu": ["F", "B7"] }
    }
  ]
}
```

- `bewertung`: pro Kriterium 0–5 Sterne (0 = leer). `sus` = «So gut kann ich es», `wichtig` =
  «So wichtig ist es mir» (beides Schüler/in), `lp` = Einschätzung der Lehrperson.
- Kriterien-IDs (aus der Vorlage «Schülergespräch»): `minis`, `akkorde1`, `barre`, `daumengriff`,
  `akkordeFinden`, `toene1`, `tab`, `riffs`, `percussive`, `improvisieren`, `fingersatz`,
  `daumenschlag`, `pickMelodie`, `tirando`, `chickenPick`, `fingerstyle`, `daumen`, `pickBegleitung`,
  `spanisch`, `schoenerTon`, `verstaerker`, `ausDenHaenden`, `gestaltung`, `improvisation`, `band`,
  `vorspiel`, `motivation`. IDs nie umbenennen, nur neue ergänzen.
- `notizen`: pro Thema (z. B. `akkordspiel`, `anschlagMelodie`) ein freier Text.
- `ueben`: «Wie ist es» und «Was nehmen wir uns vor», je 0–5.
- `kennzahlen`: Zusammenfassung des Schuljahres aus Übe-Timer und Würfel beim Gespräch
  (`uebezeit` in Sekunden), damit sie auch später im Gespräch stehen.
- Schuljahr = 1. August bis 31. Juli.

**Grösse:** Ein ganzes Schuljahr mit rund 250 Übesessions, 1000 Würfel-Antworten und
Gesprächen ergibt etwa 0.4 MB – kein Problem für WhatsApp oder Mail.

## Weitere Tools

Ein neues Tool bekommt einen eigenen Schlüssel unter `tools` (z. B. `wuerfel`) mit eigener
`version` und wird hier beschrieben.
