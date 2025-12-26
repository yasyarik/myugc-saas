"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Image as ImageIcon,
    Video,
    CreditCard,
    Sparkles,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}

const SidebarItem = ({ href, icon, label, active }: SidebarItemProps) => (
    <Link
        href={href}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            active
                ? "bg-indigo-600/10 text-indigo-400 font-medium"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        )}
    >
        <div className={cn(
            "p-1.5 rounded-lg transition-colors",
            active ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
        )}>
            {icon}
        </div>
        <span className="flex-1">{label}</span>
        {active && <ChevronRight className="w-4 h-4 opacity-50" />}
    </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { href: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
        { href: "/generate", icon: <Sparkles size={18} />, label: "AI Generator" },
        { href: "/gallery", icon: <ImageIcon size={18} />, label: "Gallery" },
        { href: "/videos", icon: <Video size={18} />, label: "Videos" },
        { href: "/credits", icon: <CreditCard size={18} />, label: "Credits" },
    ];

    return (
        <div className="flex h-screen bg-transparent text-foreground overflow-hidden relative">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/10 flex flex-col shadow-2xl relative z-10" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(60px) saturate(180%)',
                WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            }}>
                <div className="p-6">
                    <Link href="/" className="flex flex-col items-center gap-2 group">
                        <img
                            src="/logo.png"
                            alt="My UGC Studio"
                            className="h-16 w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                    </Link>
                    <div className="mt-4 px-4 py-2 text-center rounded-xl" style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1.5px solid rgba(16, 185, 129, 0.25)',
                        backdropFilter: 'blur(20px)',
                    }}>
                        <p className="text-xs text-emerald-400 font-medium">Credits Available</p>
                        <p className="text-lg font-bold text-white">10</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-4">
                    <div className="px-4 mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Main Menu</p>
                    </div>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={pathname === item.href}
                        />
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="mb-4">
                        <ThemeToggle className="w-full justify-center" />
                    </div>

                    {/* Auth Section - Only show when signed out */}
                    <div className="flex flex-col gap-3 mb-4">
                        <SignedOut>
                            <Link
                                href="/sign-in"
                                className="block text-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-900/20"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="block text-center py-2.5 px-4 text-white rounded-xl text-sm font-semibold transition-colors"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    backdropFilter: 'blur(20px)',
                                }}
                            >
                                Create Account
                            </Link>
                        </SignedOut>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-white/5 transition-all" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(30px)',
                    }}>
                        <UserButton afterSignOutUrl="/" />
                        <Link href="/user-profile" className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
                            <p className="text-sm font-medium text-slate-200 truncate px-1">My Account</p>
                            <p className="text-xs text-slate-500 truncate px-1">Manage profile</p>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-transparent relative z-10">
                {children}
            </main>
        </div>
    );
}
