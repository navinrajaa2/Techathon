/**
 * Web Speech API utility for voice narration of lessons and AI mentor responses
 */

let synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let currentUtterance = null;

export function speakText(text, onEnd) {
  if (!synth) {
    console.warn('Speech synthesis not supported in this browser.');
    return false;
  }

  // Cancel any ongoing speech
  synth.cancel();

  // Strip markdown symbols for natural voice narration
  const cleanText = text
    .replace(/[#*_`~>-]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, 'Code block omitted for audio summary.')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.05; // slightly faster natural pace
  utterance.pitch = 1.0;

  // Try to pick a natural English voice if available
  const voices = synth.getVoices();
  const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  currentUtterance = utterance;
  synth.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (synth) {
    synth.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking() {
  return synth ? synth.speaking : false;
}
