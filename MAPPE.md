# Übemappe – gemeinsames Dateiformat der Übe-Tools

Eine **Übemappe** ist eine JSON-Datei, die dem Schüler / der Schülerin gehört. Sie hält fest,
woran gearbeitet wird (z. B. Übeplan und Übe-Journal), damit man in der nächsten Lektion
oder auf einem anderen Gerät am selben Ort weitermachen kann.

- Gespeichert wird **nur in der Datei** und im Browser des Geräts (localStorage) –
  nichts auf dem Server, keine Konten, keine Datenbank.
- Geteilt wird die Datei wie ein Foto: per WhatsApp, Mail, AirDrop oder in «Dateien».
- Der Code dafür steht in `mappe.js` und ist in allen Tools gleich (wie `marke.css`),
  ebenso diese Beschreibung. Bei Änderungen in allen Tools ersetzen.
- Tools mit Übemappe: Übe-Timer (`uebetimer`), Würfel (`wuerfel`).

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

## Weitere Tools

Ein neues Tool bekommt einen eigenen Schlüssel unter `tools` (z. B. `wuerfel`) mit eigener
`version` und wird hier beschrieben.
