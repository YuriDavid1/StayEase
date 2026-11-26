import { Navigate, Outlet, useLocation } from "react-router-dom";

import { homePathFor } from "../../lib/authSession";
import { useUser } from "../../lib/useUser";

// Only renders the nested routes for a logged user with one of the given roles.
// The API enforces the same rules; this only avoids showing screens the user cannot use.
function ProtectedRoute({ roles }) {
  const { isAuthenticated, role } = useUser();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to={homePathFor(role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
