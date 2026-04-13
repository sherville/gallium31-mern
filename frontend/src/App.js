import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import ProtectedRoute from "./components/ProtectedRoute";
import ModelsPage from "./pages/ModelsPage";
import DynamicCrudPage from "./pages/DynamicCrudPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dynamic"
          element={
            <ProtectedRoute>
              <ModelsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dynamic/:modelName"
          element={
            <ProtectedRoute>
              <DynamicCrudPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}