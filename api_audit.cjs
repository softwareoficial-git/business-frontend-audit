const axios = require('axios');

const API_URL = 'https://business-logic-engine-node-production.up.railway.app';

async function runFullAudit() {
  const runId = Date.now();
  const companyName = `Audit_Real_Node_${runId}`;
  const username = `admin_${runId}`;
  const password = 'Password123!';
  const prodCode = `PROD_${runId}`;

  console.log(`🚀 INICIANDO AUDITORÍA E2E REAL - ID: ${runId}`);
  console.log(`URL: ${API_URL}`);
  console.log('--------------------------------------------------');

  try {
    // 1. REGISTRO
    console.log('1. Registrando Empresa y Usuario...');
    const regRes = await axios.post(`${API_URL}/register`, {
      client_name: companyName,
      owner_email: `audit_${runId}@example.com`,
      username: username,
      password: password,
      nombreCliente: companyName
    });

    const token = regRes.data.data?.user?.token || regRes.data.user?.token;
    const tenantId = regRes.data.data?.cliente?.id || regRes.data.clienteId;

    if (!token) throw new Error('No se recibió token de sesión');
    console.log(`✅ Registrado. Token: ${token.substring(0, 8)}... TenantID: ${tenantId}`);

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 2. CARGA DE STOCK
    console.log(`
2. Cargando Stock Real...`);
    await axios.post(`${API_URL}/execute`, {
      cmd: 'stock.add',
      params: {
        code: prodCode,
        name: `Producto Real ${runId}`,
        price: 100,
        qty: 50
      }
    }, authHeader);
    console.log(`✅ Producto ${prodCode} agregado.`);

    // 3. CREACIÓN DE STAFF
    console.log(`
3. Creando Empleado Real...`);
    await axios.post(`${API_URL}/execute`, {
      cmd: 'staff.create',
      params: {
        username: `emp_${runId}`,
        password: 'EmployeePass123!',
        nombre: `Empleado ${runId}`,
        role: 'EMPLEADO'
      }
    }, authHeader);
    console.log(`✅ Empleado creado.`);

    // 4. PROCESAMIENTO DE VENTA
    console.log(`
4. Procesando Venta Real...`);
    await axios.post(`${API_URL}/execute`, {
      cmd: 'sales.create',
      params: {
        customer: `Cliente Test ${runId}`,
        items: [{ code: prodCode, qty: 1 }],
        client_request_id: `REQ_${runId}`
      }
    }, authHeader);
    console.log(`✅ Venta procesada.`);

    // 5. VERIFICACIÓN FINAL (LA PRUEBA DE FUEGO)
    console.log(`
==================================================`);
    console.log('🔍 VERIFICACIÓN DE PERSISTENCIA EN BASE DE DATOS');
    console.log('==================================================');

    const stockList = await axios.post(`${API_URL}/execute`, { cmd: 'stock.list', params: {} }, authHeader);
    const hasStock = stockList.data.data?.some(p => p.code === prodCode) || stockList.data.some(p => p.code === prodCode);
    console.log(`Stock ${prodCode} existe: ${hasStock ? '✅ SÍ' : '❌ NO'}`);

    const staffList = await axios.post(`${API_URL}/execute`, { cmd: 'staff.list', params: {} }, authHeader);
    const hasStaff = staffList.data.data?.usuarios?.some(u => u.username === `emp_${runId}`) || staffList.data.some(u => u.username === `emp_${runId}`);
    console.log(`Empleado emp_${runId} existe: ${hasStaff ? '✅ SÍ' : '❌ NO'}`);

    const salesHist = await axios.post(`${API_URL}/execute`, { cmd: 'sales.history', params: {} }, authHeader);
    const hasSale = salesHist.data.data?.length > 0 || salesHist.data.length > 0;
    console.log(`Historial de ventas contiene datos: ${hasSale ? '✅ SÍ' : '❌ NO'}`);

    if (hasStock && hasStaff && hasSale) {
      console.log(`
🌟 AUDITORÍA COMPLETADA CON ÉXITO: DATOS REALES PERSISTIDOS 🌟`);
      process.exit(0);
    } else {
      console.log(`
❌ AUDITORÍA FALLIDA: Algunos datos no persistieron.`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`
🚨 ERROR CRÍTICO EN AUDITORÍA:`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runFullAudit();
