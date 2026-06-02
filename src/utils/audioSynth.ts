// Web Audio API Synthesizer for Voltix Pro GH background music
// Generates soft professional ambient background chord pads and chimes

let audioCtx: AudioContext | null = null;
let isPlaying = false;
let padOscs: OscillatorNode[] = [];
let padGains: GainNode[] = [];
let filterNode: BiquadFilterNode | null = null;
let chimeTimer: any = null;
let chordStep = 0;

// Chords (frequencies in Hz for smooth synth pads)
// Chord progressions represent high-end calming, luxury shop background ambient
const chords = [
  // Cmaj7: C3, E3, G3, B3
  [130.81, 164.81, 196.00, 246.94],
  // Em7: E3, G3, B3, D4
  [164.81, 196.00, 246.94, 293.66],
  // Am7: A2, C3, E3, G3
  [110.00, 130.81, 164.81, 196.00],
  // Fmaj7: F2, A3, C4, E4
  [87.31, 220.00, 261.63, 329.63]
];

// Chime notes for gentle arpeggio highlights
const chimeNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 987.77]; // C5, D5, E5, G5, A5, B5

export function startBackgroundMusic() {
  if (isPlaying) return;
  try {
    // Create AudioContext (must survive Chrome/Safari user action constraints)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
    isPlaying = true;
    chordStep = 0;

    // Create a master volume control
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.12, audioCtx.currentTime); // Low background volume
    masterGain.connect(audioCtx.destination);

    // Create a low pass filter for warm, cozy sound
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(450, audioCtx.currentTime); // Soften everything
    filterNode.Q.setValueAtTime(1, audioCtx.currentTime);
    filterNode.connect(masterGain);

    // Initial chord trigger
    playChordCycle();

    // Start chime sequence on separate schedule
    triggerChimes();
  } catch (error) {
    console.warn("Failed to start synthesizer music:", error);
  }
}

function playChordCycle() {
  if (!isPlaying || !audioCtx) return;

  // Stop any active oscillators
  padOscs.forEach(osc => { try { osc.stop(); } catch (e) {} });
  padGains.forEach(gain => { try { gain.disconnect(); } catch (e) {} });
  padOscs = [];
  padGains = [];

  const now = audioCtx.currentTime;
  const currentNotes = chords[chordStep % chords.length];

  // Spawn low oscillators for rich pad sounds
  currentNotes.forEach(freq => {
    if (!audioCtx || !filterNode) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Soft warm triangle waves
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Slow sweep fade-in and slow fade-out (pad effect)
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 1.2); // Smooth attack
    gain.gain.setValueAtTime(0.25, now + 4.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 6.0); // Gentle release

    osc.connect(gain);
    gain.connect(filterNode);

    osc.start(now);
    padOscs.push(osc);
    padGains.push(gain);
  });

  // Cycle to next chord after 5.5 seconds
  chordStep++;
  chimeTimer = setTimeout(() => {
    playChordCycle();
  }, 5500);
}

function triggerChimes() {
  if (!isPlaying || !audioCtx) return;

  const scheduleNextChime = () => {
    if (!isPlaying || !audioCtx) return;

    const timeToNext = 1200 + Math.random() * 2500; // Random intervals for organic feel
    chimeTimer = setTimeout(() => {
      playSingleChime();
      scheduleNextChime();
    }, timeToNext);
  };

  scheduleNextChime();
}

function playSingleChime() {
  if (!audioCtx || !isPlaying) return;

  const now = audioCtx.currentTime;
  const noteFreq = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];

  // Create a gentle bell chime with delay-like reverb filter
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine'; // Pure clean tones
  osc.frequency.setValueAtTime(noteFreq, now);

  // Very rapid fade in, long ringing release
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.05); // Rapid tap
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5); // long chime tail

  // Connect through low-pass to master or direct output for brilliance
  const chimeFilter = audioCtx.createBiquadFilter();
  chimeFilter.type = 'highpass';
  chimeFilter.frequency.setValueAtTime(800, now); // Retain crystal chime high end

  osc.connect(gain);
  gain.connect(chimeFilter);
  chimeFilter.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 2.6);
}

export function stopBackgroundMusic() {
  isPlaying = false;
  if (chimeTimer) {
    clearTimeout(chimeTimer);
    chimeTimer = null;
  }

  // Fade out pads quickly
  padGains.forEach(gain => {
    if (audioCtx) {
      try {
        gain.gain.setValueAtTime(gain.gain.value, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      } catch (e) {}
    }
  });

  setTimeout(() => {
    padOscs.forEach(osc => { try { osc.stop(); } catch (e) {} });
    if (audioCtx) {
      try { audioCtx.close(); } catch (e) {}
    }
    audioCtx = null;
  }, 600);
}
