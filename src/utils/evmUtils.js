/**
 * EVM Utilities for NasaKiwe Dashboard
 * Includes SPI, CPI, and PPC calculations
 */

export const calculateEVM = (ev, pv, ac, completedTasks, totalTasks) => {
    const spi = (!pv || pv === 0) ? 1.0 : parseFloat((ev / pv).toFixed(2));
    const cpi = (!ac || ac === 0) ? 1.0 : parseFloat((ev / ac).toFixed(2));
    const ppc = (!totalTasks || totalTasks === 0) ? 100 : Math.round((completedTasks / totalTasks) * 100);
    
    return {
        ev,
        pv,
        ac,
        spi,
        cpi,
        ppc,
        status: (spi >= 1.0 && cpi >= 1.0) ? 'Saludable' : (spi >= 0.8 && cpi >= 0.8) ? 'Alerta' : 'Crítico',
        color: (spi >= 1.0 && cpi >= 1.0) ? '#10B981' : (spi >= 0.8 && cpi >= 0.8) ? '#F59E0B' : '#DC2626'
    };
};

export const getEVMSummary = (metrics) => {
    if (!metrics) return { label: 'Sin Datos', color: '#6B7280' };
    return {
        label: metrics.status,
        color: metrics.color,
        description: `SPI: ${metrics.spi} / CPI: ${metrics.cpi}`
    };
};

export const evmUtils = {
  calculateSPI: (EV, PV) => {
    if (!PV || PV === 0) return 1.0;
    return parseFloat((EV / PV).toFixed(2));
  },

  calculateCPI: (EV, AC) => {
    if (!AC || AC === 0) return 1.0;
    return parseFloat((EV / AC).toFixed(2));
  },

  calculatePPC: (completedTasks, plannedTasks) => {
    if (!plannedTasks || plannedTasks === 0) return 100;
    return Math.round((completedTasks / plannedTasks) * 100);
  },

  getMetricColor: (value, type = 'index') => {
    if (type === 'index') {
      if (value >= 1.0) return '#10B981';
      if (value >= 0.8) return '#F59E0B';
      return '#DC2626';
    }
    if (type === 'percentage') {
      if (value >= 80) return '#10B981';
      if (value >= 60) return '#F59E0B';
      return '#DC2626';
    }
    return '#6B7280';
  },

  getMetricStatus: (value, type = 'index') => {
    if (type === 'index') {
      if (value >= 1.0) return 'Saludable';
      if (value >= 0.8) return 'En Alerta';
      return 'Crítico';
    }
    return value >= 80 ? 'Confiable' : 'Débil';
  }
};
