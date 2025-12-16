import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PurchaseOrderList } from './pages/PurchaseOrderList';
import { PurchaseOrderDetail } from './pages/PurchaseOrderDetail';

export const PurchaseOrdersModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<PurchaseOrderList />} />
      <Route path="detalle/:id" element={<PurchaseOrderDetail />} />
    </Routes>
  );
};

// Exportar componentes
export { PurchaseOrderList,PurchaseOrderDetail } from './pages';

// Exportar hooks
export { usePurchaseOrders } from './hooks';

// Exportar servicios
export { purchaseOrderService } from './services';

// Exportar tipos
export type {
  PurchaseOrder,
} from './types';

// Default export para lazy loading
export default PurchaseOrdersModule;
