'use strict';

// ---------- Hilfsfunktionen ----------

const $ = (sel) => document.querySelector(sel);
const PLAN_KEY = 'uebetimer.plan.v1';
const SOUND_KEY = 'uebetimer.sound.v1';

const uid = () => Math.random().toString(36).slice(2, 10);

function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

const fmtClock = (d) => d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d) => d.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function show(id) {
    for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id;
    window.scrollTo(0, 0);
}

// ---------- Skala der Uhr ----------
// Wie beim echten Time Timer gibt es verschiedene Skalen (5, 20, 60, 120 Min ...).
// Gewählt wird die kleinste, in die die Dauer passt.

const SCALES = [
    { total: 5, major: 1, minor: 0.25 },
    { total: 10, major: 1, minor: 0.5 },
    { total: 20, major: 5, minor: 1 },
    { total: 30, major: 5, minor: 1 },
    { total: 60, major: 5, minor: 1 },
    { total: 120, major: 10, minor: 2 },
    { total: 180, major: 15, minor: 3 },
];

function scaleFor(sec) {
    const min = sec / 60;
    const s = SCALES.find((sc) => min <= sc.total);
    if (s) return s;
    const total = Math.ceil(min / 60) * 60;
    return { total, major: total / 12, minor: total / 60 };
}

function buildDial(el, scale) {
    el.style.setProperty('--minor', 360 / (scale.total / scale.minor) + 'deg');
    el.style.setProperty('--major', 360 / (scale.total / scale.major) + 'deg');
    const numbers = el.querySelector('.numbers');
    if (!numbers) return;
    numbers.textContent = '';
    for (let v = 0; v < scale.total; v += scale.major) {
        const span = document.createElement('span');
        span.textContent = v;
        span.style.setProperty('--a', (-v / scale.total) * 360 + 'deg');
        numbers.append(span);
    }
}

function setSweep(el, remainingSec, scale) {
    const deg = Math.min(360, Math.max(0, (remainingSec / 60 / scale.total) * 360));
    el.style.setProperty('--sweep', deg + 'deg');
}

// ---------- Programm (Setup) ----------

let plan = loadPlan();

function loadPlan() {
    try {
        const data = JSON.parse(localStorage.getItem(PLAN_KEY));
        if (Array.isArray(data) && data.length) return data;
    } catch (e) { /* ohne Speicher weiter */ }
    return [
        { id: uid(), topic: 'Einspielen', sec: 5 * 60 },
        { id: uid(), topic: 'Tonleitern', sec: 10 * 60 },
        { id: uid(), topic: 'Stück', sec: 15 * 60 },
    ];
}

function savePlan() {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch (e) { /* egal */ }
}

// ---------- Farben ----------
// Eine feste Farbe für alle Übungen oder "gemischt": jede Übung bekommt zufällig
// eine der hellen Farben, nie zweimal dieselbe hintereinander.

const COLORS = {
    rot: '#d8262c',
    gruen: '#5cc96b',
    hellblau: '#4fb6ea',
    orange: '#f5922f',
    gelb: '#f7c925',
};
const MIX = ['gruen', 'hellblau', 'orange', 'gelb'];
const COLOR_KEY = 'uebetimer.farbe.v1';

let colorMode = 'rot';
let mixSeq = [];
try {
    const saved = localStorage.getItem(COLOR_KEY);
    if (saved in COLORS || saved === 'gemischt') colorMode = saved;
} catch (e) { /* egal */ }

// Farbe für die Übung an Position i
function colorAt(i) {
    if (colorMode !== 'gemischt') return COLORS[colorMode];
    while (mixSeq.length <= i) {
        const prev = mixSeq[mixSeq.length - 1];
        const options = MIX.filter((c) => c !== prev);
        mixSeq.push(options[Math.floor(Math.random() * options.length)]);
    }
    return COLORS[mixSeq[i]];
}

// Buttons und Akzente in der Timerfarbe; Text dunkel auf hellen Farben
function setAccent(hex) {
    const root = document.documentElement.style;
    if (!hex) {
        // "gemischt": neutrale Buttons in Schriftfarbe
        root.setProperty('--accent', 'var(--ink)');
        root.setProperty('--accent-ink', 'var(--bg)');
        return;
    }
    const n = parseInt(hex.slice(1), 16);
    const light = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 140;
    root.setProperty('--accent', hex);
    root.setProperty('--accent-ink', light ? '#1d1d1f' : '#ffffff');
}

