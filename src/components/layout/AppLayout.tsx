import { Outlet } from "react-router";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import Sidebar from "./Sidebar";
import Headbar from "./Headbar";
import { useAuth } from "../../stores/auth";

export default function AppLayout() {
    const navigate = useNavigate();
    const { token, user, me } = useAuth();

    useEffect(() => {
        if (token && !user) {
            me();
        }
    }, [token, user, me]);

    useEffect(() => {
        const isAuthenticated = Boolean(token);
        const isAdmin = user?.role === "admin";

        if (!isAuthenticated) {
            navigate("/login", { replace: true });
            return;
        }

        if (user && !isAdmin) {
            toast.error("Unauthorized", {
                description: "Admin access only",
            });
            navigate("/login", { replace: true });
        }
    }, [token, user, navigate]);

    return (
        // min-h-screen ensures the background fills the page
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar: Fixed width, doesn't shrink */}
            <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0">
                <Headbar />

                {/* Scrollable Content (Outlet) */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="w-full mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}