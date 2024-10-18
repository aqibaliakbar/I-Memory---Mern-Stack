import Navbar from "../components/Navbar";

export const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <div className="scrollbar-hide ">{children}</div>
  </>
);