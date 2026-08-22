import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Products from "@/pages/Products";
import Industries from "@/pages/Industries";
import TechStack from "@/pages/TechStack";
import Contact from "@/pages/Contact";
import Sitemap from "@/pages/Sitemap";
import Legal from "@/pages/Legal";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminFooter from "@/pages/admin/AdminFooter";

const SmoothScroll = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return children;
};

const Shell = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/products" element={<Products />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/stack" element={<TechStack />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/privacy-policy" element={<Legal kind="privacy-policy" />} />
        <Route path="/terms-conditions" element={<Legal kind="terms-conditions" />} />
        <Route path="/terms-of-service" element={<Legal kind="terms-of-service" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminFooter />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
};

function App() {
  return (
    <div className="App" data-testid="app-root">
      <div className="noise-overlay" aria-hidden="true" />
      <BrowserRouter>
        <SmoothScroll>
          <Shell />
          <Toaster position="bottom-right" theme="dark" richColors />
        </SmoothScroll>
      </BrowserRouter>
    </div>
  );
}

export default App;
