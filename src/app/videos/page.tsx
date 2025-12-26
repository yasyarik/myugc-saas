"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Video } from "lucide-react";

export default function VideosPage() {
    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Videos
                    </h1>
                    <p className="text-slate-400">
                        Your generated videos will appear here.
                    </p>
                </header>

                <div className="bg-[#0d0d10] border border-slate-800/50 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl border border-slate-800/50 flex items-center justify-center mb-6">
                        <Video className="text-slate-700" size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-300 mb-2">No videos yet</h3>
                    <p className="text-slate-500 max-w-xs">
                        Generate photos first, then convert them to videos.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
