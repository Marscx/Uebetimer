# Übe-Timer

Multi-Timer für Übeprogramme im Look des Time Timers.

- Timer hinzufügen, Thema und Dauer (Minuten/Sekunden) einstellen, Reihenfolge ändern
- Beim Start laufen die Timer nacheinander ab, mit Gong am Ende jeder Übung
- Pause, +1 Min, Überspringen, Beenden (Leertaste = Pause/Weiter)
- Timerfarbe wählbar: Rot, Grün, Hellblau, Orange, Gelb oder gemischt (zufällig pro Übung)
- Die Skala der Uhr passt sich der Dauer an (5, 10, 20, 30, 60, 120 Min …)
- Am Schluss: Journal mit Notizen pro Übung als Textdatei herunterladen
- Das Programm wird im Browser gespeichert (localStorage)

Reines HTML/CSS/JS, keine Abhängigkeiten. Bei Änderungen an `uebe.js` / `uebe.css`
die Versionsnummer `?v=N` in `index.html` erhöhen.

## Einbetten (z.B. WordPress)

Mit `?embed` erscheint der Timer ohne Kopfzeile, mit transparentem Hintergrund und immer hell:

```html
<iframe src="https://uebetimer.marcscheidegger.ch/?embed" title="Übe-Timer" allow="screen-wake-lock; autoplay" loading="lazy" style="width:100%;height:950px;border:0;"></iframe>
```

## Lizenz

Übe-Timer von [Marc Scheidegger](https://marcscheidegger.ch), entwickelt mit Claude (Anthropic),
lizenziert unter [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de).
