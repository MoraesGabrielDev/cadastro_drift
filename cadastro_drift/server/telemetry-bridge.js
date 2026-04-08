const http = require("http");

const PORT = 3000;

const SIMULATORS = ["Simulador A", "Simulador B", "Simulador C"];

const fastestLapsByTrack = {
  Interlagos: {
    "Simulador A": "1:09.222",
    "Simulador B": "1:09.330",
    "Simulador C": "1:09.401",
  },
};

function isValidLapTime(value) {
  return typeof value === "string" && /^\d:\d{2}\.\d{3}$/.test(value);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("JSON inválido"));
      }
    });
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function upsertFastestLap({ track, simulator, lapTime }) {
  if (!fastestLapsByTrack[track]) {
    fastestLapsByTrack[track] = {
      "Simulador A": "9:59.999",
      "Simulador B": "9:59.999",
      "Simulador C": "9:59.999",
    };
  }

  const currentBest = fastestLapsByTrack[track][simulator];
  if (!currentBest || toMs(lapTime) < toMs(currentBest)) {
    fastestLapsByTrack[track][simulator] = lapTime;
  }
}

function toMs(lapTime) {
  const [min, secMs] = lapTime.split(":");
  const [sec, ms] = secMs.split(".");
  return Number(min) * 60000 + Number(sec) * 1000 + Number(ms);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  if (req.method === "GET" && req.url === "/api/f1/telemetria") {
    return sendJson(res, 200, fastestLapsByTrack);
  }

  if (req.method === "POST" && req.url === "/api/f1/lap") {
    try {
      const payload = await parseBody(req);
      const { track, simulator, lapTime } = payload;

      if (!track || typeof track !== "string") {
        return sendJson(res, 400, { error: "Campo 'track' é obrigatório" });
      }

      if (!SIMULATORS.includes(simulator)) {
        return sendJson(res, 400, {
          error: "Campo 'simulator' deve ser Simulador A, Simulador B ou Simulador C",
        });
      }

      if (!isValidLapTime(lapTime)) {
        return sendJson(res, 400, { error: "Campo 'lapTime' inválido. Use M:SS.mmm" });
      }

      upsertFastestLap({ track, simulator, lapTime });
      return sendJson(res, 200, { ok: true, fastestLapsByTrack });
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }
  }

  return sendJson(res, 404, { error: "Rota não encontrada" });
});

server.listen(PORT, () => {
  console.log(`Telemetry bridge em http://localhost:${PORT}/api/f1/telemetria`);
  console.log("Envie voltas em POST http://localhost:3000/api/f1/lap");
});
