"use client";

type Theme = "light" | "dark";

const ThemeToggle = () => {
  const toggleTheme = () => {
    const currentTheme: Theme =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme: Theme = currentTheme === "light" ? "dark" : "light";
    const themeColor = nextTheme === "dark" ? "#1a1c1e" : "#f7f7f5";
    const root = document.documentElement;

    root.dataset.theme = nextTheme;
    root.style.removeProperty("background-color");
    root.style.removeProperty("color-scheme");
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", themeColor));

    try {
      window.localStorage.setItem("theme", nextTheme);
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle fixed bottom-5 right-5 z-40 grid size-14 cursor-pointer place-items-center rounded-full sm:bottom-7 sm:right-7 sm:size-16"
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <svg
        viewBox="0 0 24 24"
        className="theme-icon-sun size-6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="theme-icon-moon size-6"
        aria-hidden="true"
      >
        <path
          d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

export default ThemeToggle;
