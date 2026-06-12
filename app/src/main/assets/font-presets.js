'use strict';

(function () {
  const STORAGE_KEY = 'abyssal-drift-font-preset';
  const PRESETS = [
    { id: 'readable', label: 'Readable' },
    { id: 'soft', label: 'Soft' },
    { id: 'handwritten', label: 'Handwritten' },
    { id: 'design', label: 'Design' }
  ];

  function presetIndex(id) {
    const index = PRESETS.findIndex((preset) => preset.id === id);
    return index >= 0 ? index : 0;
  }

  function readStoredPreset() {
    try {
      return window.localStorage && window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  function savePreset(id) {
    try {
      window.localStorage && window.localStorage.setItem(STORAGE_KEY, id);
    } catch (err) {
      // localStorage is optional in Android WebView edge cases.
    }
  }

  function showToast(message, duration) {
    if (window.AbyssalToast && typeof window.AbyssalToast.show === 'function') {
      window.AbyssalToast.show(message, duration);
    }
  }

  let currentIndex = presetIndex(readStoredPreset());

  function applyPreset(id, options) {
    const preset = PRESETS[presetIndex(id)];
    currentIndex = presetIndex(preset.id);
    document.documentElement.setAttribute('data-font-preset', preset.id);
    document.body && document.body.setAttribute('data-font-preset', preset.id);
    const clock = document.getElementById('clockPanel');
    if (clock) clock.setAttribute('data-font-preset', preset.id);
    savePreset(preset.id);
    if (options && options.announce) showToast(`Font: ${preset.label}`, 2000);
  }

  function stepPreset(direction) {
    currentIndex = (currentIndex + direction + PRESETS.length) % PRESETS.length;
    applyPreset(PRESETS[currentIndex].id, { announce: true });
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowRight' || event.keyCode === 39) {
      event.preventDefault();
      stepPreset(1);
    } else if (event.key === 'ArrowLeft' || event.keyCode === 37) {
      event.preventDefault();
      stepPreset(-1);
    }
  }

  function init() {
    applyPreset(PRESETS[currentIndex].id, { announce: false });
    window.addEventListener('keydown', onKeyDown);
  }

  window.AbyssalFontPresets = {
    presets: PRESETS.slice(),
    apply: (id) => applyPreset(id, { announce: true }),
    next: () => stepPreset(1),
    previous: () => stepPreset(-1)
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
