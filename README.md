![Header](./github-header-banner.png)

<p align="center">
  <img src="https://img.shields.io/badge/-Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white" alt="Arduino">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript">
  <img src="https://img.shields.io/badge/mysql-%234479A1.svg?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white" alt="Git">
</p>

---

## 📝 Descrição do Projeto
O **TroustSolutions** é um ecossistema completo de monitoramento térmico para tanques de piscicultura (trutas). O sistema resolve um desafio crítico na criação de peixes: a manutenção da temperatura entre **10°C e 17°C**, enviando alertas em tempo real e automatizando a coleta de dados para garantir a saúde da produção.

## 🚀 Novas Funcionalidades e Melhorias
- 🔒 **Segurança:** Implementação de variáveis de ambiente (`.env`) para proteção de credenciais.
- 📉 **Dashboard Inteligente:** Gráficos de linha (Chart.js) com atualização em tempo real e reset automático de memória ao trocar de tanque.
- ⚡ **Automação de Banco de Dados:** - `Triggers` para validação de status de sensores.
    - `Stored Procedures` para geração de relatórios de saúde e devedores.
    - `Events` para limpeza automática de dados temporários.
- 📱 **Interface Responsiva:** KPIs de Mínima, Máxima e Média com indicadores visuais de **ALERTA/NORMAL**.

## 🛠️ Stack Técnica
- **Hardware:** 📟 Arduino + Sensor DS18B20.
- **Backend:** 🟢 Node.js / Express (API REST).
- **Banco de Dados:** 🔵 MySQL (Relacional).
- **Frontend:** 🎨 HTML5, CSS3 e JavaScript Moderno.

## 📁 Estrutura do Repositório
```text
├── Projeto/
│   ├── API/            # Backend Node.js e Segurança
│   ├── BD/             # Scripts SQL (Procedures, Triggers, Events)
│   ├── Arduino/        # Firmware do Sensor
│   └── Sites/          # Frontend e Dashboards
└── index.html          # Redirecionador para GitHub Pages
```
### Visualização Inicial: https://joaopassis06.github.io/TroustSolutions/Projeto/Sites/index.html
