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

function App() {
  return (
    <div className="App" data-testid="app-root">
      <div className="noise-overlay" aria-hidden="true" />
      <BrowserRouter>
        <SmoothScroll>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/products" element={<Products />} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/stack" element={<TechStack />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
          <Footer />
          <Toaster position="bottom-right" theme="dark" richColors />
        </SmoothScroll>
      </BrowserRouter>
    </div>
  );
}

export default App;
