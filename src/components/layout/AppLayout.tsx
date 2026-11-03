import { Outlet } from "react-router";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import Sidebar from "./Sidebar";
import Headbar from "./Headbar";
import { useAuth } from "../../stores/auth";
import { useIdleTimeout } from "../../hooks/useIdleTimeout";
import SessionTimeoutModal from "./SessionTimeoutModal";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const TIMEOUT_WARNING_MS = 60 * 1000;

export default function AppLayout() {
    const navigate = useNavigate();
    const { token, user, me, logout } = useAuth();

    const handleIdleTimeout = useCallback(() => logout("inactivity"), [logout]);
    const { isWarning, secondsLeft, stayActive } = useIdleTimeout({
        enabled: Boolean(token),
        idleMs: IDLE_TIMEOUT_MS,
        warningMs: TIMEOUT_WARNING_MS,
        onTimeout: handleIdleTimeout,
    });

    // Logging out in another tab clears the shared auth storage; follow it here
    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== "auth-storage") return;
            try {
                const next = event.newValue ? JSON.parse(event.newValue) : null;
                if (!next?.state?.token) window.location.href = "/login";
            } catch {
                // Ignore malformed values
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

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

            {isWarning && (
                <SessionTimeoutModal
                    secondsLeft={secondsLeft}
                    onContinue={stayActive}
                    onLogout={() => logout()}
                />
            )}
        </div>
    );
}