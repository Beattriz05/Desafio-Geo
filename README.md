# 🧪 Desafio-Geo: Sistema de Reporte de Defeitos Laboratoriais
Desenvolvido para permitir o registro rápido e eficiente de defeitos em equipamentos de laboratório, com ênfase na coleta precisa de dados de Localização através de um aplicativo móvel. Os dados são gerenciados por um servidor Node.js e persistidos no MongoDB Atlas.

📌 Funcionalidades Principais

- Cadastro Completo: Registro de Título, Descrição, Local e Laboratório do equipamento defeituoso, facilitando a geolocalização do problema.

- Anexo de Foto: Capacidade de anexar uma imagem do equipamento.

- Status Tracking: Defeitos são registrados com status inicial pendente.

- API RESTful: Rotas para criação, listagem e busca de registros.

- Marcação Temporal: Registro automático da data e hora da ocorrência.

🤖 Tecnologias Utilizadas

- Mobile: React Native

- Backend: Node.js com Express

- Banco de Dados: MongoDB Atlas

- Mapeamento: Mongoose

⚙️ Pré-requisitos

Passo 1: Instalação de Dependências no Backend

```
npm install
```

Passo 2: Instalação de Dependências no Mobile

```
npm install
npx expo install expo-image-picker expo-network
```

Passo 3: Inicialização do Backend

```
# Para desenvolvimento com reinicialização automática:
npm run dev

# OU, para inicialização simples:
node server.js
```

Passo 4: Configuração do IP 

O aplicativo mobile precisa saber o IP da sua máquina onde o backend está rodando para se conectar.

1.Descubra seu IP local (IPv4):

Windows: ipconfig

Mac/Linux: ifconfig ou ip addr

2.Abra o arquivo mobile/App.js e substitua a variável IP_DO_PC pelo IP que você encontrou:

```
// Arquivo: mobile/App.js

// --- AJUSTE MANUALMENTE ESTA LINHA ---
const IP_DO_PC = '192.168.1.XX'; // <-- Substitua pelo seu IP REAL!
//
```

Passo 5: Inicialização do Mobile

Na pasta mobile, inicie o projeto Expo:

```
npx expo start
