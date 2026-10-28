import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { QRModal } from './components/QRModal';

import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { ProductDetail } from './pages/ProductDetail';
import { ReceiveStock } from './pages/ReceiveStock';
import { SalesList } from './pages/SalesList';
import { NewSale } from './pages/NewSale';
import { SaleDetail } from './pages/SaleDetail';
import { BatchList } from './pages/BatchList';
import { BatchDetail } from './pages/BatchDetail';
import { Analytics } from './pages/Analytics';
import { ProductTraceability } from './pages/ProductTraceability';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F6F2EA] text-[#1B1713] font-sans">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area - independently scrollable */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global QR Scanner & Generator Modal */}
      <QRModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Core Authenticated App Routes with Main Layout */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/inventory"
            element={
              <MainLayout>
                <Inventory />
              </MainLayout>
            }
          />
          <Route
            path="/inventory/:productId"
            element={
              <MainLayout>
                <ProductDetail />
              </MainLayout>
            }
          />
          <Route
            path="/receive-stock"
            element={
              <MainLayout>
                <ReceiveStock />
              </MainLayout>
            }
          />
          <Route
            path="/sales"
            element={
              <MainLayout>
                <SalesList />
              </MainLayout>
            }
          />
          <Route
            path="/sales/new"
            element={
              <MainLayout>
                <NewSale />
              </MainLayout>
            }
          />
          <Route
            path="/sales/:saleId"
            element={
              <MainLayout>
                <SaleDetail />
              </MainLayout>
            }
          />
          <Route
            path="/batches"
            element={
              <MainLayout>
                <BatchList />
              </MainLayout>
            }
          />
          <Route
            path="/batches/:batchId"
            element={
              <MainLayout>
                <BatchDetail />
              </MainLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <MainLayout>
                <Analytics />
              </MainLayout>
            }
          />
          <Route
            path="/product-history"
            element={
              <MainLayout>
                <ProductTraceability />
              </MainLayout>
            }
          />
          <Route
            path="/product-history/:productId"
            element={
              <MainLayout>
                <ProductTraceability />
              </MainLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <MainLayout>
                <Reports />
              </MainLayout>
            }
          />
          <Route
            path="/notifications"
            element={
              <MainLayout>
                <Notifications />
              </MainLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <MainLayout>
                <Settings />
              </MainLayout>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
