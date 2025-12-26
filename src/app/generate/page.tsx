"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Upload,
    Sparkles,
    ArrowRight,
    Image as ImageIcon,
    User as UserIcon,
    MapPin,
    CheckCircle2,
    AlertCircle,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GeneratePage() {
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState<"image" | "video">("image");
    const [productImage, setProductImage] = useState<string | null>(null);
    const [modelImage, setModelImage] = useState<string | null>(null);

    return (
        <DashboardLayout>
            <div className="p-8 max-w-5xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-white">Create New AI Content</h1>
                        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                            <button
                                onClick={() => setMode("image")}
                                className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", mode === "image" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300")}
                            >
                                Image Mode
                            </button>
                            <button
                                onClick={() => setMode("video")}
                                className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", mode === "video" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300")}
                            >
                                Video Mode
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-400">Step {step} of 3: {step === 1 ? "Upload Product" : step === 2 ? "Select Model" : "Configure Scene"}</p>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mt-6">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={cn(
                                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                                    s <= step ? "bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]" : "bg-slate-800"
                                )}
                            />
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Main Workspace */}
                    <div className="space-y-8">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                                        <ImageIcon className="text-indigo-400" size={18} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Upload your Product</h2>
                                </div>

                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group",
                                        productImage ? "border-indigo-500 bg-indigo-500/5" : "border-slate-800 hover:border-slate-700 bg-slate-900/30"
                                    )}
                                    onClick={() => {/* Mock upload */ }}
                                >
                                    {productImage ? (
                                        <img src={productImage} alt="Product" className="w-full h-64 object-contain rounded-2xl" />
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                <Upload className="text-slate-400" size={28} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-200 mb-2">Drop your product photo here</h3>
                                            <p className="text-slate-500 text-sm max-w-xs mb-8">
                                                Supports high-res JPG, PNG. Make sure it's a flat lay or clear product shot.
                                            </p>
                                            <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">
                                                Browse Files
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                                        <UserIcon className="text-indigo-400" size={18} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Choose a Model</h2>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div
                                            key={i}
                                            className="aspect-[3/4] bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500 cursor-pointer overflow-hidden transition-all group relative"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <p className="absolute bottom-3 left-3 text-[10px] font-bold text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">MODEL #{i}</p>
                                        </div>
                                    ))}
                                    <div className="aspect-[3/4] border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-slate-700 cursor-pointer transition-colors bg-slate-900/50">
                                        <Plus className="text-slate-600" size={20} />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Custom</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Guidelines Sidebar */}
                    <div className="space-y-6 pt-10">
                        <div className="bg-[#0d0d10] border border-slate-800/50 rounded-3xl p-8 sticky top-8">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <AlertCircle size={14} className="text-amber-500" />
                                Pro Tips
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "Use high-quality product images for best texture results.",
                                    "Clear lighting on models ensures photorealistic skin tones.",
                                    "Avoid cluttered backgrounds in your uploads.",
                                    "Each generation costs 1 credit."
                                ].map((tip, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                                        <span className="text-indigo-500 font-bold shrink-0">{i + 1}.</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-12 space-y-4">
                                <button
                                    onClick={() => setStep(s => Math.min(s + 1, 3))}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                                >
                                    {step === 3 ? "Generate Content" : "Continue to Next Step"}
                                    <ArrowRight size={18} />
                                </button>
                                {step > 1 && (
                                    <button
                                        onClick={() => setStep(s => Math.max(s - 1, 1))}
                                        className="w-full text-slate-500 hover:text-white font-bold text-sm py-2 transition-colors"
                                    >
                                        Go Back
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
