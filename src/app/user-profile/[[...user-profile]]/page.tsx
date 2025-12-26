import { UserProfile } from "@clerk/nextjs";
import DashboardLayout from "@/components/DashboardLayout";

export default function UserProfilePage() {
    return (
        <DashboardLayout>
            <div className="p-8 flex justify-center">
                <UserProfile
                    path="/user-profile"
                    routing="path"
                    appearance={{
                        elements: {
                            rootBox: "mx-auto w-full max-w-4xl",
                            card: "bg-[#0d0d10] border border-slate-800 shadow-none",
                            navbar: "hidden", // Прячем навигацию Клерка, если нужно скрыть лишнее
                            pageScrollBox: "bg-transparent",
                        }
                    }}
                />
            </div>
        </DashboardLayout>
    );
}
