const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const port = new SerialPort({ path: 'COM3', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', (temp) => {
    console.log(`Temperatura recebida do Arduino: ${temp}°C`);

    const dados = JSON.stringify({
        temperatura: parseFloat(temp),
        fkSensor: 1 
    });

    fetch("http://localhost:3333/medidas/gravar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: dados
    })
    .then(res => console.log("Status da gravação:", res.statusText))
    .catch(err => console.error("Erro ao enviar para API:", err));
});