"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Image as ImageIcon,
    Search,
    Filter,
    Download,
    Trash2,
    ExternalLink
} from "lucide-react";

export default function GalleryPage() {
    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Gallery</h1>
                        <p className="text-slate-400">Manage and download your generated assets.</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-indigo-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search generations..."
                                className="bg-[#0d0d10] border border-slate-800 focus:border-indigo-600 rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all w-64"
                            />
                        </div>
                        <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </header>

                {/* Empty State */}
                <div className="bg-[#0d0d10] border border-slate-800/50 rounded-[40px] p-24 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-slate-900 rounded-[32px] border border-slate-800/50 flex items-center justify-center mb-8">
                        <ImageIcon className="text-slate-700" size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-300 mb-3">Your gallery is empty</h2>
                    <p className="text-slate-500 max-w-md mb-10 text-lg">
                        Once you start generating content, your images and videos will appear here for download and management.
                    </p>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                        Generate First Asset
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
