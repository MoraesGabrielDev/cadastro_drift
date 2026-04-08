# Telemetria F1 2025 — Como expor um endpoint real

A interface espera um endpoint HTTP que retorne JSON com este formato:

```json
{
  "Interlagos": {
    "Simulador A": "1:09.222",
    "Simulador B": "1:09.330",
    "Simulador C": "1:09.401"
  },
  "Jeddah": {
    "Simulador A": "1:28.997",
    "Simulador B": "1:29.112",
    "Simulador C": "1:29.331"
  }
}
```

## Opção 1: Node.js + Express (recomendado)

### 1) Instale dependências

```bash
npm init -y
npm install express cors
```

### 2) Crie `server.js`

```js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/f1/telemetria", (_req, res) => {
  res.json({
    Interlagos: {
      "Simulador A": "1:09.222",
      "Simulador B": "1:09.330",
      "Simulador C": "1:09.401",
    },
    Jeddah: {
      "Simulador A": "1:28.997",
      "Simulador B": "1:29.112",
      "Simulador C": "1:29.331",
    },
    "Las Vegas": {
      "Simulador A": "1:34.610",
      "Simulador B": "1:34.728",
      "Simulador C": "1:35.041",
    },
  });
});

app.listen(PORT, () => {
  console.log(`API online em http://localhost:${PORT}/api/f1/telemetria`);
});
```

### 3) Rode a API

```bash
node server.js
```

### 4) Teste no navegador

Abra:

`http://localhost:3000/api/f1/telemetria`

Se aparecer JSON, cole essa URL no campo de integração da interface e clique em **Sincronizar dados reais**.

---

## Opção 2: Python + Flask

### 1) Instale dependências

```bash
pip install flask flask-cors
```

### 2) Crie `app.py`

```python
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.get("/api/f1/telemetria")
def telemetria():
    return jsonify({
        "Interlagos": {
            "Simulador A": "1:09.222",
            "Simulador B": "1:09.330",
            "Simulador C": "1:09.401"
        },
        "Jeddah": {
            "Simulador A": "1:28.997",
            "Simulador B": "1:29.112",
            "Simulador C": "1:29.331"
        }
    })

if __name__ == "__main__":
    app.run(port=3000)
```

### 3) Rode

```bash
python app.py
```

---

## Dicas importantes

- Formato de tempo aceito: `M:SS.mmm` (ex.: `1:29.520`).
- A UI exige as chaves: `Simulador A`, `Simulador B`, `Simulador C`.
- Se der erro de integração, normalmente é CORS bloqueando requisição do frontend.
- Em produção, publique essa API em um host (Render, Railway, Fly.io, AWS, etc.) e use a URL pública na interface.

## Como pegar infos do jogo e jogar para a interface

Fluxo recomendado:

1. **Jogo/telemetria** envia dados de volta (tempo, pista e simulador) para um serviço local.
2. Esse serviço salva o **melhor tempo por pista/simulador**.
3. A tela consome o endpoint `GET /api/f1/telemetria` e atualiza o ranking.

### Bridge pronto no repositório

Use o arquivo `server/telemetry-bridge.js`:

```bash
node server/telemetry-bridge.js
```

Ele expõe:

- `GET /api/f1/telemetria` → formato que a interface já entende.
- `POST /api/f1/lap` → para receber uma volta do jogo.

Exemplo para enviar uma volta:

```bash
curl -X POST http://localhost:3000/api/f1/lap \
  -H "Content-Type: application/json" \
  -d '{
    "track": "Interlagos",
    "simulator": "Simulador A",
    "lapTime": "1:09.180"
  }'
```

Depois, no front-end, use a URL:

`http://localhost:3000/api/f1/telemetria`

### Como conectar com telemetria real do jogo

Você precisa de um coletor que leia a telemetria do jogo (UDP/SDK/plugin) e faça POST no bridge.

Pseudo fluxo:

```text
receber pacote do jogo
  -> extrair pista, simulador, tempo da volta
  -> converter para M:SS.mmm
  -> POST /api/f1/lap
```

Dica prática: se você já usa um software intermediário (ex.: plugin de telemetria), configure esse software para chamar seu endpoint HTTP a cada volta concluída.
