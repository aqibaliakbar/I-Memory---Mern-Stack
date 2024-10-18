import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../SessionManager/auth";

export const ProtectedRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" />;
};