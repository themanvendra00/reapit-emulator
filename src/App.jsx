import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import VendorsListPage from './pages/vendors/VendorsListPage.jsx';
import PropertiesListPage from './pages/properties/PropertiesListPage.jsx';
import PropertyDetailPage from './pages/properties/PropertyDetailPage.jsx';
import NegotiatorsListPage from './pages/negotiators/NegotiatorsListPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/vendors" replace />} />
        <Route path="/vendors" element={<VendorsListPage />} />
        <Route path="/properties" element={<PropertiesListPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/negotiators" element={<NegotiatorsListPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
