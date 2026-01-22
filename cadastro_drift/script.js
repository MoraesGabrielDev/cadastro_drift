const form = document.getElementById("cadastro-form");
const statusMessage = document.getElementById("status-message");

const nomeInput = document.getElementById("nome");
const carroInput = document.getElementById("horario");

const scriptURL =
  "https://script.google.com/macros/s/AKfycbwlSHrIN6PSvIaF3RRMXnxs9qtssO-klef__Tr8Q9CMTjTgJnsqgGwy9Hub6frwJl4n/exec";

// Mantém os espaços como o usuário digita e capitaliza a primeira letra de cada palavra
function titleCaseKeepSpaces(value) {
  if (!value) return value;

  const lower = value.toLowerCase();

  // Capitaliza a primeira letra do texto e a primeira letra após qualquer espaço
  // Preserva espaços múltiplos e espaços no final
  return lower.replace(/(^|\s)([a-zà-ÿ])/g, (match, p1, p2) => p1 + p2.toUpperCase());
}

// Aplica titleCase sem “comer” espaços durante a digitação
function applyTitleCaseLive(inputEl) {
  if (!inputEl) return;

  inputEl.addEventListener("input", (e) => {
    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    const before = el.value;
    const after = titleCaseKeepSpaces(before);

    // Só atualiza se mudou (evita mexer no cursor sem necessidade)
    if (after !== before) {
      el.value = after;
      try {
        el.setSelectionRange(start, end);
      } catch (_) {}
    }
  });
}

applyTitleCaseLive(nomeInput);
applyTitleCaseLive(carroInput);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  statusMessage.textContent = "Enviando cadastro...";

  // Garantia final antes de enviar (mantendo espaços internos)
  if (nomeInput) nomeInput.value = titleCaseKeepSpaces(nomeInput.value);
  if (carroInput) carroInput.value = titleCaseKeepSpaces(carroInput.value);

  const formData = new FormData(form);

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      body: formData,
      mode: "no-cors",
    });

    // no-cors retorna resposta "opaque", então não dá para ler status real
    if (response.type !== "opaque" && !response.ok) {
      throw new Error("Falha ao enviar os dados.");
    }

    form.reset();
    statusMessage.textContent =
      "Cadastro enviado com sucesso! Verifique sua planilha.";
  } catch (error) {
    statusMessage.textContent =
      "Não foi possível enviar. Revise o link do Google Apps Script.";
  }
});
