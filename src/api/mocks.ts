export const MOCK_DATA = {
  'products.list': {
    data: {
      results: [
        { code: 'P001', name: 'Coca Cola 500ml', price: 1.50, quantity: 100, category: 'Bebidas' },
        { code: 'P002', name: 'Papas Fritas Lays', price: 2.00, quantity: 3, category: 'Snacks' },
        { code: 'P003', name: 'Agua Mineral 1L', price: 1.00, quantity: 50, category: 'Bebidas' },
        { code: 'P004', name: 'Chocolate Milka', price: 3.50, quantity: 12, category: 'Dulces' },
      ]
    }
  },
  'staff.report': {
    data: {
      total_revenue: 1250.50,
      total_sales: 450,
    }
  },
  'system.users.list': {
    data: {
      results: [
        { id: 1, username: 'admin_main', role_id: 1 },
        { id: 2, username: 'staff_juan', role_id: 2 },
        { id: 3, username: 'staff_maria', role_id: 2 },
      ]
    }
  },
  'stock.add': { success: true, message: 'Producto agregado (MOCK)' },
  'sales.cobrar': { success: true, message: 'Venta procesada (MOCK)' },
  'system.users.create': { success: true, message: 'Usuario creado (MOCK)' },
};
