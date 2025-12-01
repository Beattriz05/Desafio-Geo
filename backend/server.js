const express = require('express');
const bodyParser = require('body-parser'); // Não é estritamente necessário na v4.16+ do Express, mas vou manter para clareza
const cors = require('cors');
const fs = require('fs'); // Para salvar o arquivo no servidor
const path = require('path'); // Para resolver caminhos

const app = express();
const port = 3000;

// Configuração do CORS (Crucial para comunicação Front-End <-> Back-End)
app.use(cors({
    origin: '*', // Permite todas as origens (bom para desenvolvimento)
    methods: 'GET,POST',
}));

// --- CORREÇÃO E MELHORIA CRÍTICA AQUI ---
// Aumenta o limite do corpo da requisição para 50MB.
// Isso é essencial para lidar com strings Base64 de imagens grandes.
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rota de Teste Simples
app.get('/', (req, res) => {
    res.send('Servidor Geo-Mobile Online! A API está em /api/defeitos');
});

// 📌 Rota Principal: POST /api/defeitos
app.post('/api/defeitos', async (req, res) => {
    const { titulo, descricao, local, laboratorio, foto } = req.body;
    
    // Simulação do ID e Data/Hora
    const novoDefeito = {
        id: Date.now(),
        dataHora: new Date().toISOString(),
        titulo,
        descricao,
        local,
        laboratorio,
        // O campo 'foto' ainda é a string Base64 por enquanto
        foto: null, 
    };

    // --- LÓGICA PARA SALVAR IMAGEM BASE64 ---
    if (foto) {
        // 1. Remove o prefixo 'data:image/jpeg;base64,' para obter apenas os dados Base64
        const base64Data = foto.replace(/^data:image\/\w+;base64,/, "");
        
        // 2. Cria um buffer a partir da string Base64
        const buffer = Buffer.from(base64Data, 'base64');
        
        // 3. Define o nome e o caminho do arquivo
        const nomeArquivo = `defeito_${novoDefeito.id}.jpeg`;
        const caminhoArquivo = path.join(__dirname, 'uploads', nomeArquivo); // 'uploads' é a pasta

        // 4. Cria a pasta 'uploads' se ela não existir
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        try {
            // 5. Salva o arquivo localmente
            fs.writeFileSync(caminhoArquivo, buffer);
            
            // 6. Altera o objeto para armazenar o caminho da imagem em vez da string Base64
            // No front-end, você usaria o endereço do servidor/uploads/nomeArquivo
            novoDefeito.foto = `/uploads/${nomeArquivo}`;
            console.log(`Imagem salva em: ${caminhoArquivo}`);

        } catch (err) {
            console.error("Erro ao salvar a imagem:", err);
            // Decide se o erro de salvar a foto deve impedir o registro do defeito
            return res.status(500).json({ 
                mensagem: "Falha ao processar a imagem.", 
                detalhe: err.message 
            });
        }
    }
    
    // 7. Simula a inserção no "banco de dados" (aqui você faria a lógica de DB)
    console.log(`Defeito registrado com sucesso (ID: ${novoDefeito.id})`);
    
    // Resposta de sucesso para o Front-End
    return res.status(201).json({ 
        mensagem: "Defeito registrado!", 
        dados: novoDefeito 
    });
});

// Adiciona o middleware para servir arquivos estáticos (imagens salvas)
// Agora o Front-End pode acessar a imagem em: http://SEU_IP:3000/uploads/defeito_ID.jpeg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inicialização do Servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('Rotas disponíveis:');
    console.log(`POST http://localhost:${port}/api/defeitos`);
});