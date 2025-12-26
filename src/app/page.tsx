"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { Sparkles, Image as ImageIcon, Video } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/generate" className="p-6 bg-[#0d0d10] rounded-2xl border border-slate-800 hover:border-indigo-500 transition-all group block">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Generator</h3>
            <p className="text-slate-400 text-sm">Create stunning product photos with AI models and backgrounds.</p>
          </Link>

          <Link href="/gallery" className="p-6 bg-[#0d0d10] rounded-2xl border border-slate-800 hover:border-indigo-500 transition-all group block">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gallery</h3>
            <p className="text-slate-400 text-sm">View, download, and manage your generated masterpieces.</p>
          </Link>

          <Link href="/videos" className="p-6 bg-[#0d0d10] rounded-2xl border border-slate-800 hover:border-indigo-500 transition-all group block">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Videos</h3>
            <p className="text-slate-400 text-sm">Transform your photos into engaging video content.</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
