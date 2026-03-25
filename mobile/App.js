import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  Modal
} from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import {
  Home,
  CheckCircle2,
  Image as ImageIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  CloudUpload,
  Camera as CameraIcon,
  X,
  Lock,
  AlertCircle
} from 'lucide-react-native';
import { supabase } from './src/api/supabaseClient';
import { offlineStorage } from './src/utils/offlineStorage';

// Colores institucionales
const COLORS = {
  primary: '#C0001D', // Rojo Institucional Nasa Kiwe
  secondary: '#d85b1d', // Café/Naranja
  accent: '#f9e8bb', // Crema
  success: '#10B981',
  error: '#DC2626',
  white: '#FFFFFF',
  gray: '#F3F4F6',
  text: '#1F2937'
};

export default function App() {
  const [proyectosDB, setProyectosDB] = useState([]);
  const [viviendasDB, setViviendasDB] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeSlot, setActiveSlot] = useState(0);
  const [selectedImageForViewer, setSelectedImageForViewer] = useState(null);
  const cameraRef = useRef(null);

  // --- ESTADOS RESTAURADOS ---
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [houseProgress, setHouseProgress] = useState({});
  const [activitiesProgress, setActivitiesProgress] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({ 'Preliminares': true });
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [capturedImages, setCapturedImages] = useState([null, null, null]);
  const [slotProgress, setSlotProgress] = useState(['0', '0', '0']);
  const [progresoManual, setProgresoManual] = useState('0');
  const [observaciones, setObservaciones] = useState('');
  const [activityHistory, setActivityHistory] = useState([]);
  // ---------------------------

  // Cargar Proyectos Dinámicos
  useEffect(() => {
    if (view === 'projects' && isOnline) {
      fetchProjects();
    }
  }, [view]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setProyectosDB(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  // Cargar Viviendas Dinámicas
  useEffect(() => {
    if (view === 'houses' && selectedProject && isOnline) {
      fetchHouses();
    }
  }, [view, selectedProject]);

  const fetchHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('viviendas')
        .select('*')
        .eq('proyecto_id', selectedProject.id)
        .not('beneficiario', 'is', null)
        .neq('beneficiario', '')
        .order('numero_lote', { ascending: true });
      if (!error && data) setViviendasDB(data);
    } catch (err) {
      console.error('Error fetching houses:', err);
    }
  };

  const ACTIVIDADES_AGRUPADAS = {
    'Preliminares': [
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6a', nombre: '1.01 Localización y replanteo' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6b', nombre: '1.02 Excavación manual' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6c', nombre: '1.03 Relleno con material de sitio' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6d', nombre: '1.04 Sobre acarreo de materiales' }
    ],
    'Cimentación': [
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6e', nombre: '2.01 Solado de limpieza' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6f', nombre: '2.02 Viga de cimentación 0.20*0.25m' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a60', nombre: '2.03 Viga de cimentación 0.20*0.20m' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a61', nombre: '2.04 Concreto Ciclópeo' }
    ],
    'Estructura': [
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a62', nombre: '3.01 Viga de amarre' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a63', nombre: '3.02 Viga cumbrera' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a64', nombre: '3.03 Columna 0.20*0.20m' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a65', nombre: '3.04 Columna 0.12*0.20m' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a66', nombre: '3.05 Cinta de amarre' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a67', nombre: '3.06 Acero de refuerzo Grado 60' }
    ],
    'Cubierta': [
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a68', nombre: '4.01 Correas tipo Perlín' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6a69', nombre: '4.02 Teja de fibrocemento P7' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6a', nombre: '4.03 Caballete fijo' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6b', nombre: '4.04 Cumbreras y limatesas' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6c', nombre: '4.05 Solapa en lámina metálica' }
    ],
    'Pisos': [
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6d', nombre: '5.01 Piso primario e=0.07m' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6e', nombre: '5.02 Piso cerámico comercial' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6f', nombre: '5.03 Guardaescoba cerámico' },
      { id: '55615705-5c1a-4286-990a-6e5a6a6a6b70', nombre: '5.04 Andén en concreto 21MPa' }
    ]
  };

  // Lista plana de IDs en orden secuencial para validación
  const ALL_ACTIVITIES_FLAT = Object.values(ACTIVIDADES_AGRUPADAS).flat();

  const toggleChapter = (capitulo) => {
    setExpandedChapters(prev => ({ ...prev, [capitulo]: !prev[capitulo] }));
  };

  // Simulación de detección de red y solicitud de GPS
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado. No se grabarán coordenadas.');
        return;
      }
    })();

    // Aquí se usaría NetInfo en un proyecto real
    const interval = setInterval(() => {
      // Simular variaciones de red para pruebas
      // setIsOnline(prev => Math.random() > 0.1); 
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sincronización automática cuando detecta internet
  useEffect(() => {
    if (isOnline && !syncing) {
      processOfflineQueue();
    }
  }, [isOnline]);

  // Cargar avances automáticamente al entrar en la vista de casas
  useEffect(() => {
    if (view === 'houses' || selectedHouse) { // Cargar también cuando se selecciona una casa
      loadAllHousesProgress();
    }
  }, [view, selectedProject, selectedHouse]); // Dependencia de selectedHouse para recargar el detalle

  const loadAllHousesProgress = async () => {
    try {
      let combinedData = [];

      // 1. Datos desde Supabase
      if (isOnline) {
        const { data, error } = await supabase
          .from('evidencias_obra')
          .select('vivienda_num, actividad_id, progreso')
          .eq('proyecto_id', selectedProject.id);
        if (!error && data) combinedData = data;
      }

      // 2. Unir con la COLA OFFLINE
      const queue = await offlineStorage.getQueue();
      const offlineEntries = queue
        .filter(item => item.proyecto_id === selectedProject.id)
        .map(item => ({
          vivienda_num: item.vivienda_id,
          actividad_id: item.actividad_id,
          progreso: item.progreso || 0
        }));

      const dataForCalc = [...combinedData, ...offlineEntries];

      const totalActivitiesCount = 23; // Catálogo fijo
      const houseProgSum = {};
      const activitiesAccounted = {};
      const currentHouseDetail = {};

      dataForCalc.forEach(item => {
        const hNum = item.vivienda_num;
        if (!activitiesAccounted[hNum]) activitiesAccounted[hNum] = {};

        // Lógica ADITIVA: sumamos los progresos de cada reporte para esta actividad
        const currentActProg = (activitiesAccounted[hNum][item.actividad_id] || 0);
        const newTotal = currentActProg + (item.progreso || 0);

        // Capar a 100% por actividad
        activitiesAccounted[hNum][item.actividad_id] = newTotal > 100 ? 100 : newTotal;

        if (hNum === selectedHouse) {
          currentHouseDetail[item.actividad_id] = activitiesAccounted[hNum][item.actividad_id];
        }
      });

      const finalProgress = {};
      Object.keys(activitiesAccounted).forEach(hNum => {
        const sumOfProgs = Object.values(activitiesAccounted[hNum]).reduce((a, b) => a + b, 0);
        const percentage = Math.round(sumOfProgs / totalActivitiesCount);
        finalProgress[hNum] = percentage > 100 ? 100 : percentage;
      });
      setHouseProgress(finalProgress);
      if (selectedHouse) {
        setActivitiesProgress(currentHouseDetail);
      }
    } catch (err) {
      console.error('Error cargando avance global de casas:', err);
    }
  };

  const loadActivityHistory = async (hNum, actId) => {
    if (!isOnline) return;
    try {
      const { data, error } = await supabase
        .from('evidencias_obra')
        .select('*')
        .eq('vivienda_num', hNum.toString())
        .eq('actividad_id', actId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setActivityHistory(data);
      }
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  };

  const processOfflineQueue = async () => {
    const queue = await offlineStorage.getQueue();
    if (queue.length === 0) return;

    setSyncing(true);
    console.log('Sincronizando reportes pendientes...', queue.length);

    for (const item of queue) {
      try {
        await uploadReport(item);
      } catch (error) {
        console.error('Error sincronizando item:', error);
      }
    }

    await offlineStorage.clearQueue();
    setSyncing(false);
    loadAllHousesProgress(); // Recargar porcentajes después de subir pendientes
    Alert.alert('Sincronización', 'Todos los reportes pendientes han sido cargados.');
  };

  const renderImageModal = () => (
    <Modal
      visible={!!selectedImageForViewer}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setSelectedImageForViewer(null)}
    >
      <View style={styles.modalBg}>
        <TouchableOpacity
          style={styles.modalCloseBtn}
          onPress={() => setSelectedImageForViewer(null)}
        >
          <X color="#fff" size={30} />
        </TouchableOpacity>
        <Image
          source={{ uri: selectedImageForViewer }}
          style={styles.modalFullImage}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );

  const uploadReport = async (report) => {
    // Inicializamos con las URLs que ya vienen en el reporte (pueden ser remotas o locales)
    const urls = [...report.photos];

    // Si hay fotos y hay internet, procesarlas
    if (report.photos && report.photos.length > 0 && isOnline) {
      for (let i = 0; i < report.photos.length; i++) {
        const photoUri = report.photos[i];
        if (!photoUri) continue; // slot vacío

        // SI YA ES UNA URL REMOTA, NO SUBIR
        if (photoUri.startsWith('http')) {
          console.log(`Foto slot ${i} ya es remota, se mantiene.`);
          continue;
        }

        // ES UNA FOTO LOCAL NUEVA (file://), SUBIRLA
        try {
          const fileName = `obra_${Date.now()}_${report.vivienda_id}_slot${i}.jpg`;
          const base64 = await FileSystem.readAsStringAsync(photoUri, { encoding: 'base64' });
          const arrayBuffer = decode(base64);

          const { data, error } = await supabase.storage
            .from('fotos-bitacora')
            .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });

          if (!error && data) {
            const { data: urlData } = supabase.storage.from('fotos-bitacora').getPublicUrl(fileName);
            urls[i] = urlData.publicUrl;
            console.log(`Foto slot ${i} (local) subida: ${urls[i]}`);
          } else {
            console.error(`Error subiendo foto slot ${i}:`, error);
          }
        } catch (e) {
          console.error(`Error procesando foto slot ${i + 1}:`, e);
        }
      }
    }

    // Insertar el registro con el porcentaje MANUAL y las 3 URLs
    const { data: recordData, error } = await supabase
      .from('evidencias_obra')
      .insert([{
        proyecto_id: report.proyecto_id,
        vivienda_num: report.vivienda_id,
        actividad_id: report.actividad_id,
        actividad_nombre: report.actividad_nombre,
        foto_url: urls[0],
        foto_url_2: urls[1],
        foto_url_3: urls[2],
        progreso: report.progreso || 0,
        progreso_2: report.progreso_2 || 0,
        progreso_3: report.progreso_3 || 0,
        comentario: report.observaciones,
        latitud: report.latitud,
        longitud: report.longitud,
        usuario_id: '00000000-0000-0000-0000-000000000000'
      }])
      .select();

    if (error) {
      console.error('Error Supabase:', error);
      throw error;
    }
  };

  const decode = (base64) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setUser({ nombre: 'Ing. Carlos Pérez', rol: 'residente' });
      setView('projects');
      setLoading(false);
    }, 1500);
  };

  // Manejador centralizado de navegación
  const navigateTo = (newView) => {
    setView(newView);
  };

  const takePhoto = async () => {
    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }
    setView('camera');
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        const newImages = [...capturedImages];
        newImages[activeSlot] = photo.uri;
        setCapturedImages(newImages);

        // Si es la primera localización
        if (!location) {
          let loc = await Location.getCurrentPositionAsync({});
          setLocation(loc);
        }

        setView('activity_report');
      } catch (e) {
        Alert.alert('Error', 'No se pudo capturar la imagen');
      }
    }
  };

  const calculateTotalProgress = (progs) => {
    return progs.reduce((acc, curr) => acc + (parseInt(curr) || 0), 0);
  };

  const sendReport = async () => {
    const totalProg = calculateTotalProgress(slotProgress);

    if (capturedImages.every(img => !img)) {
      Alert.alert('Faltan datos', 'Debes tomar al menos una foto de evidencia.');
      return;
    }
    if (totalProg === 0) {
      Alert.alert('Faltan datos', 'El reporte debe sumar al menos un 1% de avance.');
      return;
    }

    setLoading(true);
    const reportData = {
      proyecto_id: selectedProject.id,
      vivienda_id: selectedHouse.toString(),
      actividad_id: selectedActivity.id,
      actividad_nombre: selectedActivity.nombre,
      photos: capturedImages,
      progreso: totalProg,
      progreso_2: parseInt(slotProgress[1]) || 0,
      progreso_3: parseInt(slotProgress[2]) || 0,
      observaciones: observaciones,
      latitud: location?.coords?.latitude,
      longitud: location?.coords?.longitude,
      timestamp: new Date().toISOString()
    };

    try {
      if (isOnline) {
        await uploadReport(reportData);
        // NUEVO: Tras envío exitoso, limpiar el borrador local para empezar desde cero
        await offlineStorage.clearLastReport(selectedActivity.id, selectedHouse.toString());
        Alert.alert('¡Éxito!', 'Reporte enviado correctamente.');
      } else {
        await offlineStorage.saveToQueue(reportData);
        Alert.alert('Guardado Offline', 'No hay conexión. El reporte se enviará automáticamente cuando recuperes internet.');
      }

      // Limpiar y volver
      setCapturedImages([null, null, null]);
      setSlotProgress(['0', '0', '0']);
      setProgresoManual('0');
      setObservaciones('');
      setLocation(null);

      await loadAllHousesProgress();
      setView('activity');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el reporte. Intenta de nuevo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // VISTAS -------------------------------------------------------------------

  if (view === 'camera') {
    return (
      <View style={styles.cameraScreen}>
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setView('activity_report')}>
              <X color="#fff" size={30} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  const renderLogin = () => (
    <View style={styles.loginContainer}>
      <View style={styles.logoCircle}>
        <Image
          source={require('./assets/logo.ico')}
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>Nasa Kiwe</Text>
      <Text style={styles.subtitle}>Supervisión Técnica de Obra</Text>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Usuario" placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry placeholderTextColor="#999" />
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Ingresar al Sistema</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 25, padding: 10 }}
        onPress={async () => {
          Alert.alert(
            'Reiniciar Aplicación',
            '¿Estás seguro de que deseas limpiar TODOS los datos locales? Esto incluye fotos pendientes y avance guardado.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Sí, Limpiar Todo',
                style: 'destructive',
                onPress: async () => {
                  await offlineStorage.resetAllData();
                  Alert.alert('Éxito', 'Datos locales eliminados. La aplicación se ha reiniciado.');
                }
              }
            ]
          );
        }}
      >
        <Text style={{ color: COLORS.secondary, fontWeight: '600', textDecorationLine: 'underline' }}>
          Limpiar Datos de la Aplicación
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProjectsView = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nasa Kiwe - Proyectos</Text>
        <TouchableOpacity onPress={() => setView('login')}>
          <LogOut color={COLORS.error} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Mis Proyectos</Text>
        <Text style={styles.sectionLabel}>SELECCIONE EL PROYECTO DE VIVIENDA</Text>

        {proyectosDB.length > 0 ? (
          proyectosDB.map((proj) => (
            <TouchableOpacity
              key={proj.id}
              style={styles.houseCard}
              onPress={() => {
                setSelectedProject(proj);
                setView('houses');
              }}
            >
              <View style={styles.houseIcon}>
                <Home color={COLORS.primary} size={28} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.houseTitle}>{proj.nombre}</Text>
                <Text style={styles.houseStatus}>{proj.municipio} - {proj.resguardo}</Text>
              </View>
              <ChevronRight color="#CBD5E1" size={20} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={{ marginTop: 10, color: COLORS.secondary }}>Cargando proyectos...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.connectivity}>
          {isOnline ? <Wifi color={COLORS.success} size={16} /> : <WifiOff color={COLORS.error} size={16} />}
          <Text style={styles.connText}>{isOnline ? 'Conectado a la Red' : 'Trabajando sin Conexión'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );

  const renderHousesView = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setView('projects')} style={styles.backBtn}>
          <ChevronLeft color={COLORS.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viviendas</Text>
        <TouchableOpacity onPress={() => setView('login')}>
          <LogOut color={COLORS.error} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>{selectedProject?.nombre}</Text>
        <Text style={styles.sectionLabel}>LISTADO DE BENEFICIARIOS</Text>

        {viviendasDB.length > 0 ? (
          viviendasDB.map((viv) => (
            <TouchableOpacity
              key={viv.id}
              style={styles.houseCard}
              onPress={() => {
                setSelectedHouse(viv.numero_lote);
                setView('activity');
              }}
            >
              <View style={styles.houseIcon}>
                <Home color={COLORS.primary} size={28} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.houseTitle}>Casa {viv.numero_lote}</Text>
                <Text style={[styles.houseStatus, { fontWeight: '700', color: COLORS.secondary }]}>
                  {viv.beneficiario || 'Sin beneficiario asignado'}
                </Text>
              </View>
              <View style={[
                styles.progressBadge,
                (houseProgress[viv.numero_lote] || 0) === 100 && { backgroundColor: COLORS.success }
              ]}>
                <Text style={[
                  styles.progressText,
                  (houseProgress[viv.numero_lote] || 0) === 100 && { color: '#fff' }
                ]}>
                  {houseProgress[viv.numero_lote] || 0}%
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={{ marginTop: 10, color: COLORS.secondary }}>Enlazando con el proyecto...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.connectivity}>
          {isOnline ? <Wifi color={COLORS.success} size={16} /> : <WifiOff color={COLORS.error} size={16} />}
          <Text style={styles.connText}>{isOnline ? 'Conectado a la Red' : 'Trabajando sin Conexión'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );

  const renderActivities = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo('houses')} style={styles.backBtn}>
          <ChevronLeft color={COLORS.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Casa Unidad {selectedHouse}</Text>
        <TouchableOpacity onPress={processOfflineQueue}>
          <CloudUpload color={syncing ? COLORS.secondary : COLORS.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionLabel}>CRONOGRAMA DE EJECUCIÓN</Text>

        {Object.entries(ACTIVIDADES_AGRUPADAS).map(([capitulo, actividades]) => (
          <View key={capitulo} style={styles.chapterContainer}>
            <TouchableOpacity
              style={styles.chapterHeader}
              onPress={() => toggleChapter(capitulo)}
            >
              <Text style={styles.chapterTitle}>{capitulo}</Text>
              {expandedChapters[capitulo] ? <ChevronLeft style={{ transform: [{ rotate: '-90deg' }] }} color={COLORS.primary} size={20} /> : <ChevronRight color={COLORS.primary} size={20} />}
            </TouchableOpacity>

            {expandedChapters[capitulo] && (
              <View style={styles.chapterContent}>
                {actividades.map((act, idxInChapter) => {
                  const flatIndex = ALL_ACTIVITIES_FLAT.findIndex(a => a.id === act.id);
                  const isFirst = flatIndex === 0;
                  const isSecond = flatIndex === 1;

                  // Progresos de las dos actividades anteriores
                  const prevId = !isFirst ? ALL_ACTIVITIES_FLAT[flatIndex - 1].id : null;
                  const prevPrevId = (!isFirst && !isSecond) ? ALL_ACTIVITIES_FLAT[flatIndex - 2].id : null;

                  const prevProgress = prevId ? (activitiesProgress[prevId] || 0) : 0;
                  const prevPrevProgress = prevPrevId ? (activitiesProgress[prevPrevId] || 0) : 100; // Si no hay prevPrev, se asume OK

                  // Reglas de desbloqueo:
                  // 1. La primera siempre está abierta.
                  // 2. La segunda se abre si la primera tiene visita (> 0%).
                  // 3. De la tercera en adelante: anterior con visita (>0) Y la anterior de la anterior al 100%.
                  let isUnlocked = false;
                  if (isFirst) {
                    isUnlocked = true;
                  } else if (isSecond) {
                    isUnlocked = prevProgress > 0;
                  } else {
                    isUnlocked = (prevProgress > 0) && (prevPrevProgress === 100);
                  }

                  const currentProgress = activitiesProgress[act.id] || 0;
                  const isCompleted = currentProgress === 100;
                  const isLocked = !isUnlocked;

                  return (
                    <View key={act.id} style={[styles.activityCard, isLocked && { opacity: 0.6, backgroundColor: '#F1F5F9' }]}>
                      <View style={styles.activityInfo}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {isLocked && <Lock size={14} color="#94A3B8" />}
                          <Text style={[styles.actName, isLocked && { color: '#64748B' }]}>{act.nombre}</Text>
                        </View>
                        {currentProgress > 0 && !isLocked && (
                          <View style={[styles.miniBadge, {
                            backgroundColor: isCompleted ? '#F0FDF4' : '#FFF7ED',
                            borderColor: isCompleted ? COLORS.success : '#FED7AA'
                          }]}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: isCompleted ? COLORS.success : COLORS.secondary }}>
                              {currentProgress}%
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.actActions}>
                        <TouchableOpacity
                          style={[
                            styles.actBtn,
                            isCompleted && { backgroundColor: '#E8F5E9' },
                            isLocked && { backgroundColor: '#E2E8F0', borderColor: '#CBD5E1' }
                          ]}
                          activeOpacity={isLocked ? 1 : 0.7}
                          onPress={() => {
                            if (isLocked) {
                              if (!isFirst && prevProgress === 0) {
                                Alert.alert('Actividad Bloqueada', 'Debes iniciar la actividad anterior (mínimo registrar una visita) para habilitar esta casilla.');
                              } else {
                                Alert.alert('Actancia Técnica Requerida', 'La actividad ante-previa debe estar al 100% para poder continuar con esta fase del proyecto.');
                              }
                              return;
                            }
                            // Ir al reporte: cargar historial y precargar última foto ANTES de navegar
                            setSelectedActivity({ ...act, capitulo });
                            setSlotProgress(['0', '0', '0']);
                            setProgresoManual(currentProgress.toString());
                            setActivityHistory([]);
                            setCapturedImages([null, null, null]);

                            const navigateToReport = (urls, history) => {
                              setCapturedImages(urls);
                              setActivityHistory(history);
                              setView('activity_report');
                            };

                            // CARGAR DESDE CACHE LOCAL PRIMERO (Instantáneo)
                            const tryLocal = async () => {
                              const local = await offlineStorage.getLastReport(act.id, selectedHouse.toString());
                              if (local) {
                                // Precarga visual inmediata
                                setCapturedImages(local.photos || [null, null, null]);
                              }
                            };
                            tryLocal();

                            if (isOnline) {
                              setLoading(true);
                              supabase
                                .from('evidencias_obra')
                                .select('*')
                                .eq('vivienda_num', selectedHouse.toString())
                                .eq('actividad_id', act.id)
                                .order('created_at', { ascending: false })
                                .then(({ data, error }) => {
                                  setLoading(false);
                                  if (!error && data && data.length > 0) {
                                    const last = data[0];
                                    const urls = [
                                      last.foto_url || null,
                                      last.foto_url_2 || null,
                                      last.foto_url_3 || null
                                    ];
                                    const progs = [
                                      (last.progreso || 0).toString(),
                                      (last.progreso_2 || 0).toString(),
                                      (last.progreso_3 || 0).toString()
                                    ];
                                    // Sincronizar cache local con los datos más nuevos de Supabase
                                    offlineStorage.saveLastReport(act.id, selectedHouse.toString(), {
                                      photos: urls,
                                      progreso: last.progreso,
                                      observaciones: last.comentario,
                                      slotProgress: progs // Guardar también el desglose
                                    });
                                    // CORRECCIÓN: NO precargar los porcentajes históricos en los campos de entrada
                                    // para evitar duplicidad. Los campos empiezan en '0'.
                                    setSlotProgress(['0', '0', '0']);
                                    navigateToReport(urls, data);
                                  } else {
                                    navigateToReport([null, null, null], []);
                                  }
                                })
                                .catch(() => {
                                  setLoading(false);
                                  navigateToReport([null, null, null], []);
                                });
                            } else {
                              setView('activity_report');
                            }
                          }}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 color={COLORS.success} size={20} />
                              <Text style={[styles.actBtnText, { color: COLORS.success }]}>Finalizada</Text>
                            </>
                          ) : isLocked ? (
                            <>
                              <Lock color="#94A3B8" size={20} />
                              <Text style={[styles.actBtnText, { color: '#94A3B8' }]}>Bloqueada</Text>
                            </>
                          ) : (
                            <>
                              <CameraIcon color={COLORS.primary} size={20} />
                              <Text style={styles.actBtnText}>{currentProgress > 0 ? 'Actualizar Avance' : 'Reportar Evidencia'}</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );

  const renderReportPreview = () => {
    const totalProg = slotProgress.reduce((acc, val) => acc + (Number(val) || 0), 0);
    const isAt100 = totalProg >= 100;
    // Progreso previo ya registrado en supabase para esta actividad
    const prevProg = activitiesProgress[selectedActivity?.id] || 0;
    const totalConPrevio = prevProg + totalProg;
    const finalIsAt100 = totalConPrevio >= 100;
    const isOverLimit = totalConPrevio > 100;
    
    // CORRECCIÓN: Los slots solo se bloquean si la actividad YA ESTABA al 100% antes de entrar.
    // Esto permite que el usuario complete las 3 fotos incluso si la suma llega al 100% en este reporte.
    const wasAlreadyDone = prevProg >= 100;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setView('activity')} style={styles.backBtn}>
            <ChevronLeft color={COLORS.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resumen de Reporte</Text>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.fieldLabel}>EVIDENCIAS DE LA ACTIVIDAD (MÁXIMO 3)</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            {capturedImages.map((uri, idx) => (
              <View key={idx} style={{ width: 100, gap: 6, alignItems: 'center' }}>
                <TouchableOpacity
                  style={[{ width: 100, height: 100, borderRadius: 12, borderWidth: uri ? 2 : 1, borderColor: uri ? COLORS.success : '#CBD5E1', borderStyle: uri ? 'solid' : 'dashed', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }]}
                  disabled={wasAlreadyDone} // Bloquear solo si ya estaba terminada
                  onPress={() => {
                    if (uri) {
                      setSelectedImageForViewer(uri);
                    } else if (!wasAlreadyDone) {
                      setActiveSlot(idx);
                      setView('camera');
                    }
                  }}
                >
                  {uri ? (
                    <Image source={{ uri }} style={{ width: 100, height: 100, resizeMode: 'cover' }} />
                  ) : (
                    <View style={{ alignItems: 'center', gap: 4 }}>
                      <CameraIcon color="#94A3B8" size={48} />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8', marginTop: 4 }}>Foto {idx + 1}</Text>
                    </View>
                  )}
                  {uri && !wasAlreadyDone && ( // Botón borrar solo disponible si NO estaba terminada
                    <TouchableOpacity
                      style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(239, 68, 68, 0.9)', borderRadius: 12, width: 22, height: 22, justifyContent: 'center', alignItems: 'center' }}
                      onPress={(e) => {
                        e.stopPropagation();
                        const newImgs = [...capturedImages];
                        newImgs[idx] = null;
                        setCapturedImages(newImgs);
                        const newProgs = [...slotProgress];
                        newProgs[idx] = '0';
                        setSlotProgress(newProgs);
                      }}
                    >
                      <X color="#fff" size={14} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
                {uri && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 6, height: 38, justifyContent: 'center', minWidth: 60 }}>
                    <TextInput
                      style={{ fontSize: 18, fontWeight: '900', color: COLORS.primary, width: 42, textAlign: 'center', padding: 0 }}
                      value={slotProgress[idx]}
                      editable={!wasAlreadyDone}
                      onChangeText={(val) => {
                        const num = parseInt(val) || 0;
                        if (val === '' || (!isNaN(num) && num >= 0 && num <= 100)) {
                          const newProgs = [...slotProgress];
                          newProgs[idx] = val;
                          setSlotProgress(newProgs);
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                    <Text style={{ fontSize: 14, color: '#94A3B8', fontWeight: 'bold' }}>%</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {activityHistory.length > 0 && (
            <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: COLORS.primary }}>
              <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: 'bold' }}>Último registro detectado:</Text>
              <Text style={{ fontSize: 11, color: '#64748B' }}>
                Fecha: {new Date(activityHistory[0].created_at).toLocaleDateString('es-CO')} a las {new Date(activityHistory[0].created_at).toLocaleTimeString('es-CO')}
              </Text>
            </View>
          )}
          
          {/* GPS Status Indicator */}
          <View style={{ marginBottom: 20 }}>
            {location ? (
              <View style={[styles.statusBanner, { backgroundColor: '#F0FDF4', borderColor: COLORS.success }]}>
                <CheckCircle2 size={20} color={COLORS.success} />
                <View>
                  <Text style={[styles.statusText, { color: COLORS.success }]}>Ubicación Georreferenciada</Text>
                  <Text style={{ fontSize: 10, color: '#64748B' }}>
                    {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.statusBanner, { backgroundColor: '#FFFBEB', borderColor: '#F59E0B' }]}>
                <ActivityIndicator size="small" color="#F59E0B" />
                <View>
                  <Text style={[styles.statusText, { color: '#B45309' }]}>Obteniendo Ubicación...</Text>
                  <Text style={{ fontSize: 10, color: '#B45309' }}>Asegúrese de tener el GPS activo</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.reportForm}>
            <View style={styles.formGroup}>
              <Text style={styles.metaLabel}>Actividad:</Text>
              <Text style={styles.metaValue}>{selectedActivity?.nombre}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.metaLabel}>Avance de Este Reporte:</Text>
              <View style={styles.progressInputRow}>
                <View style={[styles.progressInput, { backgroundColor: isAt100 ? '#F0FDF4' : '#FFF7ED' }]}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: isAt100 ? COLORS.success : COLORS.secondary, textAlign: 'center' }}>
                    {totalProg}%
                  </Text>
                </View>
                <View style={styles.progressSlider}>
                  <View style={[styles.progressFill, { width: `${totalProg}%`, backgroundColor: isAt100 ? COLORS.success : COLORS.secondary }]} />
                </View>
              </View>
              {prevProg > 0 && (
                <View style={{ marginTop: 10, padding: 10, backgroundColor: isOverLimit ? '#FEF2F2' : (finalIsAt100 ? '#F0FDF4' : '#F8FAFC'), borderRadius: 8, borderWidth: 1, borderColor: isOverLimit ? '#FCA5A5' : (finalIsAt100 ? COLORS.success : '#E2E8F0') }}>
                  <Text style={{ fontSize: 12, color: isOverLimit ? '#B91C1C' : '#64748B', fontWeight: '600' }}>
                    {isOverLimit ? '⚠️ Excede el 100% permitido:' : 'Avance total de la actividad:'}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: isOverLimit ? '#B91C1C' : (finalIsAt100 ? COLORS.success : COLORS.secondary), marginTop: 2 }}>{totalConPrevio}%</Text>
                  <Text style={{ fontSize: 10, color: isOverLimit ? '#EF4444' : '#94A3B8', marginTop: 2 }}>({prevProg}% previo + {totalProg}% nuevo)</Text>
                </View>
              )}
              {isOverLimit ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
                  <AlertCircle color="#EF4444" size={16} />
                  <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '700' }}>Por favor ajusta los valores para no superar el 100%</Text>
                </View>
              ) : (finalIsAt100 || isAt100) && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
                  <CheckCircle2 color={COLORS.success} size={16} />
                  <Text style={{ fontSize: 12, color: COLORS.success, fontWeight: '700' }}>Actividad se marcará como FINALIZADA</Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.metaLabel}>Observaciones y Novedades:</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describa el estado actual o novedades..."
                multiline
                numberOfLines={4}
                value={observaciones}
                onChangeText={setObservaciones}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.statusBanner}>
              <AlertCircle size={20} color={isOnline ? COLORS.success : COLORS.secondary} />
              <Text style={[styles.statusText, { color: isOnline ? COLORS.success : COLORS.secondary }]}>
                {isOnline ? 'Conexión estable: Se enviará a la nube.' : 'Sin conexión: Se enviará al reconectar.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { marginTop: 10, marginBottom: 40 },
              (capturedImages.every(i => !i) || totalProg === 0 || wasAlreadyDone || loading || isOverLimit) && { opacity: 0.6 },
              (finalIsAt100 || isAt100) && !isOverLimit && { backgroundColor: COLORS.success },
              isOverLimit && { backgroundColor: '#EF4444' }
            ]}
            onPress={sendReport}
            disabled={loading || wasAlreadyDone || (capturedImages.every(i => !i) || totalProg === 0) || isOverLimit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.row}>
                {isOverLimit ? <AlertCircle color="#fff" size={20} /> : <CloudUpload color="#fff" size={20} />}
                <Text style={styles.btnText}>
                  {wasAlreadyDone 
                    ? 'Actividad Finalizada (100%)' 
                    : isOverLimit
                      ? '⚠️ Ajustar Porcentajes (Max 100%)'
                      : (finalIsAt100 || isAt100) 
                        ? `✓ Finalizar al 100% (Sube +${totalProg}%)` 
                        : `Enviar Reporte Técnico (+${totalProg}%)`}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <RNStatusBar barStyle="dark-content" />
      {view === 'login' && renderLogin()}
      {view === 'projects' && renderProjectsView()}
      {view === 'houses' && renderHousesView()}
      {view === 'activity' && renderActivities()}
      {view === 'activity_report' && renderReportPreview()}
      {renderImageModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  loginContainer: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.gray, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: COLORS.primary },
  logo: { width: 60, height: 60, resizeMode: 'contain' },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.secondary, marginBottom: 40, fontWeight: '600' },
  inputContainer: { width: '100%', gap: 12, marginBottom: 25 },
  input: { width: '100%', height: 50, backgroundColor: COLORS.gray, borderRadius: 10, paddingHorizontal: 15, fontSize: 15, borderWidth: 1, borderColor: '#DDD' },
  primaryBtn: { width: '100%', height: 55, backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  header: {
    height: Platform.OS === 'android' ? 60 + RNStatusBar.currentHeight : 90,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 35,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  content: { padding: 15 },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 15, color: COLORS.text },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#999', marginBottom: 10, letterSpacing: 1 },
  houseCard: { backgroundColor: '#fff', borderRadius: 14, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  houseIcon: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#F0F7F4', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  houseTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  houseStatus: { fontSize: 13, color: COLORS.secondary, marginTop: 2 },
  progressBadge: { backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  progressText: { fontSize: 12, fontWeight: '800', color: COLORS.secondary },
  chapterContainer: { marginBottom: 15, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  chapterHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: COLORS.secondary },
  chapterTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  chapterContent: { padding: 15, paddingTop: 5, backgroundColor: '#FAFAFA' },
  activityCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  thumbnailWrapper: { width: 120, height: 160, borderRadius: 12, marginRight: 10, overflow: 'hidden', position: 'relative', borderAdaptive: 1, borderColor: '#DDD' },
  thumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  removePhoto: { position: 'absolute', top: 5, right: 5, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(220, 38, 38, 0.8)', justifyContent: 'center', alignItems: 'center' },
  reportForm: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  formGroup: { marginBottom: 20 },
  progressInputRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 10 },
  progressInput: { width: 60, height: 45, backgroundColor: '#F8FAFC', borderRadius: 8, textAlign: 'center', fontSize: 18, fontWeight: '700', color: COLORS.primary, borderWidth: 1, borderColor: '#E2E8F0' },
  progressSlider: { flex: 1, height: 12, backgroundColor: '#E2E8F0', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 6 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10, borderLeftWidth: 4, borderLeftColor: COLORS.success },
  statusText: { fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaLabel: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 4 },
  textArea: { width: '100%', minHeight: 100, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 10, textAlignVertical: 'top' },
  activityInfo: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  actName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  actActions: { flexDirection: 'row' },
  actBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, backgroundColor: COLORS.gray, flex: 1, justifyContent: 'center' },
  actBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  footer: { height: 45, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE' },
  connectivity: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  connText: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  cameraScreen: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: { flex: 1, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'center', margin: 30 },
  closeBtn: { position: 'absolute', top: 20, left: 0 },
  captureBtn: { alignSelf: 'flex-end', alignItems: 'center', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center' },
  captureInner: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#fff' },
  reportContent: { flex: 1, padding: 20 },
  imagePreviewContainer: { width: '100%', height: 300, borderRadius: 20, overflow: 'hidden', marginBottom: 20, backgroundColor: '#000' },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  reportMeta: { backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  metaLabel: { fontSize: 13, color: '#999', fontWeight: '600' },
  metaValue: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  textArea: { backgroundColor: COLORS.gray, borderRadius: 10, padding: 15, marginTop: 10, fontSize: 14, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#DDD' },
  backBtn: { padding: 5 },

  // Novedades Slots y Diseño Reporte
  photoSlotsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  photoSlot: { width: '31%', aspectRatio: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  slotImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  slotPlaceholder: { alignItems: 'center', gap: 4 },
  slotText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  slotBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: COLORS.success, borderRadius: 10, padding: 2 },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#FED7AA' },
  inputCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  progressInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  progresoInput: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, fontSize: 20, fontWeight: '800', color: COLORS.primary, width: 80, textAlign: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  percentSymbol: { fontSize: 20, fontWeight: '800', color: '#64748B' },
  helperText: { fontSize: 12, color: '#64748B', marginTop: 8, fontStyle: 'italic' },
  reportHeader: { marginBottom: 20 },
  actNameReport: { fontSize: 18, fontWeight: '800', color: COLORS.primary, lineHeight: 24 },
  houseSubtitleReport: { fontSize: 14, color: COLORS.secondary, fontWeight: '700', marginTop: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
  obsInput: { backgroundColor: '#fff', borderRadius: 12, padding: 15, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 100, textAlignVertical: 'top' },
  footerReport: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE' },
  mainBtn: { backgroundColor: COLORS.primary, height: 55, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Estilos Adicionales Slots
  slotDelete: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(239, 68, 68, 0.9)', borderRadius: 12, width: 22, height: 22, justifyContent: 'center', alignItems: 'center' },
  slotProgInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 4, height: 28, justifyContent: 'center' },
  slotProgInput: { fontSize: 13, fontWeight: '800', color: COLORS.primary, width: 28, textAlign: 'center', padding: 0 },
  thumbnailWrapper: { marginRight: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#DDD' },
  thumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  // Modal Viewer
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
  modalFullImage: { width: '100%', height: '80%' },
  gpsSuccessBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#F0FDF4', borderRadius: 10, borderLeftWidth: 4, borderLeftColor: COLORS.success, marginBottom: 15 },
  gpsPendingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#FFFBEB', borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#F59E0B', marginBottom: 15 },
  gpsText: { fontSize: 13, fontWeight: '700' }
});
