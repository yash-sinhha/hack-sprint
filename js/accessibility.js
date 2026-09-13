/**
 * Smart Event Experience Platform - Accessibility & Audio Engine
 */

export class AccessibilityManager {
  constructor() {
    this.storageKey = "nexus_a11y_prefs";
    this.prefs = this.loadPrefs();
    this.speechSynth = window.speechSynthesis || null;
    this.audioCtx = null;

    this.applyPreferences();
  }

  loadPrefs() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load a11y preferences, using defaults", e);
    }
    return {
      highContrast: false,
      fontSize: "normal", // normal, large, xlarge
      speechEnabled: true,
      soundChimes: true,
      reducedMotion: false
    };
  }

  savePrefs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.prefs));
    } catch (e) {
      console.error("Failed to save a11y preferences", e);
    }
  }

  toggleHighContrast() {
    this.prefs.highContrast = !this.prefs.highContrast;
    this.applyPreferences();
    this.savePrefs();
    this.announceToScreenReader(`High contrast mode ${this.prefs.highContrast ? 'enabled' : 'disabled'}`);
    return this.prefs.highContrast;
  }

  setFontSize(size) {
    if (["normal", "large", "xlarge"].includes(size)) {
      this.prefs.fontSize = size;
      this.applyPreferences();
      this.savePrefs();
      this.announceToScreenReader(`Font size set to ${size}`);
    }
  }

  toggleSpeech() {
    this.prefs.speechEnabled = !this.prefs.speechEnabled;
    this.savePrefs();
    return this.prefs.speechEnabled;
  }

  toggleSoundChimes() {
    this.prefs.soundChimes = !this.prefs.soundChimes;
    this.savePrefs();
    return this.prefs.soundChimes;
  }

  applyPreferences() {
    const root = document.documentElement;

    // High Contrast class
    if (this.prefs.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Font size classes
    root.classList.remove("font-normal", "font-large", "font-xlarge");
    root.classList.add(`font-${this.prefs.fontSize}`);

    // Reduced motion
    if (this.prefs.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }
  }

  announceToScreenReader(message) {
    let announcer = document.getElementById("a11y-live-announcer");
    if (!announcer) {
      announcer = document.createElement("div");
      announcer.id = "a11y-live-announcer";
      announcer.className = "sr-only";
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      document.body.appendChild(announcer);
    }
    announcer.textContent = "";
    setTimeout(() => {
      announcer.textContent = message;
    }, 50);
  }

  speak(text) {
    if (!this.prefs.speechEnabled || !this.speechSynth) return;
    this.speechSynth.cancel(); // Stop any pending speech

    const cleanText = text.replace(/[^\w\s.,?!-]/gi, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    this.speechSynth.speak(utterance);
  }

  stopSpeech() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  /**
   * Synthesizes audio tones using Web Audio API (Zero external audio files required!)
   */
  playChime(type = "info") {
    if (!this.prefs.soundChimes) return;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === "urgent" || type === "sos") {
        // High attention dual-tone alarm
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(660, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "alert") {
        // Warning chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        // Gentle informational pleasant notification chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn("Audio synthesis error", e);
    }
  }
}

