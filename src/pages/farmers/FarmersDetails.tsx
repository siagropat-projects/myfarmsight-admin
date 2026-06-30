import { useState, useEffect } from "react";
import { Check, X, Key, ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import Button from "../../components/ui/Button";
import Profile from "../../components/modules/farmers/Profile";
import Farm from "../../components/modules/farmers/Farm";
import Finance from "../../components/modules/farmers/Finance";
import Tickets from "../../components/modules/farmers/Tickets";
import { useFarmerStore } from "../../stores/farmers";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import ResetPasswordModal from "../../components/ui/ResetPasswordModal";

export default function FarmersDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Profile Overview");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "suspend" | "activate" | "delete" | null;
  }>({ isOpen: false, type: null });
  const [isResetOpen, setIsResetOpen] = useState(false);

  const {
    selectedFarmerProfile: profile,
    selectedFarmhouse: farm,
    getProfile,
    getFarm,
    suspendFarmer,
    activateFarmer,
    softDeleteFarmer,
    loading: isStoreLoading,
  } = useFarmerStore();

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        await Promise.all([getProfile(id), getFarm(id)]);
      };
      loadData();
    }
  }, [id, getProfile, getFarm]);

  const handleAction = async () => {
    if (!id || !modalConfig.type) return;
    setIsActionLoading(true);

    try {
      if (modalConfig.type === "suspend") {
        await suspendFarmer(id, "Suspended by admin");
      } else if (modalConfig.type === "activate") {
        await activateFarmer(id);
      } else if (modalConfig.type === "delete") {
        await softDeleteFarmer(id);
        navigate("/farmers");
        return; // Don't close modal if navigating away
      }
      setModalConfig({ isOpen: false, type: null });
    } finally {
      setIsActionLoading(false);
    }
  };

  const getModalProps = () => {
    switch (modalConfig.type) {
      case "suspend":
        return {
          title: "Suspend Account?",
          description:
            "Are you sure you want to suspend this farmer's account? They will lose access to the platform until reactivated.",
          confirmText: "Yes, Suspend",
          variant: "danger" as const,
        };
      case "activate":
        return {
          title: "Activate Account?",
          description: "This will restore the farmer's access to the platform.",
          confirmText: "Yes, Activate",
          variant: "primary" as const,
        };
      case "delete":
        return {
          title: "Delete Farm Record?",
          description:
            "You are about to delete this farm record. This action is irreversible and will move the data to trash.",
          confirmText: "Yes, Delete",
          variant: "danger" as const,
        };
      default:
        return { title: "", description: "", confirmText: "" };
    }
  };

  if (isStoreLoading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand mb-4" size={48} />
        <p className="text-gray-500 font-medium text-lg">
          Loading farm details...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isActionLoading}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#1D2939]">Manage Farms</h1>
        </div>
        <Button
          variant="primary"
          className="bg-brand hover:bg-brand/90"
          onClick={() => navigate("/farmers/create")}
          disabled={isActionLoading}
        >
          <Plus size={18} /> Add New Farm
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border shrink-0">
            {farm?.imageUrl || profile?.avatar ? (
              <img
                src={farm?.imageUrl || profile?.avatar}
                className="w-full h-full rounded-full object-cover"
                alt="Profile"
              />
            ) : (
              <span className="text-xl font-bold text-gray-400">
                {profile?.firstName?.[0]}
                {profile?.lastName?.[0]}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">
                {profile
                  ? `${profile.firstName} ${profile.lastName}`
                  : "Genesis Farms"}
              </h1>
              {profile && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    profile.isSuspended
                      ? "bg-red-50 text-red-500"
                      : profile.isActive
                        ? "bg-green-50 text-brand"
                        : "bg-gray-50 text-gray-500"
                  }`}
                >
                  {profile.isSuspended
                    ? "Suspended"
                    : profile.isActive
                      ? "Active"
                      : "Inactive"}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm italic">
              {profile?.email} • {profile?.phone || "No phone"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="text-xs"
            disabled={isActionLoading}
            onClick={() => setIsResetOpen(true)}
          >
            <Key size={14} /> Reset Password
          </Button>

          {!profile?.isSuspended ? (
            <Button
              variant="secondary"
              className="text-red-500 border-red-100 text-xs"
              onClick={() => setModalConfig({ isOpen: true, type: "suspend" })}
              disabled={isActionLoading}
            >
              <X size={14} /> Suspend Account
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="text-green-500 border-green-100 text-xs"
              onClick={() => setModalConfig({ isOpen: true, type: "activate" })}
              disabled={isActionLoading}
            >
              <Check size={14} /> Activate Account
            </Button>
          )}

          <Button
            variant="secondary"
            className="text-red-600 border-red-100 text-xs hover:bg-red-50"
            onClick={() => setModalConfig({ isOpen: true, type: "delete" })}
            disabled={isActionLoading}
          >
            <Trash2 size={14} /> Delete Farm
          </Button>
        </div>
      </div>

      <div className="flex gap-8 border-b border-gray-100 overflow-x-auto">
        {["Profile Overview", "Farm Overview", "Tickets", "Finance"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab ? "text-brand border-b-2 border-brand" : "text-gray-400 hover:text-gray-600"}`}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "Profile Overview" && <Profile />}
        {activeTab === "Farm Overview" && <Farm />}
        {activeTab === "Tickets" && <Tickets />}
        {activeTab === "Finance" && <Finance />}
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
        onConfirm={handleAction}
        isLoading={isActionLoading}
        {...getModalProps()}
      />
      <ResetPasswordModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        userId={id || ""}
        userName={profile?.firstName || ""}
        userType="farmer"
      />
    </div>
  );
}
