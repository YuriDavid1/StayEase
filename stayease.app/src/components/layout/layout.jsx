import { Outlet } from "react-router-dom";

import Header from "./header";
import Footer from "./footer";

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;