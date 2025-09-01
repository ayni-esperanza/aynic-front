import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PurchaseOrderList } from './pages/PurchaseOrderList';
import { PurchaseOrderForm } from './pages/PurchaseOrderForm';
import { EditPurchaseOrderForm } from './pages/EditPurchaseOrderForm';
import { PurchaseOrderDetail } from './pages/PurchaseOrderDetail';

export const PurchaseOrdersModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<PurchaseOrderList />} />
      <Route path="nuevo" element={<PurchaseOrderForm />} />
      <Route path="editar/:id" element={<EditPurchaseOrderForm />} />
      <Route path="detalle/:id" element={<PurchaseOrderDetail />} />
    </Routes>
  );
};

// Exportar componentes
export { PurchaseOrderList, PurchaseOrderForm, EditPurchaseOrderForm, PurchaseOrderDetail } from './pages';

// Exportar hooks
export { usePurchaseOrders } from './hooks';

// Exportar servicios
export { purchaseOrderService } from './services';

// Exportar tipos
export type {
  PurchaseOrder,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  PurchaseOrderFilters,
  PurchaseOrderStats,
  PurchaseOrderStatus,
  PurchaseOrderType,
  User,
} from './types';

// Default export para lazy loading
export default PurchaseOrdersModule;
