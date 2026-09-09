let audioContext;

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playNavigationSound() {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") {
    void context.resume().then(() => playTone(context));
    return;
  }
  playTone(context);
}

function playTone(context) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(620, start);
  oscillator.frequency.exponentialRampToValueAtTime(420, start + 0.07);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.12, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.085);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.09);
}

export function installNavigationSound() {
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("a, button") : null;
    if (!target || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return;
    playNavigationSound();
    if (target.tagName !== "A" || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || target.target === "_blank" || target.hasAttribute("download")) return;
    const href = target.href;
    if (!href) return;
    event.preventDefault();
    window.setTimeout(() => window.location.assign(href), 120);
  }, { capture: true });
}
