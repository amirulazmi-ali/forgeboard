import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ user, allowedRoles, children }) {
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;
