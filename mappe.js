'use strict';

// =============================================================================
// Übemappe – gemeinsames Dateiformat aller Übe-Tools von marcscheidegger.ch
// =============================================================================
// Eine Übemappe ist eine JSON-Datei, die der Schüler / die Schülerin selbst besitzt.
// Sie wird heruntergeladen oder geteilt (WhatsApp, Mail …) und später wieder geöffnet,
// um am selben Ort weiterzumachen. Nichts davon landet auf dem Server.
//
// Diese Datei ist in jedem Tool gleich (wie marke.css). Bei Änderungen in allen Tools ersetzen.
// Beschreibung des Formats: MAPPE.md
//
// Aufbau (Version 1):
//   {
//     "format":   "uebemappe",
//     "version":  1,
//     "name":     "Lea",                      // freiwillig, nur in der Datei
//     "erstellt": "2026-11-19T14:05:00.000Z",
//     "geaendert":"2026-11-19T15:10:00.000Z",
//     "tools": {
//       "uebetimer": { "version": 1, ... },   // jedes Tool hat seinen eigenen Teil
//       "wuerfel":   { "version": 1, ... }
//     }
//   }
// Ein Tool liest und schreibt nur seinen eigenen Teil. Teile anderer Tools – auch solche,
// die es noch gar nicht kennt – bleiben beim Speichern unverändert erhalten.
//
// Jedes Tool merkt sich die zuletzt geöffnete Mappe im Browser (localStorage), damit
// nach dem Neuladen nichts verloren geht. Die Datei bleibt aber das Original.

const Mappe = (() => {
    const FORMAT = 'uebemappe';
    const VERSION = 1;
    const KEY = 'uebemappe.v1';

    function neu() {
        const jetzt = new Date().toISOString();
        return { format: FORMAT, version: VERSION, name: '', erstellt: jetzt, geaendert: jetzt, tools: {} };
    }

    // Prüft ein eingelesenes Objekt und ergänzt fehlende Felder. Wirft einen Fehler mit
    // verständlichem Text, wenn es keine Übemappe ist.
    function pruefen(m) {
        if (!m || typeof m !== 'object' || m.format !== FORMAT) {
            throw new Error('Diese Datei ist keine Übemappe.');
        }
        if (typeof m.version !== 'number' || m.version > VERSION) {
            throw new Error('Diese Übemappe stammt aus einer neueren Version. Bitte die Seite neu laden.');
        }
        if (!m.tools || typeof m.tools !== 'object') m.tools = {};
        if (typeof m.name !== 'string') m.name = '';
        if (!m.erstellt) m.erstellt = new Date().toISOString();
        return m;
    }

    // Zuletzt verwendete Mappe aus dem Browser (oder eine neue, leere)
    function laden() {
        try {
            const text = localStorage.getItem(KEY);
            if (text) return pruefen(JSON.parse(text));
        } catch (e) { /* kaputt oder kein Speicher: neu beginnen */ }
        return neu();
    }

    function merken(m) {
        m.geaendert = new Date().toISOString();
        try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { /* ohne Speicher weiter */ }
    }

    // Teil eines Tools holen; fehlt er, wird er mit den Startwerten angelegt
    function teil(m, tool, start) {
        if (!m.tools[tool] || typeof m.tools[tool] !== 'object') m.tools[tool] = start();
        return m.tools[tool];
    }

    // Datei (aus <input type="file">) lesen → Promise mit der Mappe
    function oeffnen(datei) {
        return datei.text().then((text) => {
            let m;
            try { m = JSON.parse(text); } catch (e) { throw new Error('Diese Datei ist keine Übemappe.'); }
            return pruefen(m);
        });
    }

    // Dateiname wie "Uebemappe-Lea-2026-11-19.json" (ohne Umlaute und Sonderzeichen)
    function dateiname(m) {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const name = (m.name || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
        return `Uebemappe-${name ? name + '-' : ''}${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
    }

    function alsDatei(m) {
        m.geaendert = new Date().toISOString();
        return new File([JSON.stringify(m, null, 2)], dateiname(m), { type: 'application/json' });
    }

    // Herunterladen (Computer) …
    function herunterladen(m) {
        const datei = alsDatei(m);
        const url = URL.createObjectURL(datei);
        const a = document.createElement('a');
        a.href = url;
        a.download = datei.name;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // … oder teilen (iPad / Handy: WhatsApp, Mail, Dateien). Gibt false zurück, wenn
    // das Gerät keine Dateien teilen kann – dann wird stattdessen heruntergeladen.
    function kannTeilen() {
        try {
            return !!(navigator.canShare && navigator.canShare({ files: [new File(['{}'], 'x.json', { type: 'application/json' })] }));
        } catch (e) { return false; }
    }
    function teilen(m) {
        if (!kannTeilen()) { herunterladen(m); return Promise.resolve(false); }
        const datei = alsDatei(m);
        return navigator.share({ files: [datei], title: 'Übemappe' + (m.name ? ' ' + m.name : '') })
            .then(() => true, () => false);   // abgebrochen: nichts tun
    }

    return { neu, laden, merken, teil, oeffnen, herunterladen, teilen, kannTeilen, dateiname, VERSION };
})();
