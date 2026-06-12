'use strict';

(function () {
  const CHIME_TIMES = new Set(['09:20', '11:30', '12:30', '17:45']);
  const CHIME_SRC = 'audio/chime.mp3';
  const PLAYED_KEY = 'abyssal-drift-played-chimes';
  const CHECK_INTERVAL_MS = 1000;

  function loadPlayedKeys() {
    try {
      const raw = window.localStorage && window.localStorage.getItem(PLAYED_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      return new Set();
    }
  }

  function savePlayedKeys(keys) {
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const compact = Array.from(keys).filter((key) => key.startsWith(today));
      window.localStorage && window.localStorage.setItem(PLAYED_KEY, JSON.stringify(compact));
    } catch (err) {
      // localStorage is optional in some WebView privacy modes.
    }
  }

  function showToast(message, duration) {
    if (window.AbyssalToast && typeof window.AbyssalToast.show === 'function') {
      window.AbyssalToast.show(message, duration);
    }
  }

  async function playMp3Chime() {
    return new Promise((resolve, reject) => {
      let settled = false;
      const audio = new Audio(CHIME_SRC);
      audio.preload = 'auto';
      audio.volume = 0.58;

      const cleanup = () => {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
      };
      const finish = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const fail = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('Unable to play local chime audio.'));
      };
      const onEnded = () => finish();
      const onError = () => fail();

      audio.addEventListener('ended', onEnded, { once: true });
      audio.addEventListener('error', onError, { once: true });

      const playResult = audio.play();
      if (playResult && typeof playResult.then === 'function') {
        playResult.then(() => {
          window.setTimeout(finish, 4500);
        }).catch(fail);
      } else {
        window.setTimeout(finish, 4500);
      }
    });
  }

  function playGeneratedChime() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return Promise.resolve();

    return new Promise((resolve) => {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.04);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
      master.connect(ctx.destination);

      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        const start = ctx.currentTime + index * 0.18;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.42, start + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.35);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(start + 1.45);
      });

      window.setTimeout(() => {
        ctx.close().catch(() => {});
        resolve();
      }, 2450);
    });
  }

  async function playChime() {
    showToast('深海チャイム', 2500);
    try {
      await playMp3Chime();
    } catch (err) {
      try {
        await playGeneratedChime();
      } catch (fallbackErr) {
        // Audio failure must never stop the display app.
      }
    }
  }

  function keyFor(date, hhmm) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hhmm}`;
  }

  const playedKeys = loadPlayedKeys();
  let lastSeenMinute = '';

  function checkChimeSchedule() {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (hhmm === lastSeenMinute) return;
    lastSeenMinute = hhmm;
    if (!CHIME_TIMES.has(hhmm)) return;

    const playedKey = keyFor(now, hhmm);
    if (playedKeys.has(playedKey)) return;
    playedKeys.add(playedKey);
    savePlayedKeys(playedKeys);
    playChime();
  }

  window.playTestChime = function playTestChime() {
    return playChime();
  };

  window.AbyssalChime = {
    check: checkChimeSchedule,
    play: playChime,
    times: Array.from(CHIME_TIMES)
  };

  window.setInterval(checkChimeSchedule, CHECK_INTERVAL_MS);
  checkChimeSchedule();
})();
