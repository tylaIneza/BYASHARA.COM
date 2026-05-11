"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1A1A1A",
            color: "#fff",
            border: "1px solid rgba(255,107,0,0.3)",
            borderRadius: "12px",
          },
        }}
      />
    </ThemeProvider>
  );
}
