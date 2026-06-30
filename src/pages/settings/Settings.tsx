import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import AdminManagement from "../../components/modules/settings/Admin";
import Subscription from "../../components/modules/settings/Subscription";
import Vet from "../../components/modules/settings/Vet";
import Notification from "../../components/modules/settings/Notification";
const TABS = [
  { id: "admin", label: "Admin Management" },
  { id: "subscription", label: "Subscription & Pricing" },
  { id: "vet", label: "Vet Commission Settings" },
  { id: "notifications", label: "Notification Settings" },
];

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("admin");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-[#1D2939]">Settings</h1>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="flex border-b border-gray-200 gap-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === tab.id ? "text-brand" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "admin" && <AdminManagement />}
        {activeTab === "subscription" && <Subscription />}
        {activeTab === "vet" && <Vet />}
        {activeTab === "notifications" && <Notification />}
      </div>
    </div>
  );
}
