* Servicio para HU-03 / RF03: Verificación de solvencia financiera
 */
export const validarSolvenciaFinanciera = (condicionPensiones, cuotasVencidas = 0) => {
  const tieneDeuda = 
    condicionPensiones?.toUpperCase() === 'CON DEUDA' || 
    Number(cuotasVencidas) > 0;

  if (tieneDeuda) {
    return {
      solvente: false,
      condicion: 'CON DEUDA',
      cuotasVencidas: Number(cuotasVencidas) || 1,
      bloqueado: true,
      mensaje: 'Postulación denegada: Registra cuotas de pensión vencidas pendientes con la institución.'
    };
  }

  return {
    solvente: true,
    condicion: 'AL DIA',
    cuotasVencidas: 0,
    bloqueado: false,
    mensaje: 'Estudiante solvente. Sin pagos pendientes.'
  };
};