function applyColorMode() {
    for (const b of document.querySelectorAll('.swatch')) {
        b.setAttribute('aria-pressed', String(b.dataset.color === colorMode));
    }
    setAccent(colorMode === 'gemischt' ? null : COLORS[colorMode]);
}

for (const b of document.querySelectorAll('.swatch')) {
    b.addEventListener('click', () => {
        colorMode = b.dataset.color;
        mixSeq = []; // bei jedem Klick auf "gemischt" neu würfeln
        try { localStorage.setItem(COLOR_KEY, colorMode); } catch (e) { /* egal */ }
        applyColorMode();
        renderPlan();
    });
}

function renderPlan(focusId) {
    const list = $('#planList');
    const tpl = $('#planItemTpl');
    list.textContent = '';

    plan.forEach((item, i) => {
        const li = tpl.content.firstElementChild.cloneNode(true);
        const dial = li.querySelector('.dial');
        const topic = li.querySelector('.topic');
        const min = li.querySelector('.min');
        const sec = li.querySelector('.sec');

        topic.value = item.topic;
        min.value = Math.floor(item.sec / 60);
        sec.value = item.sec % 60;
        dial.style.setProperty('--disc', colorAt(i));

        const updateDial = () => {
            const sc = scaleFor(item.sec);
            buildDial(dial, sc);
            setSweep(dial, item.sec, sc);
        };
        updateDial();

        topic.addEventListener('input', () => { item.topic = topic.value; savePlan(); });

        const onDuration = () => {
            const m = Math.max(0, parseInt(min.value, 10) || 0);
            const s = Math.min(59, Math.max(0, parseInt(sec.value, 10) || 0));
            item.sec = m * 60 + s;
            updateDial();
            updateTotal();
            savePlan();
        };
        min.addEventListener('input', onDuration);
        sec.addEventListener('input', onDuration);
        sec.addEventListener('change', () => { sec.value = item.sec % 60; });

        const up = li.querySelector('.up');
        const down = li.querySelector('.down');
        up.disabled = i === 0;
        down.disabled = i === plan.length - 1;
        up.addEventListener('click', () => move(i, -1));
        down.addEventListener('click', () => move(i, 1));
        li.querySelector('.del').addEventListener('click', () => {
            plan.splice(i, 1);
            savePlan();
            renderPlan();
        });

        list.append(li);
        if (item.id === focusId) topic.focus();
    });

    updateTotal();
}

function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= plan.length) return;
    [plan[i], plan[j]] = [plan[j], plan[i]];
    savePlan();
    renderPlan();
}

function updateTotal() {
    const valid = plan.filter((p) => p.sec > 0);
    const total = valid.reduce((sum, p) => sum + p.sec, 0);
    $('#planTotal').textContent = valid.length
        ? `${valid.length} ${valid.length === 1 ? 'Übung' : 'Übungen'} · Gesamtdauer ${fmt(total)}`
        : 'Noch keine Übung mit Dauer';
    $('#startBtn').disabled = !valid.length;
}

$('#addBtn').addEventListener('click', () => {
    const item = { id: uid(), topic: '', sec: 5 * 60 };
    plan.push(item);
    savePlan();
    renderPlan(item.id);
});

// ---------- Ton ----------

let audioCtx = null;
const soundToggle = $('#soundToggle');
try { soundToggle.checked = localStorage.getItem(SOUND_KEY) !== 'off'; } catch (e) { /* egal */ }
soundToggle.addEventListener('change', () => {
    try { localStorage.setItem(SOUND_KEY, soundToggle.checked ? 'on' : 'off'); } catch (e) { /* egal */ }
});

function ensureAudio() {
    try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { audioCtx = null; }
}

// Gong: zwei Sinustöne, bei times > 1 mehrfach hintereinander
function chime(times = 1) {
    if (!audioCtx || !soundToggle.checked) return;
    const t0 = audioCtx.currentTime + 0.05;
    for (let i = 0; i < times; i++) {
        [880, 1320].forEach((freq, j) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const t = t0 + i * 0.7 + j * 0.18;
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 1.5);
        });
    }
}

// ---------- Bildschirm wach halten ----------

let wakeLock = null;
async function requestWakeLock() {
    try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (e) { wakeLock = null; }
}
function releaseWakeLock() {
    try { wakeLock?.release(); } catch (e) { /* egal */ }
    wakeLock = null;
}

// ---------- Ablauf ----------
// Die Zeit wird immer aus Date.now() berechnet, nicht durch Mitzählen.
// So bleibt der Timer auch genau, wenn der Tab im Hintergrund gedrosselt wird.

