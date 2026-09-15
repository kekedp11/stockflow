import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import StockManagement from "../pages/StockManagement";
import Sales from "../pages/Sales";
import Reports from "../pages/Reports";

function ProtectedRoute({ children }) {
const { isAuthenticated, loading } = useAuth();

if (loading) {
return <div>Loading...</div>;
}

if (!isAuthenticated) {
return <Navigate to="/login" replace />;
}

return children;
}

function AppRoutes() {
return (
<BrowserRouter>
<Routes>

    <Route
      path="/login"
      element={<Login />}
    />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/products"
      element={
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      }
    />

    <Route
      path="/stock"
      element={
        <ProtectedRoute>
          <StockManagement />
        </ProtectedRoute>
      }
    />

    <Route
      path="/sales"
      element={
        <ProtectedRoute>
          <Sales />
        </ProtectedRoute>
      }
    />

    <Route
      path="/reports"
      element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      }
    />

    <Route
      path="*"
      element={<Navigate to="/login" replace />}
    />

  </Routes>
</BrowserRouter>

);
}

export default AppRoutes;