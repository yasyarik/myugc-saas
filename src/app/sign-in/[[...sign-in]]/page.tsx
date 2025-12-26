import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-[#022c22] flex items-center justify-center">
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-[#0d0d10] border border-slate-800",
                    }
                }}
            />
        </div>
    );
}
