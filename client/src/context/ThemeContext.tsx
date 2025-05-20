import { createContext, useState, useEffect, ReactNode } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {}
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  
  useEffect(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem("netwin_theme") as "light" | "dark" | null;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // Default to dark theme for gaming experience
      setTheme("dark");
      localStorage.setItem("netwin_theme", "dark");
    }
  }, []);
  
  useEffect(() => {
    // Apply theme class to document element
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Store theme preference
    localStorage.setItem("netwin_theme", theme);
  }, [theme]);
  
  const updateTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
