const axios = require('axios');

const API_URL = process.env.VITE_BUSINESS_API_URL || 'http://localhost:3000';

async function audit() {
  console.log('🚀 Starting API Audit...');
  
  try {
    console.log('--- Testing Registration ---');
    const regId = Math.random().toString(36).substring(7);
    const regRes = await axios.post(API_URL + '/register', {
      client_name: 'AuditCorp_' + regId,
      owner_email: 'audit_' + regId + '@example.com',
      username: 'user_' + regId,
      password: 'Pass123!',
      nombreCliente: 'AuditCorp_' + regId
    });
    console.log('Registration Response:', JSON.stringify(regRes.data, null, 2));
    
    let tenantId = regRes.data.data ? regRes.data.data.cliente.id : regRes.data.clienteId;
    
    if (!tenantId) throw new Error('No tenantId returned from registration');
    // ENSURE tenantId is a string to avoid validation errors
    tenantId = String(tenantId);
    console.log('✅ Registered. TenantID (as string): ' + tenantId);

    console.log('--- Testing stock.add ---');
    const stockAddRes = await axios.post(API_URL + '/execute', {
      cmd: 'stock.add',
      params: {
        code: 'AUDIT001',
        name: 'Audit Product',
        price: 100,
        quantity: 10,
        category: 'Test',
        is_weight: false
      },
      tenantId: tenantId
    });
    console.log('stock.add Response:', JSON.stringify(stockAddRes.data, null, 2));

    console.log('--- Testing products.list ---');
    const stockListRes = await axios.post(API_URL + '/execute', {
      cmd: 'products.list',
      params: {},
      tenantId: tenantId
    });
    console.log('products.list Response:', JSON.stringify(stockListRes.data, null, 2));

    const products = stockListRes.data.data ? stockListRes.data.data.results : [];
    const found = products.find(p => p.code === 'AUDIT001');
    if (found) {
      console.log('✅ SUCCESS: Product persisted and found in list!');
    } else {
      console.log('❌ FAILURE: Product not found in list despite success response.');
    }

    console.log('--- Testing system.users.create ---');
    const userCreateRes = await axios.post(API_URL + '/execute', {
      cmd: 'system.users.create',
      params: {
        username: 'emp_' + regId,
        password: 'EmpPass123!',
        role: 'employee'
      },
      tenantId: tenantId
    });
    console.log('system.users.create Response:', JSON.stringify(userCreateRes.data, null, 2));

    console.log('--- Testing system.users.list ---');
    const userListRes = await axios.post(API_URL + '/execute', {
      cmd: 'system.users.list',
      params: {},
      tenantId: tenantId
    });
    console.log('system.users.list Response:', JSON.stringify(userListRes.data, null, 2));

  } catch (error) {
    console.log('❌ Audit Failed:');
    if (error.response) {
      console.log('Status: ' + error.response.status);
      console.log('Data: ' + JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error);
    }
  }
}

audit();
