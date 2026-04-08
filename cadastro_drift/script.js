const STORAGE_KEY = "f1-2025-telemetry";

const defaultData = {
  "Bahrain International Circuit": {
    "Simulador A": "1:30.742",
    "Simulador B": "1:30.911",
    "Simulador C": "1:31.224",
  },
  Jeddah: {
    "Simulador A": "1:28.997",
    "Simulador B": "1:29.112",
    "Simulador C": "1:29.331",
  },
  "Albert Park": {
    "Simulador A": "1:18.430",
    "Simulador B": "1:18.506",
    "Simulador C": "1:18.649",
  },
  Interlagos: {
    "Simulador A": "1:09.521",
    "Simulador B": "1:09.333",
    "Simulador C": "1:09.614",
  },
  "Las Vegas": {
    "Simulador A": "1:34.785",
    "Simulador B": "1:34.728",
    "Simulador C": "1:35.041",
  },
};

let telemetryData = loadTelemetryData();

const trackSelect = document.getElementById("track-select");
const lapsBody = document.getElementById("laps-body");
const recordsBody = document.getElementById("records-body");
const lapForm = document.getElementById("lap-form");
const selectedTrackLabel = document.getElementById("selected-track");
const bestSimLabel = document.getElementById("best-sim");
const bestLapLabel = document.getElementById("best-lap");
const statusMessage = document.getElementById("status-message");

const simAInput = document.getElementById("sim-a");
const simBInput = document.getElementById("sim-b");
const simCInput = document.getElementById("sim-c");

function loadTelemetryData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return structuredClone(defaultData);
  }

  try {
    const parsed = JSON.parse(saved);
    return parsed;
  } catch {
    return structuredClone(defaultData);
  }
}

function saveTelemetryData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(telemetryData));
}

function toMilliseconds(lapTime) {
  const [minutes, secondsWithMs] = lapTime.split(":");
  const [seconds, milliseconds] = secondsWithMs.split(".");

  return Number(minutes) * 60000 + Number(seconds) * 1000 + Number(milliseconds);
}

function formatDelta(deltaMs) {
  if (deltaMs === 0) {
    return "Líder";
  }

  const seconds = (deltaMs / 1000).toFixed(3);
  return `+${seconds}s`;
}

function isValidLapTime(value) {
  return /^\d:\d{2}\.\d{3}$/.test(value.trim());
}

function populateTracks() {
  const selected = trackSelect.value;
  trackSelect.innerHTML = "";

  Object.keys(telemetryData).forEach((trackName) => {
    const option = document.createElement("option");
    option.value = trackName;
    option.textContent = trackName;
    trackSelect.appendChild(option);
  });

  trackSelect.value = telemetryData[selected] ? selected : Object.keys(telemetryData)[0];
}

function getTrackRanking(trackName) {
  const simulators = telemetryData[trackName];
  return Object.entries(simulators)
    .map(([simName, lap]) => ({
      simName,
      lap,
      ms: toMilliseconds(lap),
    }))
    .sort((a, b) => a.ms - b.ms);
}

function fillForm(trackName) {
  const simulators = telemetryData[trackName];
  simAInput.value = simulators["Simulador A"];
  simBInput.value = simulators["Simulador B"];
  simCInput.value = simulators["Simulador C"];
}

function renderTrack(trackName) {
  const ordered = getTrackRanking(trackName);
  const best = ordered[0];

  lapsBody.innerHTML = "";

  ordered.forEach((simData, index) => {
    const row = document.createElement("tr");
    if (index === 0) {
      row.classList.add("highlight");
    }

    row.innerHTML = `
      <td>${simData.simName}</td>
      <td>${simData.lap}</td>
      <td class="delta">${formatDelta(simData.ms - best.ms)}</td>
    `;

    lapsBody.appendChild(row);
  });

  selectedTrackLabel.textContent = trackName;
  bestSimLabel.textContent = best.simName;
  bestLapLabel.textContent = best.lap;
  fillForm(trackName);
}

function renderTrackRecords() {
  recordsBody.innerHTML = "";

  Object.keys(telemetryData)
    .map((trackName) => {
      const fastest = getTrackRanking(trackName)[0];
      return {
        trackName,
        simName: fastest.simName,
        lap: fastest.lap,
        ms: fastest.ms,
      };
    })
    .sort((a, b) => a.ms - b.ms)
    .forEach((record) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${record.trackName}</td>
        <td>${record.simName}</td>
        <td>${record.lap}</td>
      `;
      recordsBody.appendChild(row);
    });
}

trackSelect.addEventListener("change", (event) => {
  renderTrack(event.target.value);
  statusMessage.textContent = "";
});

lapForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const simA = simAInput.value.trim();
  const simB = simBInput.value.trim();
  const simC = simCInput.value.trim();

  if (![simA, simB, simC].every(isValidLapTime)) {
    statusMessage.textContent =
      "Formato inválido. Use MM:SS.mmm (ex: 1:29.520) para os 3 simuladores.";
    return;
  }

  telemetryData[trackSelect.value] = {
    "Simulador A": simA,
    "Simulador B": simB,
    "Simulador C": simC,
  };

  saveTelemetryData();
  renderTrack(trackSelect.value);
  renderTrackRecords();
  statusMessage.textContent = "Tempos atualizados com sucesso para a pista selecionada.";
});

populateTracks();
renderTrack(trackSelect.value);
renderTrackRecords();
