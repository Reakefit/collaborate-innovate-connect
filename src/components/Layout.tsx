import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-muted/30 to-muted/10">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout; 