/**
 * Validasi input untuk semua endpoint
 */

function validateCountry(country) {
  if (!country || typeof country !== 'string') {
    return 'Parameter negara harus diisi';
  }
  if (country.length > 10) {
    return 'Kode negara tidak valid';
  }
  return null;
}

function validateService(service) {
  if (!service || typeof service !== 'string') {
    return 'Parameter layanan harus diisi';
  }
  return null;
}

function validateOperator(operator) {
  if (!operator || typeof operator !== 'string') {
    return 'Parameter operator harus diisi';
  }
  return null;
}

function validateOrderId(orderId) {
  if (!orderId) {
    return 'Parameter order_id harus diisi';
  }
  const id = String(orderId);
  if (!/^\d+$/.test(id)) {
    return 'Format order_id tidak valid';
  }
  return null;
}

function validateOrder(country, service, operator) {
  const errors = [];
  const countryErr = validateCountry(country);
  const serviceErr = validateService(service);
  const operatorErr = validateOperator(operator);

  if (countryErr) errors.push(countryErr);
  if (serviceErr) errors.push(serviceErr);
  if (operatorErr) errors.push(operatorErr);

  return errors.length > 0 ? errors.join(', ') : null;
}

module.exports = {
  validateCountry,
  validateService,
  validateOperator,
  validateOrderId,
  validateOrder,
};
