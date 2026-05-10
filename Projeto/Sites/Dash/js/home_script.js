let chartTempoReal, chartDistribuicao, chartMensal;
let intervaloDados;

// --- 1. INICIALIZAÇÃO ---
function iniciarDash() {
    validarSessao();
    verificarPermissaoBotao();
    inicializarGraficos(); 
    
    const tanquePadrao = sessionStorage.TANQUE_ATUAL || "1";
    const seletor = document.getElementById("select_tanque");
    
    if (seletor) {
        seletor.value = tanquePadrao;
    }

    exibirDadosDoTanque(tanquePadrao);

    buscarSaudeDoDia(tanquePadrao);
    iniciarAtualizacaoAutomatica();
}
// --- 2. CONFIGURAÇÃO DOS GRÁFICOS (INSTÂNCIA ÚNICA) ---
function inicializarGraficos() {
    // 1. LINHA (TEMPO REAL)
const ctxLinha = document.getElementById('grafico_tempo_real');
    if (ctxLinha && !chartTempoReal) {
        chartTempoReal = new Chart(ctxLinha, {
            type: 'line',
            data: {
                labels: ['7', '6', '5', '4', '3', '2', '1'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0, 0], // Começa zerado
                    borderColor: '#9d33ff',
                    backgroundColor: 'rgba(157, 51, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                
                animation: {
                    duration: 4900,
                    easing: 'linear'
                },
                scales: {
                    y: { 
                        min: 8, 
                        max: 20,
                        grid: { color: '#444' } 
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { display: true }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    const ctxMensal = document.getElementById('grafico_mensal');
    if (ctxMensal && !chartMensal) {
        chartMensal = new Chart(ctxMensal, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
                datasets: [{
                    label: 'Média Mensal',
                    data: [0, 0, 0, 0, 0], // Começa em zero para a animação subir
                    backgroundColor: '#9d33ff',
                    borderRadius: 5
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                animation: { 
                    duration: 2000, 
                    easing: 'easeOutBounce' 
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#444' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // 2. ROSCA (SAÚDE DO TANQUE)
    const ctxRosca = document.getElementById('grafico_distribuicao');
    if (ctxRosca && !chartDistribuicao) {
        chartDistribuicao = new Chart(ctxRosca, {
            type: 'doughnut',
            data: {
                labels: ['Ideal', 'Alerta'],
                datasets: [{
                    data: [100, 0], 
                    backgroundColor: ['#00FF7F', '#ff4b4b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { 
                    duration: 2000, 
                    easing: 'easeOutQuart' 
                },
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#888' } },
                    title: { display: true, text: 'SAÚDE DO TANQUE (%)', color: '#888' }
                },
                cutout: '75%'
            }
        });
    }
}
// --- 3. FUNÇÕES DE ATUALIZAÇÃO (FLUIDEZ) ---

function atualizarGraficoLinha(novoLabel, novoDado) {
    if (chartTempoReal) {
        // 1. Movemos os dados existentes para a esquerda manualmente
        for (let i = 0; i < chartTempoReal.data.datasets[0].data.length - 1; i++) {
            chartTempoReal.data.datasets[0].data[i] = chartTempoReal.data.datasets[0].data[i + 1];
        }
        
        // 2. Colocamos o novo dado na última posição
        chartTempoReal.data.datasets[0].data[chartTempoReal.data.datasets[0].data.length - 1] = novoDado;

        // 3. Atualizamos sem o 'none' para ele "correr" a linha
        chartTempoReal.update(); 
    }
}

function atualizarGraficoRosca(qtdIdeal, qtdAlerta) {
    console.log("Tentando atualizar rosca com:", qtdIdeal, qtdAlerta);
    
    if (chartDistribuicao) {
        
        chartDistribuicao.data.datasets[0].data = [qtdIdeal, qtdAlerta];
        chartDistribuicao.update();
        console.log("Gráfico de rosca atualizado com sucesso!");
    } else {
        console.error("ERRO: A variável 'chartDistribuicao' está vazia. O gráfico não foi inicializado corretamente.");
    }
}

// --- 4. BUSCA DE DADOS ---

function exibirDadosDoTanque(idTanque) {
    fetch(`http://localhost:3333/medidas/tempo-real/${idTanque}`, { cache: 'no-store' })
        .then(resposta => {
            if (resposta.ok) {
                resposta.json().then(novoRegistro => {
                    if (novoRegistro.length > 0) {
                        // 1. Processamento de dados
                        const temperaturas = novoRegistro.map(v => Number(v.temperatura));
                        const ultimaLeitura = novoRegistro[novoRegistro.length - 1];
                        const ultimaTemp = Number(ultimaLeitura.temperatura);

                        // 2. Atualização das KPIs (Dados instantâneos)
                        document.getElementById("kpi_min").innerHTML = `${Math.min(...temperaturas).toFixed(1)}ºC`;
                        document.getElementById("kpi_max").innerHTML = `${Math.max(...temperaturas).toFixed(1)}ºC`;
                        document.getElementById("kpi_media").innerHTML = `${ultimaTemp.toFixed(1)}ºC`;

                        const elementoStatus = document.getElementById("kpi_status");
                        const isIdeal = ultimaTemp >= 10 && ultimaTemp <= 17;
                        
                        elementoStatus.innerHTML = isIdeal ? "NORMAL" : "ALERTA";
                        elementoStatus.style.color = isIdeal ? "#00FF7F" : "#ff4b4b";

                        // 3. Atualização do Gráfico de Linha (Apenas o ponto mais recente)
                        atualizarGraficoLinha(ultimaLeitura.momento, ultimaTemp);
                    }
                });
            }
        })
        .catch(erro => console.error(`Erro ao obter dados: ${erro.message}`));
}

function buscarSaudeDoDia(idTanque) {
    // Verifique se a URL no fetch está correta conforme o seu backend
    fetch(`http://localhost:3333/medidas/saude-dia/${idTanque}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(registro => {
            // Como vimos na imagem, o dado vem como: {"qtdIdeal":"262", "qtdAlerta":"189"}
            // O Number() é OBRIGATÓRIO aqui porque os valores estão vindo com aspas
            const ideal = Number(registro.qtdIdeal);
            const alerta = Number(registro.qtdAlerta);

            console.log("Dados convertidos:", ideal, alerta);
            
            // Chama a função que você testou no console e funcionou
            atualizarGraficoRosca(ideal, alerta);
        })
        .catch(err => console.error("Erro ao buscar saúde:", err));
}
function iniciarAtualizacaoAutomatica() {
    clearInterval(intervaloDados); 
    intervaloDados = setInterval(() => {
        const id = document.getElementById("select_tanque").value;
        
        exibirDadosDoTanque(id); // Atualiza a linha e KPIs (Tempo Real)
        buscarSaudeDoDia(id);    // Atualiza a rosca (Acumulado do Dia)
        
    }, 5000);
}
function mudarTanque() {
    const id = document.getElementById('select_tanque').value;
    sessionStorage.TANQUE_ATUAL = id;
  
    if (chartTempoReal) {
        chartTempoReal.data.labels = [];
        chartTempoReal.data.datasets[0].data = [];
        chartTempoReal.update('none');
    }
    exibirDadosDoTanque(id);
}



// --- FUNÇÕES DE APOIO ---
function validarSessao() {
    const nomeUsuario = sessionStorage.NOME_USUARIO;
    
    if (!nomeUsuario) {
        window.location.href = "../login.html";
    } else {
   
        const nomeFormatado = nomeUsuario.toLowerCase().split(' ').map(palavra => {
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        }).join(' ');

        if (document.getElementById("nome_usuario")) {
           
            document.getElementById("nome_usuario").innerText = nomeFormatado;
        }

        if (document.getElementById("nome_empresa")) {

            document.getElementById("nome_empresa").innerText = sessionStorage.NOME_EMPRESA;
        }
    }
}

function verificarPermissaoBotao() {
    const podeCadastrar = sessionStorage.PODE_CADASTRAR;
    const supervisorId = sessionStorage.SUPERVISOR_ID;
    

    const container = document.getElementById("container_cadastrar_equipe");
    const btn = document.getElementById("btn_cadastrar_equipe");
    
    if (container) {
        if (supervisorId === "null" || podeCadastrar === "1") {
            container.style.display = "flex";
            btn.style.display="block";

        } else {
            btn.style.display = "none";
            container.style.display = "none";
        }
    }
}
