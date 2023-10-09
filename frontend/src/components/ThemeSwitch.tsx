"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

type Theme = {
  [key: string]: string;
};

const ThemeSwitch = () => {
  const [theme, setTheme] = useState<Theme>({
    theme: window.localStorage.getItem("theme")! || "dark",
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      theme: prevTheme["theme"] === "dark" ? "light" : "dark",
    }));
  };

  useEffect(() => {
    const body = document.body;
    body.setAttribute("data-theme", theme.theme);
    window.localStorage.setItem("theme", theme.theme);
  }, [theme]);

  return (
    <button className="btn gap-2" onClick={toggleTheme}>
      {theme.theme === "dark" ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeSwitch;
