import { useState, useEffect } from "react";

/**
 * Custom hook for managing responsive sidebar state
 * - Closed by default on mobile (< 1024px)
 * - Open by default on desktop (>= 1024px)
 * - Automatically adjusts on window resize
 */
export const useResponsiveSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024; // lg breakpoint in Tailwind
    }
    return false; // Default to closed for SSR
  });

  useEffect(() => {
    const handleResize = () => {
      // Auto-close sidebar on mobile, auto-open on desktop
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };
};
