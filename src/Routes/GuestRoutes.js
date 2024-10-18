import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../SessionManager/auth";

export const GuestRoute = ({ children }) => {
  return !isLoggedIn() ? children : <Navigate to="/" />;
};