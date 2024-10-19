import Navbar from "../components/Navbar";

export const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <div className="scrollbar-hide pt-12 ">{children}</div>
  </>
);