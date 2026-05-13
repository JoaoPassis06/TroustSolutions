const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt'); 
const saltRounds = 10;

const app = express();
app.use(express.json());
app.use(cors());



// Configuração da conexão baseada no dbtroustsolutions.sql
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,       
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
};

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/usuarios/autenticar', async (req, res) => {
    const { email, senha } = req.body;


    const emailTratado = email ? email.toLowerCase().trim() : "";

    console.log("Tentativa de login para:", email);

    try {
        const connection = await mysql.createConnection(dbConfig);
    
        const query = `
    SELECT 
        u.idUsuario, 
        u.nome, 
        u.email,
        u.senha, 
        u.fkEmpresa, 
        u.supervisor,       -- NOVO: Para saber se é o Mestre (null)
        u.pode_cadastrar,   -- NOVO: Para saber se tem permissão de cadastro
        e.nomeFantasia as empresa 
    FROM usuario u
    JOIN empresa e ON u.fkEmpresa = e.idEmpresa
    WHERE u.email = ?`;

        const [rows] = await connection.execute(query, [email]);
        await connection.end();

        if (rows.length > 0) {
            const usuario = rows[0];

            const coincide = await bcrypt.compare(senha, usuario.senha);
            
            console.log("As senhas coincidem?", coincide);

            if (coincide) {
                delete usuario.senha;
                res.json(usuario);
            } else {
                res.status(401).json({ mensagem: "E-mail ou senha inválidos" });
            }
        } else {
            res.status(401).json({ mensagem: "E-mail ou senha inválidos" });
        }
    } catch (err) { 
        console.error("Erro no Servidor:", err);
        res.status(500).json({ mensagem: "Erro interno no servidor", detalhes: err.message }); 
    }
});
// --- ROTAS DE CADASTRO (Gravação) ---




app.post('/empresas/cadastrar', async (req, res) => {
    const { 
        nomeFantasia, razaoSocial, cnpj, cell, tellFixo, 
        cep, numero, complemento, rua, bairro, cidade,estado  
    } = req.body;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const queryEmpresa = 'INSERT INTO empresa (nomeFantasia, razaoSocial, cnpj, cell, tellFixo) VALUES (?, ?, ?, ?, ?)';
        const [resultEmpresa] = await connection.execute(queryEmpresa, [nomeFantasia, razaoSocial, cnpj, cell, tellFixo]);
        const idEmpresaGerada = resultEmpresa.insertId;

        const queryLogradouro = `
            INSERT INTO logradouro (cep, numero, complemento, rua, bairro, cidade, estado, fkEmpresa) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; 
        
        await connection.execute(queryLogradouro, [
            cep, numero, complemento, rua, bairro, cidade,estado, idEmpresaGerada
        ]);

        await connection.end();
        res.status(201).json({ insertId: idEmpresaGerada }); 

    } catch (err) { 
        console.error("Erro no cadastro:", err);
        if (connection) await connection.end();
        res.status(500).json(err); 
    }
});

app.post('/usuarios/cadastrar', async (req, res) => {
    const { nome, email, senha, fkEmpresa } = req.body;

    if (!nome || !email || !senha || !fkEmpresa) {
        return res.status(400).send("Preencha todos os campos!");
    }
    try {
    
        const senhaHasheada = await bcrypt.hash(senha, saltRounds);

        const connection = await mysql.createConnection(dbConfig);
        const query = 'INSERT INTO usuario (nome, email, senha, fkEmpresa) VALUES (?, ?, ?, ?)';
        
        await connection.execute(query, [nome, email, senhaHasheada, fkEmpresa]);
        
        await connection.end();
        res.status(201).send("Usuário criado com sucesso e senha protegida!");
    } catch (err) { 
        console.error("Erro no cadastro de usuário:", err);
        res.status(500).json({
            erro: "Falha ao cadastrar usuário",
            detalhes: err.message
        }); 
    }
});
// --- ROTA PARA O HARDWARE (Arduino-LM35.ino) ---
app.post('/medidas/gravar', async (req, res) => {
    const { temperatura, fkSensor } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const query = 'INSERT INTO coletaTemp (temperatura, fkSensor) VALUES (?, ?)';
        await connection.execute(query, [temperatura, fkSensor]);
        await connection.end();
        res.status(201).send("Temperatura gravada");
    } catch (err) { 
        
        console.error("ERRO NO INSERT DE MEDIDAS:", err); 
        res.status(500).json({ erro: err.message }); 
    }
});

app.get('/medidas/tempo-real/:idTanque', async (req, res) => {
    const idTanque = req.params.idTanque;
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const query = `
            SELECT temperatura, DATE_FORMAT(dtHora, '%H:%i:%s') as momento 
            FROM coletaTemp 
            WHERE fkSensor = ? 
            ORDER BY idColeta DESC LIMIT 7`;
        
        const [rows] = await connection.execute(query, [idTanque]);
        await connection.end();
        
        res.json(rows.reverse()); 
    } catch (err) {
        console.error("ERRO AO BUSCAR DADOS:", err);
        res.status(500).json({erro: err.message});
    }
});

app.use(express.static(path.join(__dirname, '..', 'Sites')));


app.post('/usuarios/cadastrar-equipe', async (req, res) => {
    const { nome, email, senha, supervisor, pode_cadastrar, fkEmpresa } = req.body;

    try {

        const nomeUpper = nome.toUpperCase().trim();
        const emailLower = email.toLowerCase().trim();

        const hash = await bcrypt.hash(senha, 10);
        const connection = await mysql.createConnection(dbConfig);
        
        const query = `INSERT INTO usuario (nome, email, senha, supervisor, pode_cadastrar, fkEmpresa) 
        VALUES (?, ?, ?, ?, ?, ?)`;
        
        await connection.execute(query, [nomeUpper, emailLower, hash, supervisor, pode_cadastrar, fkEmpresa]);
        await connection.end();
        
        res.status(201).send("Usuário cadastrado com sucesso!");
    } catch (err) {
        console.error("Erro no cadastro de equipe:", err);
        res.status(500).json({ mensagem: "Erro ao cadastrar membro", detalhes: err.message });
    }
});

app.post('/tanques/cadastrar', async (req, res) => {
console.log("DADOS RECEBIDOS NA API:", req.body);
    const { 
        nome, setor, tempMin, tempMax, 
        qtdTruta, tamanho_m2, litragem, fkEmpresa 
    } = req.body;

    let connection;
    try {

        connection = await mysql.createConnection(dbConfig);

        const query = `
            INSERT INTO tanque (nome, setor, TempMin, TempMax, qtdTruta, tamanho_m², litragem, fkEmpresa) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;


        await connection.execute(query, [
            nome, setor, tempMin, tempMax, 
            qtdTruta, tamanho_m2, litragem, fkEmpresa
        ]);


        await connection.end();
        res.status(201).send("Tanque cadastrado com sucesso!");

    } catch (err) {
        console.error("Erro no cadastro de tanque:", err);
        if (connection) await connection.end();
        
        res.status(500).json({ mensagem: "Erro ao cadastrar tanque", detalhes: err.message });
    }
});



