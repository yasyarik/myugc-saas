"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Check,
    Zap,
    Crown,
    CreditCard,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const PricingCard = ({
    name,
    price,
    credits,
    features,
    isPopular,
    buttonText,
    onSelect,
    loading
}: any) => (
    <div className={cn(
        "p-8 rounded-[40px] border flex flex-col relative transition-all duration-300 hover:scale-[1.02]",
        isPopular
            ? "bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-indigo-500/50 shadow-2xl shadow-indigo-600/10"
            : "bg-[#0d0d10] border-slate-800"
    )}>
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                Most Popular
            </div>
        )}

        <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">${price}</span>
                <span className="text-slate-500 text-sm font-medium">/month</span>
            </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50 mb-8">
            <div className="flex items-center gap-3">
                <Zap className="text-amber-400 fill-amber-400/20" size={20} />
                <span className="text-lg font-bold text-white">{credits} Credits</span>
            </div>
        </div>

        <ul className="space-y-4 flex-1 mb-10">
            {features.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    {f}
                </li>
            ))}
        </ul>

        <button
            onClick={onSelect}
            disabled={loading}
            className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                isPopular
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                    : "bg-slate-800 hover:bg-slate-700 text-white"
            )}
        >
            {loading ? "Processing..." : buttonText}
        </button>
    </div>
);

export default function CreditsPage() {
    const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

    const handleCheckout = async (planId: string) => {
        try {
            setLoadingPlan(planId);
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            });

            if (response.status === 401) {
                window.location.href = "/sign-in";
                return;
            }

            if (!response.ok) throw new Error("Checkout failed");

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <header className="text-center max-w-2xl mx-auto mb-20">
                    <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Scale your content creation</h1>
                    <p className="text-slate-400 text-lg">
                        Choose a plan that fits your business needs. Upgrade or downgrade anytime.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <PricingCard
                        name="Free"
                        price="0"
                        credits="10"
                        features={[
                            "10 credits per month",
                            "Basic generation",
                            "Watermarked images"
                        ]}
                        buttonText="Current Plan"
                    />
                    <PricingCard
                        name="Basic"
                        price="48"
                        credits="100"
                        features={[
                            "100 credits per month",
                            "No watermark",
                            "Commercial usage",
                            "7-day free trial"
                        ]}
                        buttonText="Get Basic"
                        onSelect={() => handleCheckout("basic")}
                        loading={loadingPlan === "basic"}
                    />
                    <PricingCard
                        name="Standard"
                        price="99"
                        credits="300"
                        isPopular
                        features={[
                            "300 credits per month",
                            "Priority generation",
                            "No watermark",
                            "Commercial usage",
                            "7-day free trial"
                        ]}
                        buttonText="Get Standard"
                        onSelect={() => handleCheckout("standard")}
                        loading={loadingPlan === "standard"}
                    />
                    <PricingCard
                        name="Pro"
                        price="199"
                        credits="1000"
                        features={[
                            "1000 credits per month",
                            "Highest priority",
                            "No watermark",
                            "Commercial usage",
                            "7-day free trial"
                        ]}
                        buttonText="Get Pro"
                        onSelect={() => handleCheckout("pro")}
                        loading={loadingPlan === "pro"}
                    />
                </div>

                <div className="mt-20 bg-[#0d0d10] border border-slate-800/50 rounded-[40px] p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Need a custom plan?</h2>
                        <p className="text-slate-400">Large-scale agency or enterprise? Contact us for custom volume pricing.</p>
                    </div>
                    <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-colors shrink-0">
                        Contact Sales
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
