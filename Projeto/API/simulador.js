
function gerarTemperatura(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

async function enviarDadosSimulados() {
   
    const tempSorteada = gerarTemperatura(8, 20);
    
    const corpoRequisicao = {
        temperatura: parseFloat(tempSorteada),
        fkSensor: 1 
    };

    console.log(`[Simulador] Enviando temperatura: ${tempSorteada}°C`);

    try {
        const resposta = await fetch("http://localhost:3333/medidas/gravar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpoRequisicao)
        });

        if (resposta.ok) {
            console.log("-> Gravado no banco com sucesso!");
        } else {
            console.error("-> Erro na API:", resposta.statusText);
        }
    } catch (erro) {
        console.error("-> Erro ao conectar na API. Ela está rodando (node app.js)?", erro.message);
    }
}

// Inicia a simulação: envia um dado a cada 5 segundos
console.log("Iniciando simulador de sensor...");
setInterval(enviarDadosSimulados, 5000);