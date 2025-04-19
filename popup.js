let utterance;
let currentText = "";
let currentCharIndex = 0;
const synth = window.speechSynthesis;

const readBtn = document.getElementById("readBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");
const rateSelect = document.getElementById("rateSelect");
const voiceSelect = document.getElementById("voiceSelect");

readBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => window.getSelection().toString(),
    },
    (results) => {
      currentText = results[0].result;
      if (currentText) {
        currentCharIndex = 0;
        speak(currentText);
      } else {
        alert("Please highlight some text first.");
      }
    }
  );
});

pauseBtn.onclick = () => synth.pause();
resumeBtn.onclick = () => synth.resume();
stopBtn.onclick = () => {
  synth.cancel();
  currentText = "";
  currentCharIndex = 0;
};

rateSelect.addEventListener("change", () => {
  if (synth.speaking && currentText) {
    synth.cancel();
    const remainingText = currentText.slice(currentCharIndex);
    speak(remainingText);
  }
});

function speak(text) {
  if (synth.speaking) synth.cancel();

  utterance = new SpeechSynthesisUtterance(text);

  const selectedVoice = voiceSelect.value;
  const selectedRate = parseFloat(rateSelect.value);
  utterance.voice = synth
    .getVoices()
    .find((voice) => voice.name === selectedVoice);
  utterance.rate = selectedRate;

  // Track current character index using onboundary
  utterance.onboundary = (event) => {
    if (event.name === "word") {
      currentCharIndex = event.charIndex;
    }
  };

  synth.speak(utterance);
}

function populateVoices() {
  voiceSelect.innerHTML = "";
  synth.getVoices().forEach((voice) => {
    const option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  });
}

window.speechSynthesis.onvoiceschanged = populateVoices;
