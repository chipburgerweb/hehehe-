// Gentle celestial Web Audio API music box playing "Happy Birthday"
// Requires zero external audio assets and works seamlessly offline.

interface NoteStep {
  freq: number;
  beats: number;
  harmony?: number;
}

const HAPPY_BIRTHDAY_MELODY: NoteStep[] = [
  { freq: 392.0, beats: 0.75, harmony: 261.63 }, // G4
  { freq: 392.0, beats: 0.25 }, // G4
  { freq: 440.0, beats: 1.0, harmony: 261.63 }, // A4
  { freq: 392.0, beats: 1.0, harmony: 246.94 }, // G4
  { freq: 523.25, beats: 1.0, harmony: 329.63 }, // C5
  { freq: 493.88, beats: 2.0, harmony: 293.66 }, // B4

  { freq: 392.0, beats: 0.75, harmony: 293.66 }, // G4
  { freq: 392.0, beats: 0.25 }, // G4
  { freq: 440.0, beats: 1.0, harmony: 293.66 }, // A4
  { freq: 392.0, beats: 1.0, harmony: 246.94 }, // G4
  { freq: 587.33, beats: 1.0, harmony: 349.23 }, // D5
  { freq: 523.25, beats: 2.0, harmony: 329.63 }, // C5

  { freq: 392.0, beats: 0.75, harmony: 261.63 }, // G4
  { freq: 392.0, beats: 0.25 }, // G4
  { freq: 783.99, beats: 1.0, harmony: 392.0 }, // G5
  { freq: 659.25, beats: 1.0, harmony: 329.63 }, // E5
  { freq: 523.25, beats: 1.0, harmony: 261.63 }, // C5
  { freq: 493.88, beats: 1.0, harmony: 293.66 }, // B4
  { freq: 440.0, beats: 1.8, harmony: 349.23 }, // A4

  { freq: 698.46, beats: 0.75, harmony: 349.23 }, // F5
  { freq: 698.46, beats: 0.25 }, // F5
  { freq: 659.25, beats: 1.0, harmony: 329.63 }, // E5
  { freq: 523.25, beats: 1.0, harmony: 261.63 }, // C5
  { freq: 587.33, beats: 1.0, harmony: 293.66 }, // D5
  { freq: 523.25, beats: 2.4, harmony: 261.63 }, // C5
];

class CelestialMusicBox {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: number | null = null;
  private stepIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playBellNote(freq: number, durationSec: number, gainPeak = 0.09) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const gain = ctx.createGain();
    const shimmerGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec + 0.9);

    shimmerGain.gain.setValueAtTime(0.0001, now);
    shimmerGain.gain.exponentialRampToValueAtTime(gainPeak * 0.22, now + 0.02);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec + 0.45);

    osc.connect(gain);
    shimmer.connect(shimmerGain);
    gain.connect(ctx.destination);
    shimmerGain.connect(ctx.destination);

    osc.start(now);
    shimmer.start(now);
    osc.stop(now + durationSec + 1.0);
    shimmer.stop(now + durationSec + 0.6);
  }

  public playChime(freq = 659.25) {
    this.playBellNote(freq, 0.45, 0.07);
  }

  public start(onStateChange?: (playing: boolean) => void) {
    if (this.isPlaying) return;
    this.ensureContext();
    this.isPlaying = true;
    this.stepIndex = 0;
    onStateChange?.(true);
    this.scheduleNext();
  }

  private scheduleNext() {
    if (!this.isPlaying) return;
    const note = HAPPY_BIRTHDAY_MELODY[this.stepIndex];
    const beatMs = 460;
    const durationMs = note.beats * beatMs;

    this.playBellNote(note.freq, durationMs / 1000, 0.085);
    if (note.harmony) {
      this.playBellNote(note.harmony, (durationMs / 1000) * 1.15, 0.035);
    }

    this.stepIndex = (this.stepIndex + 1) % HAPPY_BIRTHDAY_MELODY.length;
    this.timerId = window.setTimeout(() => {
      this.scheduleNext();
    }, durationMs);
  }

  public stop(onStateChange?: (playing: boolean) => void) {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    onStateChange?.(false);
  }

  public toggle(onStateChange?: (playing: boolean) => void): boolean {
    if (this.isPlaying) {
      this.stop(onStateChange);
      return false;
    }
    this.start(onStateChange);
    return true;
  }
}

export const musicBox = new CelestialMusicBox();
