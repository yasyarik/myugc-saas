import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-[#022c22] flex items-center justify-center">
            <SignUp
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
