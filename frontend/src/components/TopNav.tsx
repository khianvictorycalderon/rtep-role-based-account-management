import { useState } from "react";
import { TOPNAV_HEADER } from "../constants";
import { getTheme, setTheme } from "../utils/theme";

type Props = {
    onMenuClick: () => void;
};

export default function TopNav({ onMenuClick }: Props) {

    const [themeOpen, setThemeOpen] = useState(false);
    const [theme, setThemeState] = useState<"System" | "Light" | "Dark">(
        getTheme()
    );

    const THEMES = ["System", "Light", "Dark"] as const;

    const changeTheme = (t: "System" | "Light" | "Dark") => {
        setTheme(t);
        setThemeState(t);
        setThemeOpen(false);
    };

    return (
        <nav className="h-14 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">

            {/* Left: Hamburger */}
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                aria-label="Open sidebar"
            >
                <svg
                    className="w-6 h-6 text-neutral-900 dark:text-neutral-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>

            {/* Title */}
            <div className="ml-2 font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {TOPNAV_HEADER}
            </div>

            {/* Right side */}
            <div className="ml-auto relative">

                <button
                    onClick={() => setThemeOpen(v => !v)}
                    className="cursor-pointer px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200"
                >
                    <span className="hidden md:inline">Theme:</span> {theme} ▾
                </button>

                {themeOpen && (
                    <div className="absolute right-0 mt-2 w-36 rounded-lg border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden z-50">

                        {THEMES.map((t) => (
                            <button
                                key={t}
                                onClick={() => changeTheme(t)}
                                className="cursor-pointer w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                            >
                                {t}
                            </button>
                        ))}

                    </div>
                )}

            </div>

        </nav>
    );
}