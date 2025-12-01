import React, { useState } from 'react';
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

// --- CONFIGURAÇÃO IMPORTANTE ---
// Substitua o IP abaixo pelo IP do seu computador (IPv4)
// No Windows: Abra o terminal, digite 'ipconfig' e pegue o Endereço IPv4.
// No Mac/Linux: Digite 'ifconfig' no terminal.
// Se estiver usando Emulador Android, pode tentar '10.0.2.2'.
const SEU_IP = '192.168.1.15'; // <--- TROQUE ISSO AQUI PELO SEU IP
const API_URL = `http://${SEU_IP}:3000/api/defeitos`;

// Definição de tipos TypeScript
interface FormData {
  titulo: string;
  descricao: string;
  local: string;
  laboratorio: string;
  foto: string | null;
}

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    local: '',
    laboratorio: '',
    foto: null
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Atualizar campos do formulário
  const updateFormData = (field: keyof FormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função genérica para lidar com permissões e obter imagem
  const handleImagePicker = async (mode: 'camera' | 'gallery') => {
    try {
      let permissionResult;
      
      if (mode === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (permissionResult.status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso para anexar fotos.');
        return;
      }

      let result;
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correção aqui (versão nova do Expo)
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduzi para 0.5 para não pesar no envio base64
        base64: true,
      };

      if (mode === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets[0].base64) {
        updateFormData('foto', `data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível obter a imagem.');
    }
  };

  // Função para enviar os dados
  const enviarRelatorio = async () => {
    if (!formData.titulo.trim() || !formData.descricao.trim() || !formData.local.trim()) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios (Título, Descrição e Local).');
      return;
    }

    setLoading(true);

    const dados = {
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim(),
      local: formData.local.trim(),
      laboratorio: formData.laboratorio.trim(),
      foto: formData.foto // Atenção: Strings base64 podem ser grandes
    };

    try {
      console.log(`Tentando conectar em: ${API_URL}`);
      
      // Adicionado timeout para não ficar carregando infinitamente se o IP estiver errado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        Alert.alert('Sucesso!', 'Defeito registrado com sucesso!', [{ text: 'OK', onPress: limparCampos }]);
      } else {
        const errorText = await response.text();
        throw new Error(`Servidor respondeu com: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      
      let msg = 'Erro desconhecido.';
      if (error.name === 'AbortError') msg = 'Tempo limite excedido. Verifique o IP.';
      else if (error.message.includes('Network request failed')) msg = 'Falha na conexão. Verifique se o celular e o PC estão no mesmo Wi-Fi e se o IP está correto.';
      else msg = error.message;

      Alert.alert('Erro de Conexão', msg);
    } finally {
      setLoading(false);
    }
  };

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
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔧 Reportar Defeito</Text>
          <Text style={styles.headerSubtitle}>Geo-Mobile Manutenção</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Título do Defeito *</Text>
          <TextInput
            placeholder="Ex: Microscópio quebrado"
            style={styles.input}
            value={formData.titulo}
            onChangeText={(text) => updateFormData('titulo', text)}
            editable={!loading}
          />

          <Text style={styles.label}>Descrição Detalhada *</Text>
          <TextInput
            placeholder="Descreva o problema..."
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={formData.descricao}
            onChangeText={(text) => updateFormData('descricao', text)}
            editable={!loading}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
                <Text style={styles.label}>Local *</Text>
                <TextInput
                    placeholder="Ex: Sala 205"
                    style={styles.input}
                    value={formData.local}
                    onChangeText={(text) => updateFormData('local', text)}
                    editable={!loading}
                />
            </View>
            <View style={styles.halfInput}>
                <Text style={styles.label}>Laboratório</Text>
                <TextInput
                    placeholder="Ex: Quimica 01"
                    style={styles.input}
                    value={formData.laboratorio}
                    onChangeText={(text) => updateFormData('laboratorio', text)}
                    editable={!loading}
                />
            </View>
          </View>

          <Text style={styles.label}>Evidência (Foto)</Text>
          
          {formData.foto ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: formData.foto }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity style={styles.removeButton} onPress={() => updateFormData('foto', null)}>
                <Text style={styles.removeButtonText}>Remover foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
                <TouchableOpacity 
                style={[styles.photoButton, styles.galleryButton]}
                onPress={() => handleImagePicker('gallery')}
                disabled={loading}
                >
                <Text style={styles.photoButtonText}>Galeria</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                style={[styles.photoButton, styles.cameraButton]}
                onPress={() => handleImagePicker('camera')}
                disabled={loading}
                >
                <Text style={styles.photoButtonText}>Câmera</Text>
                </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={enviarRelatorio}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>ENVIAR RELATÓRIO</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  header: {
    backgroundColor: '#004aad', // Azul mais profissional
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#e0e0e0', marginTop: 5 },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    elevation: 1,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  photoButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  photoButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  galleryButton: { backgroundColor: '#5c6bc0' },
  cameraButton: { backgroundColor: '#ffa726' },
  photoButtonText: { color: '#fff', fontWeight: 'bold' },
  previewContainer: { marginTop: 15, alignItems: 'center' },
  previewImage: { width: '100%', height: 200, borderRadius: 10, backgroundColor: '#ddd' },
  removeButton: { padding: 10 },
  removeButtonText: { color: '#d32f2f', fontWeight: 'bold' },
  submitButton: {
    backgroundColor: '#004aad',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});