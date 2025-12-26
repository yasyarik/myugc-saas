"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { setTheme, theme } = useTheme();

    return (
        <div className={cn("flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm", className)}>
            <button
                onClick={() => setTheme("light")}
                className={cn(
                    "p-1.5 rounded-md transition-all",
                    theme === "light"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                )}
                title="Light Mode"
            >
                <Sun size={14} />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={cn(
                    "p-1.5 rounded-md transition-all",
                    theme === "system"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                )}
                title="System Mode"
            >
                <Monitor size={14} />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={cn(
                    "p-1.5 rounded-md transition-all",
                    theme === "dark"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                )}
                title="Dark Mode"
            >
                <Moon size={14} />
            </button>
        </div>
    );
}
