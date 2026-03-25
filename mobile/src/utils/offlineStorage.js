import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = '@nasakiwe_offline_queue';

export const offlineStorage = {
    // Guardar una actividad en la cola local
    saveActivity: async (activity) => {
        try {
            const currentQueue = await offlineStorage.getQueue();
            const updatedQueue = [...currentQueue, { ...activity, timestamp: new Date().toISOString() }];
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
            return true;
        } catch (error) {
            console.error('Error al guardar en cola offline:', error);
            return false;
        }
    },

    // Obtener la cola de pendientes
    getQueue: async () => {
        try {
            const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
            return queue ? JSON.parse(queue) : [];
        } catch (error) {
            console.error('Error al leer cola offline:', error);
            return [];
        }
    },

    // Limpiar la cola después de sincronizar
    clearQueue: async () => {
        try {
            await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
        } catch (error) {
            console.error('Error al limpiar cola offline:', error);
        }
    },

    // NUEVO: Guardar actividades completadas por vivienda (para persistencia visual)
    saveCompletedActivities: async (houseId, activities) => {
        try {
            const key = `@nasakiwe_completed_${houseId}`;
            await AsyncStorage.setItem(key, JSON.stringify(activities));
        } catch (error) {
            console.error('Error al guardar actividades completadas:', error);
        }
    },

    // NUEVO: Obtener actividades completadas por vivienda
    getCompletedActivities: async (houseId) => {
        try {
            const key = `@nasakiwe_completed_${houseId}`;
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al obtener actividades completadas:', error);
            return [];
        }
    },

    // NUEVO: Guardar el último reporte completo de una actividad (para carga instantánea)
    saveLastReport: async (activityId, houseId, data) => {
        try {
            const key = `@nasakiwe_last_report_${houseId}_${activityId}`;
            await AsyncStorage.setItem(key, JSON.stringify({
                ...data,
                localTimestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error al guardar último reporte local:', error);
        }
    },

    // NUEVO: Obtener el último reporte guardado localmente
    getLastReport: async (activityId, houseId) => {
        try {
            const key = `@nasakiwe_last_report_${houseId}_${activityId}`;
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al obtener último reporte local:', error);
            return null;
        }
    },

    // NUEVO: Eliminar el último reporte de una actividad (tras envío exitoso)
    clearLastReport: async (activityId, houseId) => {
        try {
            const key = `@nasakiwe_last_report_${houseId}_${activityId}`;
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Error al limpiar último reporte local:', error);
        }
    },

    // NUEVO: Limpieza total del dispositivo
    resetAllData: async () => {
        try {
            await AsyncStorage.clear();
            console.log('✅ Almacenamiento local limpiado exitosamente');
            return true;
        } catch (error) {
            console.error('Error al limpiar almacenamiento local:', error);
            return false;
        }
    }
};
