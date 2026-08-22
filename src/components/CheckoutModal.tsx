'use client';
import { useCart } from '../lib/CartContext';

export const CheckoutModal = ({ onClose, phoneNumber }: { onClose: () => void, phoneNumber: string }) => {
  const { items, paymentMethod, setPaymentMethod, shippingOption, setShippingOption } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const generateWhatsAppLink = () => {
    const phone = phoneNumber.replace(/[^0-9]/g, '');
    const ticket = items.map(i => `* ${i.name} (x${i.qty}) - $${(i.price * i.qty).toFixed(2)}`).join('%0a');
    const message = `*Nuevo Pedido*%0a%0a${ticket}%0a%0aTotal: $${total.toFixed(2)}%0aPago: ${paymentMethod || 'No especificado'}%0aEnvío: ${shippingOption === 'envio' ? 'Sí' : 'No'}`;
    return `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '400px' }}>
        <h2>Finalizar Compra</h2>
        <div style={{ margin: '1rem 0' }}>
          <label>Método de Pago:</label>
          <select onChange={(e) => setPaymentMethod(e.target.value as 'efectivo' | 'transferencia')}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>¿Requiere Envío?</label>
          <select onChange={(e) => setShippingOption(e.target.value as 'retiro' | 'envio')}>
            <option value="retiro">Retiro en local</option>
            <option value="envio">Envío</option>
          </select>
        </div>
        <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '1rem', backgroundColor: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>
          Enviar por WhatsApp
        </a>
        <button onClick={onClose} style={{ width: '100%', marginTop: '1rem' }}>Cerrar</button>
      </div>
    </div>
  );
};
