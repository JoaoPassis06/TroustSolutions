// --- CONTROLE DE ACESSO E EXIBIÇÃO ---
function switchTab(tab, btn) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".tab-panel")
    .forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("panel-" + tab).classList.add("active");
  if (tab === "pagamento") carregarPagamentos();
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("active");
}

/* ── Verificação de Acesso e Interface ── */
function verificarAcesso() {
  const supervisor = sessionStorage.SUPERVISOR_ID;
  const isMestre =
    supervisor === "null" || supervisor === "" || supervisor === null;
  const podeCadastrar = sessionStorage.PODE_CADASTRAR === "1";

  // Regra do Botão de Pagamento: Apenas para Supervisor Master (null)
  const btnPagamento = document.getElementById("btn-tab-pagamento");
  if (btnPagamento) {
    btnPagamento.style.display = isMestre ? "flex" : "none";
  }

  if (!isMestre && !podeCadastrar) {
    alert("Acesso negado! Área restrita a supervisores.");
    window.location.href = "dashboard.html";
  }
}

/* ── Cadastrar Colaborador ── */
function cadastrarMembro() {
  const nomeVar = ipt_nome.value.toUpperCase().trim();
  const emailVar = ipt_email.value.toLowerCase().trim();
  const senhaVar = ipt_senha.value;
  const podeCadastrarVar = sel_permissao.value;

  const idSupervisor = sessionStorage.ID_USUARIO;
  const idEmpresa = sessionStorage.FK_EMPRESA;

  if (!nomeVar || !emailVar || !senhaVar) {
    alert("Preencha todos os campos do colaborador!");
    return;
  }

  if (emailVar.indexOf("@") == -1 || emailVar.indexOf(".") == -1) {
    alert("Por favor, insira um e-mail válido.");
    return;
  }

  fetch("http://localhost:3333/usuarios/cadastrar-equipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: nomeVar,
      email: emailVar,
      senha: senhaVar,
      supervisor: idSupervisor,
      pode_cadastrar: podeCadastrarVar,
      fkEmpresa: idEmpresa,
    }),
  })
    .then((res) => {
      if (res.ok) {
        alert("Colaborador cadastrado com sucesso!");

        ipt_nome.value = "";
        ipt_email.value = "";
        ipt_senha.value = "";
      } else {
        res.text().then((textoErro) => {
          console.error("Erro do servidor:", textoErro);
          alert(
            "Erro ao realizar o cadastro. Verifique os dados ou se o e-mail já existe.",
          );
        });
      }
    })
    .catch((err) => {
      console.error("Erro de conexão (Fetch):", err);
      alert("Não foi possível conectar ao servidor.");
    });
}

/* ── Cadastrar Tanque ── */
function cadastrarTanque() {
  const nome = ipt_tank_nome.value.trim().toUpperCase();

  const setor = ipt_tank_setor.value.trim().toUpperCase();

  const tempMin = ipt_tank_tempmin.value;

  const tempMax = ipt_tank_tempmax.value;

  const qtdTruta = ipt_tank_truta.value;

  const tamanho = ipt_tank_tamanho.value;

  const litragem = ipt_tank_litragem.value;

  const idEmpresaLogada = sessionStorage.FK_EMPRESA;

  if (!idEmpresaLogada) {
    alert("Erro: Empresa não identificada. Faça login novamente.");
    return;
  }

  if (
    !nome ||
    !setor ||
    !tempMin ||
    !tempMax ||
    !qtdTruta ||
    !tamanho ||
    !litragem
  ) {
    alert("Preencha todos os campos do tanque!");
    return;
  }

  fetch("http://localhost:3333/tanques/cadastrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      setor,
      tempMin: parseFloat(tempMin),
      tempMax: parseFloat(tempMax),
      qtdTruta: parseInt(qtdTruta),
      tamanho_m2: parseFloat(tamanho),
      litragem: parseFloat(litragem),
      fkEmpresa: idEmpresaLogada,
    }),
  })
    .then((res) => {
      if (res.ok) {
        alert("Tanque cadastrado com sucesso!");
        window.location.reload();
      } else {
        alert("Erro ao cadastrar o tanque.");
      }
    })
    .catch((err) => console.error("Erro no fetch:", err));
}

/* ── Pagamentos ── */
function carregarPagamentos() {
  const tbody = document.getElementById("tbody-pagamentos");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">Carregando...</td></tr>`;

  fetch("/pagamentos/historico?fkEmpresa=" + sessionStorage.FK_EMPRESA)
    .then((res) => res.json())
    .then((data) => renderizarPagamentos(data))
    .catch(() => {
      renderizarPagamentos([
        {
          idPagamento: 1,
          dtPag: "2026-01-09",
          dtVenci: "2026-01-14",
          statusPag: "Pago",
          parcela: "1/12",
          fkPlano: "Premium",
        },
        {
          idPagamento: 2,
          dtPag: "2026-02-09",
          dtVenci: "2026-02-14",
          statusPag: "Pago",
          parcela: "2/12",
          fkPlano: "Premium",
        },
        {
          idPagamento: 3,
          dtPag: null,
          dtVenci: "2026-03-14",
          statusPag: "Pendente",
          parcela: "3/12",
          fkPlano: "Premium",
        },
      ]);
    });
}

function renderizarPagamentos(data) {
  const tbody = document.getElementById("tbody-pagamentos");
  let pago = 0,
    pendente = 0,
    vencido = 0;

  tbody.innerHTML = data
    .map((p) => {
      const status = (p.statusPag || "").toLowerCase();
      if (status.includes("pago")) pago++;
      else if (status.includes("vencido")) vencido++;
      else pendente++;

      const badgeClass = status.includes("pago")
        ? "badge--green"
        : status.includes("vencido")
          ? "badge--red"
          : "badge--yellow";
      const dtPag = p.dtPag
        ? new Date(p.dtPag).toLocaleDateString("pt-BR")
        : "—";
      const dtVenc = p.dtVenci
        ? new Date(p.dtVenci).toLocaleDateString("pt-BR")
        : "—";

      return `
            <tr>
                <td class="td-id">#${p.idPagamento}</td>
                <td>${dtPag}</td>
                <td>${dtVenc}</td>
                <td><span class="parcela-chip">${p.parcela || "—"}</span></td>
                <td>${p.fkPlano || "—"}</td>
                <td><span class="status-badge ${badgeClass}">${p.statusPag}</span></td>
            </tr>`;
    })
    .join("");

  document.getElementById("count-pago").textContent = pago;
  document.getElementById("count-pendente").textContent = pendente;
  document.getElementById("count-vencido").textContent = vencido;
}

// Inicialização
window.onload = () => {
  verificarAcesso();
};

function toggleSenha() {
  const iptSenha = document.getElementById("ipt_senha");
  const svgOlho = document.getElementById("svg_olho");

  if (iptSenha.type === "password") {
    iptSenha.type = "text";
    svgOlho.style.color = "#9d33ff";
  } else {
    iptSenha.type = "password";
    svgOlho.style.color = "#888";
  }
}
function deslogar() {
  console.log("Iniciando processo de logout seguro...");

  sessionStorage.clear();

  console.log("Sessão após clear:", sessionStorage.getItem("ID_USUARIO"));

  window.location.replace("index.html");
}
