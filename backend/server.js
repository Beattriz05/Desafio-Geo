const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Configurações
app.use(cors({
    origin: '*', // Em produção, substitua pelo IP/domínio do seu app
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(bodyParser.json({ limit: '20mb' })); // Para imagens grandes

// Conexão com MongoDB Atlas
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://bia:SENHA_AQUI@cluster0.mongodb.net/laboratorioDB?retryWrites=true&w=majority";

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB Atlas!'))
.catch(err => {
    console.error('Erro ao conectar:', err);
    process.exit(1);
});

// Schema do Defeito
const DefeitoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'Título é obrigatório'],
        trim: true
    },
    descricao: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        trim: true
    },
    local: {
        type: String,
        required: [true, 'Local é obrigatório'],
        trim: true
    },
    laboratorio: {
        type: String,
        required: [true, 'Laboratório é obrigatório'],
        trim: true
    },
    foto: {
        type: String,
        default: null
    },
    dataHora: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pendente', 'em_manutencao', 'resolvido'],
        default: 'pendente'
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

const Defeito = mongoose.model('Defeito', DefeitoSchema);

// Rotas
// POST - Criar novo defeito
app.post('/api/defeitos', async (req, res) => {
    try {
        const { titulo, descricao, local, laboratorio, foto } = req.body;
        
        // Validação básica
        if (!titulo || !descricao || !local || !laboratorio) {
            return res.status(400).json({
                success: false,
                message: 'Preencha todos os campos obrigatórios'
            });
        }

        const novoDefeito = new Defeito({
            titulo,
            descricao,
            local,
            laboratorio,
            foto: foto || null
        });

        await novoDefeito.save();
        
        res.status(201).json({
            success: true,
            message: 'Defeito registrado com sucesso!',
            data: novoDefeito
        });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar registro',
            error: error.message
        });
    }
});

// GET - Listar todos os defeitos
app.get('/api/defeitos', async (req, res) => {
    try {
        const defeitos = await Defeito.find().sort({ dataHora: -1 });
        res.json({
            success: true,
            count: defeitos.length,
            data: defeitos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar registros',
            error: error.message
        });
    }
});

// GET - Buscar defeito por ID
app.get('/api/defeitos/:id', async (req, res) => {
    try {
        const defeito = await Defeito.findById(req.params.id);
        
        if (!defeito) {
            return res.status(404).json({
                success: false,
                message: 'Defeito não encontrado'
            });
        }
        
        res.json({
            success: true,
            data: defeito
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar registro',
            error: error.message
        });
    }
});

// Middleware para tratamento de erros 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log(`Para acesso externo: http://SEU_IP_LOCAL:${PORT}`);
});