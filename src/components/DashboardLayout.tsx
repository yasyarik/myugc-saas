"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Image as ImageIcon,
    Video,
    UserCircle,
    CreditCard,
    Settings,
    Sparkles,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

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
        <div className="flex h-screen bg-[#0a0a0c] text-slate-200 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 border-r border-slate-800/50 bg-[#0d0d10] flex flex-col">
                <div className="p-6">
                    <Link href="/" className="flex flex-col items-center gap-2 group">
                        <img
                            src="/logo.png"
                            alt="My UGC Studio"
                            className="h-16 w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                    </Link>
                    <div className="mt-4 bg-emerald-600/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-center">
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
                    <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-6 mb-6">
                        <p className="text-xs font-medium text-indigo-400 mb-1">Current Plan</p>
                        <p className="text-sm font-bold text-white mb-3">Free Explorer</p>
                        <div className="w-full bg-slate-800/50 h-1.5 rounded-full mb-4 overflow-hidden">
                            <div className="bg-indigo-500 h-full w-1/3 rounded-full" />
                        </div>
                        <Link
                            href="/credits"
                            className="block text-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20"
                        >
                            Upgrade Now
                        </Link>
                    </div>

                    {/* Auth Section */}
                    <div className="flex flex-col gap-3 mb-4">
                        <Link
                            href="/sign-in"
                            className="block text-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/sign-up"
                            className="block text-center py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                            Create Account
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                        <UserButton afterSignOutUrl="/" />
                        <Link href="/user-profile" className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
                            <p className="text-sm font-medium text-white truncate px-1">My Account</p>
                            <p className="text-xs text-slate-500 truncate px-1">Manage profile</p>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12]">
                {children}
            </main>
        </div>
    );
}
