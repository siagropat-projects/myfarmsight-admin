import { useState } from "react";
import { NavLink } from "react-router";
import {
    LayoutDashboard,
    Users,
    UserRound,
    BookOpen,
    Wallet,
    BarChart3,
    Settings,
    LogOut,
    X,
    Logs,
    DollarSign,
    HelpCircle
} from "lucide-react";
import { Images } from "../../assets";
import { useAuth } from "../../stores/auth";

export default function Sidebar() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { logout } = useAuth()

    const menu = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Farmers", icon: Users, path: "/farmers" },
        { name: "Veterinarians", icon: UserRound, path: "/vets" },
        { name: "LMS Mgt.", icon: BookOpen, path: "/lms" },
        { name: "Revenue", icon: DollarSign, path: "/revenue" },
        { name: "Wallet", icon: Wallet, path: "/wallet" },
        { name: "Reports", icon: BarChart3, path: "/reports" },
        { name: "Activity Log", icon: Logs, path: "/activity-log" },
        { name: "Support", icon: HelpCircle, path: "/support" },
        { name: "Settings", icon: Settings, path: "/settings" },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="flex flex-col h-screen w-64 border-r border-gray-200 bg-white p-4">
            {/* Logo Area */}
            <div className="mb-10 px-2">
                <img src={Images.logo} alt="My Farm Sight" className="w-32" />
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 flex flex-col gap-2">
                {menu.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? "bg-[#29A329] text-white" // Using the green from your screenshot
                                : "text-gray-500 hover:bg-gray-100"
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Sign Out Button (Anchored Bottom) */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors mt-auto cursor-pointer"
            >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
            </button>

            {/* Logout Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <LogOut size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Log Out?</h3>
                            <p className="text-gray-500 mt-2">
                                Are you sure you want to log out as an admin?
                            </p>

                            <div className="flex gap-3 mt-8 w-full">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 px-4 py-2 bg-[#D32F2F] text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}