const guitarStrings = [
  { note: 'E2', frequency: 82.41 },
  { note: 'A2', frequency: 110.00 },
  { note: 'D3', frequency: 146.83 },
  { note: 'G3', frequency: 196.00 },
  { note: 'B3', frequency: 246.94 },
  { note: 'E4', frequency: 329.63 }
];

const tolerance = 1.5; // Hz tolerance for in-tune

const startBtn = document.getElementById('start-btn');
const noteDisplay = document.querySelector('.note');

let audioContext;
let analyser;
let microphone;
let dataArray;
let rafId;
let currentStringIndex = 0;

function getFrequencyDifference(freq1, freq2) {
  return freq1 - freq2;
}

function autoCorrelate(buffer, sampleRate) {
  let SIZE = buffer.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    let val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1, threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < threshold) {
      r2 = SIZE - i;
      break;
    }
  }

  buffer = buffer.slice(r1, r2);
  SIZE = buffer.length;

  let c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] = c[i] + buffer[j] * buffer[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxPos = d;
  let maxVal = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }

  let T0 = maxPos;

  let x1 = c[T0 - 1];
  let x2 = c[T0];
  let x3 = c[T0 + 1];
  let a = (x1 + x3 - 2 * x2) / 2;
  let b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

function detectPitch() {
  analyser.getFloatTimeDomainData(dataArray);
  const pitch = autoCorrelate(dataArray, audioContext.sampleRate);
  if (pitch !== -1) {
    const target = guitarStrings[currentStringIndex];
    const diff = getFrequencyDifference(pitch, target.frequency);
    let status = '';
    if (Math.abs(diff) <= tolerance) {
      status = 'In Tune';
    } else if (diff < 0) {
      status = 'Too Low';
    } else {
      status = 'Too High';
    }
    noteDisplay.textContent = `Tuning ${target.note}: ${pitch.toFixed(2)} Hz - ${status}`;
  } else {
    noteDisplay.textContent = 'Note: --';
  }
  rafId = requestAnimationFrame(detectPitch);
}

startBtn.addEventListener('click', () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (microphone) {
    microphone.disconnect();
    analyser.disconnect();
    cancelAnimationFrame(rafId);
    microphone = null;
    analyser = null;
    noteDisplay.textContent = 'Note: --';
    startBtn.textContent = 'Start Tuning';
    currentStringIndex = 0;
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      microphone = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      microphone.connect(analyser);
      dataArray = new Float32Array(analyser.fftSize);
      detectPitch();
      startBtn.textContent = 'Stop Tuning';
    })
    .catch(err => {
      alert('Microphone access denied or not available.');
      console.error(err);
    });
});
