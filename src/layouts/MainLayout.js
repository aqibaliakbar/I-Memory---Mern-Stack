import Navbar from "../components/Navbar";

export const MainLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);