const bigDial = $('#bigDial');
let session = null;
let loopId = null;

function startProgram() {
    // Farbe nach Position in der Liste, so wie bei den kleinen Uhren
    const items = plan.map((p, i) => ({ ...p, color: colorAt(i) })).filter((p) => p.sec > 0);
    if (!items.length) return;
    ensureAudio();

    session = {
        startedAt: new Date(),
        endedAt: null,
        index: 0,
        paused: false,
        segStart: 0,   // Zeitpunkt (ms), seit dem das aktuelle Stück läuft
        accum: 0,      // Sekunden, die vor der letzten Pause schon gelaufen sind
        scale: null,
        items: items.map((p) => ({
            topic: p.topic.trim() || 'Ohne Thema',
            planned: p.sec,
            color: p.color,
            actual: 0,
            start: null,
            end: null,
            status: 'nicht geübt',
            note: '',
        })),
    };

    buildProgress();
    show('run');
    requestWakeLock();
    beginItem(0, Date.now());
    loopId = setInterval(tick, 200);
}

function beginItem(i, startMs) {
    session.index = i;
    session.accum = 0;
    session.segStart = startMs;
    session.paused = false;
    const item = session.items[i];
    item.start = new Date(startMs);
    item.status = 'läuft';
    bigDial.style.setProperty('--disc', item.color);
    setAccent(item.color);
    rebuildScale();
    renderRun();
}

function rebuildScale() {
    session.scale = scaleFor(current().planned);
    buildDial(bigDial, session.scale);
}

const current = () => session.items[session.index];

function elapsed() {
    return session.accum + (session.paused ? 0 : (Date.now() - session.segStart) / 1000);
}

function tick() {
    if (!session || session.endedAt) return;
    // Falls der Tab lange im Hintergrund war, können mehrere Übungen fällig sein
    while (!session.paused && elapsed() >= current().planned) {
        const item = current();
        const endMs = session.segStart + (item.planned - session.accum) * 1000;
        item.actual = item.planned;
        item.end = new Date(endMs);
        item.status = 'erledigt';
        if (session.index + 1 < session.items.length) {
            chime(1);
            beginItem(session.index + 1, endMs);
        } else {
            chime(3);
            finishProgram();
            return;
        }
    }
    renderRun();
}

function renderRun() {
    const item = current();
    const remaining = item.planned - elapsed();
    const n = session.items.length;

    $('#runCount').textContent = `Übung ${session.index + 1} von ${n}`;
    $('#runTopic').textContent = item.topic;
    $('#runTime').textContent = fmt(Math.ceil(remaining));
    setSweep(bigDial, remaining, session.scale);

    const next = session.items[session.index + 1];
    $('#runNext').textContent = next ? `Als Nächstes: ${next.topic} (${fmt(next.planned)})` : 'Letzte Übung – gleich geschafft!';

    $('#run').classList.toggle('paused', session.paused);
    $('#pauseBtn').textContent = session.paused ? '▶ Weiter' : '❚❚ Pause';
    document.title = `${fmt(Math.ceil(remaining))} · ${item.topic} – Übe-Timer`;

    // Fortschrittsbalken
    const bars = $('#runProgress').children;
    session.items.forEach((it, i) => {
        let frac = 0;
        if (i < session.index) frac = 1;
        else if (i === session.index) frac = Math.min(1, elapsed() / it.planned);
        bars[i].firstChild.style.width = frac * 100 + '%';
    });
}

function buildProgress() {
    const bar = $('#runProgress');
    bar.textContent = '';
    for (const it of session.items) {
        const span = document.createElement('span');
        span.style.flex = String(it.planned);
        span.title = it.topic;
        span.style.setProperty('--disc', it.color);
        span.append(document.createElement('i'));
        bar.append(span);
    }
}

function togglePause() {
    if (!session || session.endedAt) return;
    if (session.paused) {
        session.segStart = Date.now();
        session.paused = false;
    } else {
        session.accum = elapsed();
        session.paused = true;
    }
    renderRun();
}

function addMinute() {
    if (!session || session.endedAt) return;
    current().planned += 60;
    const bar = $('#runProgress').children[session.index];
    bar.style.flex = String(current().planned);
    rebuildScale();
    renderRun();
}

function skipItem() {
    if (!session || session.endedAt) return;
    const item = current();
    item.actual = elapsed();
    item.end = new Date();
    item.status = 'übersprungen';
    if (session.index + 1 < session.items.length) {
        beginItem(session.index + 1, Date.now());
    } else {
        finishProgram();
    }
}

