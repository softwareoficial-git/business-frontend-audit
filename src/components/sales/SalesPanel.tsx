'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/api';
import SearchBar from './SearchBar';
import CartList from './CartList';
import BudgetBar from './BudgetBar';
import { useLoading } from '../loading/LoadingProvider';

export default function SalesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const { startLoading, stopLoading } = useLoading();

  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    startLoading();
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'sales.checkout', params: { items, customerId: 'CUST-1' } }),
      });
      const result = await response.json();
      if (result.success) {
        setItems([]);
        alert('Venta realizada con éxito');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error(error);
    }
    stopLoading();
  };

  const handleSearch = (term: string) => {
    // Aquí iría la lógica para buscar productos y añadirlos al carrito
    // Por ahora, simularemos añadir un producto para probar la UI
    if (term === 'PROD1') {
      setItems([{ code: 'PROD1', name: 'Producto Prueba', price: 50, qty: 1 }]);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 150px)', // Espacio para Dock
      padding: '1rem'
    }}>
      <SearchBar onSearch={handleSearch} />
      <CartList items={items} />
      <BudgetBar total={total} onCheckout={handleCheckout} />
    </div>
  );
}
