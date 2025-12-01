import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Network from 'expo-network';

// Definição de tipos TypeScript
interface FormData {
  titulo: string;
  descricao: string;
  local: string;
  laboratorio: string;
  foto: string | null;
}

export default function App() {
  // Estados com tipagem
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    local: '',
    laboratorio: '',
    foto: null
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [ipLocal, setIpLocal] = useState<string>('');

  // Atualizar campos do formulário
  const updateFormData = (field: keyof FormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Descobrir IP automaticamente
  useEffect(() => {
    const descobrirIP = async () => {
      try {
        // Em Codespaces/GitHub, use localhost
        const ip = 'localhost';
        setIpLocal(ip);
        setApiUrl(`http://${ip}:3000/api/defeitos`);
        console.log(`API URL: http://${ip}:3000/api/defeitos`);
      } catch (error) {
        console.log('Erro ao obter IP:', error);
        setApiUrl('http://localhost:3000/api/defeitos');
      }
    };
    
    descobrirIP();
    
    // Solicitar permissões ao iniciar
    (async () => {
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (libraryStatus !== 'granted' || cameraStatus !== 'granted') {
        Alert.alert('Permissões necessárias', 'Precisamos de permissão para acessar fotos e câmera.');
      }
    })();
  }, []);

  // Função para selecionar imagem da galeria
  const selecionarImagem = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        updateFormData('foto', `data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  // Função para tirar foto
  const tirarFoto = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        updateFormData('foto', `data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  // Função para enviar os dados
  const enviarRelatorio = async () => {
    // Validação
    if (!formData.titulo.trim()) {
      Alert.alert('Erro', 'Por favor, informe o título do defeito');
      return;
    }
    if (!formData.descricao.trim()) {
      Alert.alert('Erro', 'Por favor, informe a descrição do problema');
      return;
    }
    if (!formData.local.trim()) {
      Alert.alert('Erro', 'Por favor, informe o local');
      return;
    }
    if (!formData.laboratorio.trim()) {
      Alert.alert('Erro', 'Por favor, informe o laboratório');
      return;
    }

    setLoading(true);

    const dados = {
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim(),
      local: formData.local.trim(),
      laboratorio: formData.laboratorio.trim(),
      foto: formData.foto
    };

    console.log('Enviando dados para:', apiUrl);
    console.log('Dados:', JSON.stringify(dados).substring(0, 100) + '...');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      console.log(' Resposta status:', response.status);

      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          'Sucesso!', 
          'Defeito registrado com sucesso!',
          [{ text: 'OK', onPress: limparCampos }]
        );
        console.log('Resposta completa:', result);
      } else {
        const errorText = await response.text();
        Alert.alert('Erro', `Falha ao registrar: ${response.status} ${errorText}`);
      }
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      Alert.alert(
        'Erro de Conexão', 
        `Verifique:\n1. Se o backend está rodando\n2. A URL: ${apiUrl}\n\nErro: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar campos
  const limparCampos = () => {
    setFormData({
      titulo: '',
      descricao: '',
      local: '',
      laboratorio: '',
      foto: null
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔧 Reportar Defeito</Text>
          <Text style={styles.headerSubtitle}>Sistema de Manutenção de Equipamentos</Text>
          {ipLocal ? (
            <Text style={styles.ipText}>Servidor: {ipLocal}:3000</Text>
          ) : null}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Título do Defeito *</Text>
          <TextInput
            placeholder="Ex: Microscópio com lente quebrada"
            style={styles.input}
            value={formData.titulo}
            onChangeText={(text) => updateFormData('titulo', text)}
            editable={!loading}
          />

          <Text style={styles.label}>Descrição Detalhada *</Text>
          <TextInput
            placeholder="Descreva o problema em detalhes..."
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={formData.descricao}
            onChangeText={(text) => updateFormData('descricao', text)}
            editable={!loading}
          />

          <Text style={styles.label}>Local *</Text>
          <TextInput
            placeholder="Ex: Prédio C, Sala 205"
            style={styles.input}
            value={formData.local}
            onChangeText={(text) => updateFormData('local', text)}
            editable={!loading}
          />

          <Text style={styles.label}>Laboratório *</Text>
          <TextInput
            placeholder="Ex: Laboratório de Química 03"
            style={styles.input}
            value={formData.laboratorio}
            onChangeText={(text) => updateFormData('laboratorio', text)}
            editable={!loading}
          />

          <Text style={styles.label}>Foto do Equipamento (Opcional)</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity 
              style={[styles.photoButton, styles.galleryButton]}
              onPress={selecionarImagem}
              disabled={loading}
            >
              <Text style={styles.photoButtonText}>📁 Galeria</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.photoButton, styles.cameraButton]}
              onPress={tirarFoto}
              disabled={loading}
            >
              <Text style={styles.photoButtonText}>📷 Câmera</Text>
            </TouchableOpacity>
          </View>

          {formData.foto && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Pré-visualização:</Text>
              <Image 
                source={{ uri: formData.foto }} 
                style={styles.previewImage} 
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => updateFormData('foto', null)}
                disabled={loading}
              >
                <Text style={styles.removeButtonText}>✕ Remover Foto</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={enviarRelatorio}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>📤 ENVIAR RELATÓRIO</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.clearButton}
              onPress={limparCampos}
              disabled={loading}
            >
              <Text style={styles.clearButtonText}>Limpar Campos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              * Campos obrigatórios{'\n'}
              Data/hora será registrada automaticamente
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 25,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    marginBottom: 10,
  },
  ipText: {
    fontSize: 12,
    color: '#bbdefb',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  photoButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  galleryButton: {
    backgroundColor: '#4CAF50',
  },
  cameraButton: {
    backgroundColor: '#FF9800',
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  removeButton: {
    marginTop: 10,
    padding: 10,
  },
  removeButtonText: {
    color: '#f44336',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 30,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#90caf9',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
  },
  footer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
  },
  footerText: {
    color: '#1976d2',
    fontSize: 14,
    lineHeight: 20,
  },
});