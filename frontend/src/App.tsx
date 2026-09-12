import { useState, useEffect } from "react";
import { Box, createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import HomePage from "./pages/home";
import AuthPage from "./pages/auth";
import RolesPage from "./pages/roles";

export type AppView = "home" | "auth" | "roles";

// Clean, modern MUI theme with glassmorphic color palette
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1d4ed8",
    },
    background: {
      default: "transparent",
      paper: "rgba(255, 255, 255, 0.75)",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
  },
  shape: {
    borderRadius: 12,
  },
});

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const hash = window.location.hash.replace("#/", "");
    if (hash === "auth" || hash === "roles") return hash;
    return "home";
  });

  // Sync hash routing with window history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "");
      if (hash === "auth" || hash === "roles" || hash === "home") {
        setCurrentView(hash as AppView);
      } else {
        setCurrentView("home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.location.hash = `#/${view === "home" ? "" : view}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        {/* Subtle Decorative Ambient Background Blobs for Glassmorphism Depth */}
        <Box
          sx={{
            position: "fixed",
            top: "-15%",
            right: "-10%",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(147, 197, 253, 0.45) 0%, rgba(219, 234, 254, 0.1) 70%)",
            filter: "blur(60px)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "fixed",
            bottom: "-15%",
            left: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(199, 210, 254, 0.4) 0%, rgba(243, 232, 255, 0.1) 70%)",
            filter: "blur(60px)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />

        {/* Minimal Glass Navigation */}
        <Navbar currentView={currentView} onNavigate={handleNavigate} />

        {/* Page Content */}
        <Box component="main" sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          {currentView === "home" && <HomePage onNavigate={handleNavigate} />}
          {currentView === "auth" && (
            <AuthPage
              onSuccess={() => handleNavigate("home")}
              onNavigateHome={() => handleNavigate("home")}
            />
          )}
          {currentView === "roles" && <RolesPage />}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
