/**
 * EVM Utilities for NasaKiwe Dashboard
 * Includes SPI, CPI, and PPC calculations
 */

export const evmUtils = {
  /**
   * Calculate Schedule Performance Index (SPI)
   * SPI = EV / PV
   * @param {number} EV - Earned Value (Valor Ganado)
   * @param {number} PV - Planned Value (Valor Planificado)
   */
  calculateSPI: (EV, PV) => {
    if (!PV || PV === 0) return 1.0;
    return parseFloat((EV / PV).toFixed(2));
  },

  /**
   * Calculate Cost Performance Index (CPI)
   * CPI = EV / AC
   * @param {number} EV - Earned Value (Valor Ganado)
   * @param {number} AC - Actual Cost (Costo Real)
   */
  calculateCPI: (EV, AC) => {
    if (!AC || AC === 0) return 1.0;
    return parseFloat((EV / AC).toFixed(2));
  },

  /**
   * Calculate Percentage Plan Complete (PPC)
   * PPC = (Completed Tasks according to plan / Total planned tasks) * 100
   * @param {number} completedTasks - Number of tasks finished that were planned to be finished
   * @param {number} plannedTasks - Total number of tasks planned to be finished by today
   */
  calculatePPC: (completedTasks, plannedTasks) => {
    if (!plannedTasks || plannedTasks === 0) return 100;
    return Math.round((completedTasks / plannedTasks) * 100);
  },

  /**
   * Get dynamic color based on metric health
   */
  getMetricColor: (value, type = 'index') => {
    if (type === 'index') {
      if (value >= 1.0) return '#10B981'; // Success Green
      if (value >= 0.8) return '#F59E0B'; // Warning Amber
      return '#DC2626'; // Error Red
    }
    if (type === 'percentage') {
      if (value >= 80) return '#10B981';
      if (value >= 60) return '#F59E0B';
      return '#DC2626';
    }
    return '#6B7280';
  },

  /**
   * Get status label
   */
  getMetricStatus: (value, type = 'index') => {
    if (type === 'index') {
      if (value >= 1.0) return 'Saludable';
      if (value >= 0.8) return 'En Alerta';
      return 'Crítico';
    }
    return value >= 80 ? 'Confiable' : 'Débil';
  }
};
