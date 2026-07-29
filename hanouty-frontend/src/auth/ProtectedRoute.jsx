import { Navigate } from "react-router-dom";

function getTokenPayload() {
  const token = localStorage.getItem("token"); // adapte selon authServices.saveToken
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, requiredRole }) {
  const payload = getTokenPayload();

  // Pas de token → login
  if (!payload) return <Navigate to="/login" replace />;

  // Token expiré
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // Mauvais rôle → redirige vers son propre dash
  if (requiredRole && payload.role !== requiredRole) {
    return <Navigate to={payload.role === "admin" ? "/admin/dash" : "/user/dash"} replace />;
  }

  return children;
}