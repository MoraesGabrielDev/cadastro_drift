const telemetryData = {
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

const trackSelect = document.getElementById("track-select");
const lapsBody = document.getElementById("laps-body");
const selectedTrackLabel = document.getElementById("selected-track");
const bestSimLabel = document.getElementById("best-sim");
const bestLapLabel = document.getElementById("best-lap");

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

function populateTracks() {
  Object.keys(telemetryData).forEach((trackName) => {
    const option = document.createElement("option");
    option.value = trackName;
    option.textContent = trackName;
    trackSelect.appendChild(option);
  });
}

function renderTrack(trackName) {
  const simulators = telemetryData[trackName];
  const ordered = Object.entries(simulators)
    .map(([simName, lap]) => ({
      simName,
      lap,
      ms: toMilliseconds(lap),
    }))
    .sort((a, b) => a.ms - b.ms);

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
}

populateTracks();
trackSelect.addEventListener("change", (event) => {
  renderTrack(event.target.value);
});

trackSelect.value = Object.keys(telemetryData)[0];
renderTrack(trackSelect.value);
