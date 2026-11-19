import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import MobileBottomNav from '../MobileBottomNav';
import Footer from './Footer';

const MainLayout = () => {
  const location = useLocation();

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.05
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    const observeElements = () => {
      const targets = document.querySelectorAll('.reveal');
      targets.forEach(target => {
        if (!target.classList.contains('revealed')) {
          observer.observe(target);
        }
      });
    };

    observeElements();

    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-onyx-bg transition-colors duration-500">
      
      <Navbar />
      <main className="relative z-0 pb-36 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      
      {/* Global Aesthetics Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
    </div>
  );
};

export default MainLayout;
