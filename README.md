# Übe-Timer

Multi-Timer für Übeprogramme: visueller Timer mit schrumpfender Farbscheibe.

- Timer hinzufügen, Thema und Dauer (Minuten/Sekunden) einstellen, Reihenfolge ändern
- Beim Start laufen die Timer nacheinander ab, mit Gong am Ende jeder Übung
- Pause, +1 Min, Überspringen, Beenden (Leertaste = Pause/Weiter)
- Timerfarbe wählbar: Rot, Grün, Hellblau, Orange, Gelb oder gemischt (zufällig pro Übung)
- Die Skala der Uhr passt sich der Dauer an (5, 10, 20, 30, 60, 120 Min …)
- Am Schluss: Journal mit Notizen pro Übung als Textdatei herunterladen
- Das Programm wird im Browser gespeichert (localStorage)

Reines HTML/CSS/JS, keine Abhängigkeiten. Bei Änderungen an `uebe.js` / `uebe.css` / `marke.css`
die Versionsnummer `?v=N` in `index.html` erhöhen.

Gemeinsamer Auftritt mit [marcscheidegger.ch](https://marcscheidegger.ch): `marke.css` enthält
Kopfleiste (Navigation zwischen den Übe-Tools), Fusszeile und Markenfarben. Die Datei ist in allen
Übe-Tools identisch – Änderungen überall gleich übernehmen.

## Einbetten (z.B. WordPress)

Mit `?embed` erscheint der Timer ohne Kopfleiste und Titel, mit transparentem Hintergrund und immer hell:

```html
<iframe src="https://uebetimer.marcscheidegger.ch/?embed" title="Übe-Timer" allow="screen-wake-lock; autoplay" loading="lazy" style="width:100%;height:950px;border:0;"></iframe>
```

## Lizenz

Übe-Timer von [Marc Scheidegger](https://marcscheidegger.ch), entwickelt mit Claude (Anthropic),
lizenziert unter [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de).