app.get('/medidas/ultimas/:idSensor', async (req, res) => {
    const idSensor = req.params.idSensor;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            `SELECT temperatura, DATE_FORMAT(dtHora,'%H:%i:%s') as momento 
             FROM coletaTemp WHERE fkSensor = ? 
             ORDER BY idColeta DESC LIMIT 7`, 
            [idSensor]
        );
        await connection.end();
        res.status(200).json(rows.reverse()); 
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/medidas/saude-dia/:idTanque', async (req, res) => {
    const idTanque = req.params.idTanque;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const query = `SELECT 
        IFNULL(SUM(CASE WHEN c.temperatura BETWEEN 10 AND 17 THEN 1 ELSE 0 END), 0) AS qtdIdeal,
        IFNULL(SUM(CASE WHEN c.temperatura < 10 OR c.temperatura > 17 THEN 1 ELSE 0 END), 0) AS qtdAlerta
    FROM coletaTemp AS c
    JOIN sensor AS s ON c.fkSensor = s.idSensor
    WHERE s.idSensor = ${idTanque} 
    AND c.dtHora >= DATE_SUB(NOW(), INTERVAL 7 DAY);
`;

        const [rows] = await connection.execute(query, [idTanque]);
        await connection.end();
        res.json(rows[0]); 
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get("/medidas/alertas-recentes/:idSensor", async (req, res) => {
    const idSensor = req.params.idSensor;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const query = `
            SELECT count(idColeta) as totalAlertas 
            FROM coletaTemp 
            WHERE fkSensor = ? 
              AND (temperatura < 10 OR temperatura > 17)
              AND dtHora >= NOW() - INTERVAL 10 HOUR`;

        const [rows] = await connection.execute(query, [idSensor]);
        await connection.end();
        
        res.json(rows); 
    } catch (err) {
        console.error("ERRO ALERTAS 10H:", err);
        res.status(500).json({ erro: err.message });
    }
});

app.get("/medidas/stats-24h/:idSensor", async (req, res) => {
    const idSensor = req.params.idSensor;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const query = `
            SELECT 
                IFNULL(SUM(CASE WHEN temperatura >= 10 AND temperatura <= 17 THEN 1 ELSE 0 END), 0) as ideal,
                IFNULL(SUM(CASE WHEN temperatura > 17 THEN 1 ELSE 0 END), 0) as acima,
                IFNULL(SUM(CASE WHEN temperatura < 10 THEN 1 ELSE 0 END), 0) as abaixo
            FROM coletaTemp 
            WHERE fkSensor = ? AND dtHora >= NOW() - INTERVAL 24 HOUR`;

        const [rows] = await connection.execute(query, [idSensor]);
        await connection.end();
        
        res.json(rows[0]);
    } catch (err) {
        console.error("ERRO STATS 24H:", err);
        res.status(500).json({ erro: err.message });
    }
});

app.get("/medidas/historico-100", async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const query = `
            SELECT 
                c.temperatura,
                s.idSensor,
                t.nome as nomeTanque,
                t.setor,
                DATE_FORMAT(c.dtHora, '%d/%m/%Y %H:%i:%s') as momento,
                CASE 
                    WHEN c.temperatura < 10 OR c.temperatura > 17 THEN 'Alerta'
                    ELSE 'Normal'
                END as status
            FROM coletaTemp c
            JOIN sensor s ON c.fkSensor = s.idSensor
            JOIN tanque t ON s.fkTanque = t.idTanque
            ORDER BY c.idColeta DESC 
            LIMIT 100;
        `;

        const [rows] = await connection.execute(query);
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        res.status(500).json({ erro: err.message });
    }
});

app.listen(3333, () => console.log("Servidor Troust rodando na porta 3333"));