function stopProgram() {
    if (!session || session.endedAt) return;
    if (!confirm('Übeprogramm jetzt beenden?')) return;
    const item = current();
    item.actual = elapsed();
    item.end = new Date();
    item.status = item.actual >= 1 ? 'abgebrochen' : 'nicht geübt';
    finishProgram();
}

function finishProgram() {
    clearInterval(loopId);
    session.endedAt = new Date();
    releaseWakeLock();
    document.title = 'Übe-Timer';
    applyColorMode();
    renderJournal();
    show('done');
}

$('#startBtn').addEventListener('click', startProgram);
$('#pauseBtn').addEventListener('click', togglePause);
$('#plusBtn').addEventListener('click', addMinute);
$('#skipBtn').addEventListener('click', skipItem);
$('#stopBtn').addEventListener('click', stopProgram);

document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || $('#run').hidden) return;
    if (e.target.closest('input, textarea, button')) return;
    e.preventDefault();
    togglePause();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && session && !session.endedAt) {
        requestWakeLock();
        tick();
    }
});

window.addEventListener('beforeunload', (e) => {
    if (session && !session.endedAt) e.preventDefault();
});

// ---------- Journal ----------

function totalPracticed() {
    return session.items.reduce((sum, it) => sum + it.actual, 0);
}

function renderJournal() {
    const done = session.items.filter((it) => it.status === 'erledigt').length;
    const planned = session.items.reduce((sum, it) => sum + it.planned, 0);
    $('#doneSummary').textContent =
        `${fmtDate(session.startedAt)}, ${fmtClock(session.startedAt)}–${fmtClock(session.endedAt)} · ` +
        `geübt ${fmt(totalPracticed())} von ${fmt(planned)} · ${done} von ${session.items.length} Übungen erledigt`;

    const list = $('#doneList');
    list.textContent = '';
    for (const it of session.items) {
        const li = document.createElement('li');
        const row = document.createElement('div');
        row.className = 'row';

        const topic = document.createElement('span');
        topic.className = 'j-topic';
        topic.textContent = it.topic;

        const meta = document.createElement('span');
        meta.className = 'j-meta';
        const when = it.start && it.end ? `${fmtClock(it.start)}–${fmtClock(it.end)} · ` : '';
        meta.textContent = `${when}${fmt(it.actual)} / ${fmt(it.planned)}`;

        const badge = document.createElement('span');
        badge.className = 'badge' + (it.status === 'erledigt' ? ' ok' : '');
        badge.textContent = it.status;

        row.append(topic, meta, badge);

        const note = document.createElement('textarea');
        note.rows = 2;
        note.placeholder = 'Notiz zu dieser Übung (Tempo, Fortschritt, Probleme …)';
        note.addEventListener('input', () => { it.note = note.value; });

        li.append(row, note);
        list.append(li);
    }
    $('#generalNotes').value = '';
}

function journalText() {
    const s = session;
    const planned = s.items.reduce((sum, it) => sum + it.planned, 0);
    const lines = [
        'ÜBE-JOURNAL',
        '===========',
        '',
        `Datum:   ${fmtDate(s.startedAt)}`,
        `Zeit:    ${fmtClock(s.startedAt)}–${fmtClock(s.endedAt)}`,
        `Geübt:   ${fmt(totalPracticed())} (geplant ${fmt(planned)})`,
        '',
        'ÜBUNGEN',
        '-------',
    ];
    s.items.forEach((it, i) => {
        const when = it.start && it.end ? `, ${fmtClock(it.start)}–${fmtClock(it.end)}` : '';
        lines.push(`${i + 1}. ${it.topic}`);
        lines.push(`   ${fmt(it.actual)} von ${fmt(it.planned)} · ${it.status}${when}`);
        if (it.note.trim()) {
            for (const l of it.note.trim().split('\n')) lines.push(`   > ${l}`);
        }
        lines.push('');
    });
    const general = $('#generalNotes').value.trim();
    if (general) {
        lines.push('NOTIZEN', '-------', general, '');
    }
    return lines.join('\n');
}

$('#downloadBtn').addEventListener('click', () => {
    const d = session.startedAt;
    const pad = (n) => String(n).padStart(2, '0');
    const name = `uebe-journal-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.txt`;
    const blob = new Blob(['﻿' + journalText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
});

$('#backBtn').addEventListener('click', () => {
    session = null;
    renderPlan();
    show('setup');
});

// ---------- Start ----------

applyColorMode();
renderPlan();
