/**
 * Sound Effects Manager
 * Handles playing audio for game events
 */

import { get } from 'svelte/store';
import { settings } from '../stores/settings';

// Sound file paths (relative to public folder)
const SOUNDS = {
  news: '/sounds/gong.wav',      // News events and data releases
  voiceRfq: '/sounds/horn.wav',  // New voice RFQ request
  trade: '/sounds/beep.mp3',     // Client trade executed (voice/electronic)
} as const;

type SoundType = keyof typeof SOUNDS;

// Audio element cache
const audioCache: Map<SoundType, HTMLAudioElement> = new Map();

// Preload sounds for faster playback
export function preloadSounds(): void {
  for (const [key, path] of Object.entries(SOUNDS)) {
    const audio = new Audio(path);
    audio.preload = 'auto';
    audioCache.set(key as SoundType, audio);
  }
}

// Play a sound effect
export function playSound(type: SoundType): void {
  const currentSettings = get(settings);
  if (!currentSettings.sound.enabled) return;

  let audio = audioCache.get(type);
  if (!audio) {
    audio = new Audio(SOUNDS[type]);
    audioCache.set(type, audio);
  }

  // Clone the audio to allow overlapping sounds
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.volume = currentSettings.sound.volume;
  clone.play().catch(() => {
    // Ignore autoplay errors (browser restrictions)
  });
}

// Convenience functions
export const playNewsSound = () => playSound('news');
export const playVoiceRfqSound = () => playSound('voiceRfq');
export const playTradeSound = () => playSound('trade');
