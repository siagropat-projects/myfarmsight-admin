import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Check,
  X,
  MoreVertical,
  Loader2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Key,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useVetStore } from "../../stores/vets";
import Button from "../../components/ui/Button";
import ProfileOverview from "../../components/modules/vets/ProfileOverview";
import VerificationDetails from "../../components/modules/vets/VerificationDetails";
import Tickets from "../../components/modules/vets/Tickets";
import Earnings from "../../components/modules/vets/Earnings";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import ResetPasswordModal from "../../components/ui/ResetPasswordModal";

export default function VetsDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Profile Overview");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const {
    selectedVetProfile,
    loading: isLoading,
    getProfile,
    getBusiness,
    fetchVetTickets,
    fetchVetFinance,
    approveVet,
    suspendVet,
    activateVet,
    softDeleteVet,
  } = useVetStore();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "suspend" | "activate" | "delete" | "approve" | "deny" | null;
  }>({ isOpen: false, type: null });

  useEffect(() => {
    if (id) {
      getProfile(id);
      getBusiness(id);
      fetchVetTickets(id);
      fetchVetFinance(id);
    }
  }, [id, getProfile, getBusiness, fetchVetTickets, fetchVetFinance]);

  const handleAction = async () => {
    if (!modalConfig.type || !id) return;
    setIsActionLoading(true);

    try {
      if (modalConfig.type === "suspend") await suspendVet(id, "Admin suspension");
      if (modalConfig.type === "activate") await activateVet(id);
      if (modalConfig.type === "approve") await approveVet(id, true);
      if (modalConfig.type === "deny") await approveVet(id, false);
      if (modalConfig.type === "delete") {
        await softDeleteVet(id);
        navigate("/vets");
        return;
      }
      setModalConfig({ isOpen: false, type: null });
    } finally {
      setIsActionLoading(false);
      setShowDropdown(false);
    }
  };

  const getModalProps = () => {
    switch (modalConfig.type) {
      case "suspend":
        return {
          title: "Suspend Professional?",
          description:
            "This professional will be unable to accept new tickets or withdraw earnings until reactivated.",
          confirmText: "Yes, Suspend",
          variant: "danger" as const,
        };
      case "activate":
        return {
          title: "Activate Account?",
          description:
            "This will restore full access to the professional's dashboard and services.",
          confirmText: "Yes, Activate",
          variant: "primary" as const,
        };
      case "delete":
        return {
          title: "Remove Professional?",
          description:
            "This will move all vet records to trash. This action is irreversible.",
          confirmText: "Yes, Delete",
          variant: "danger" as const,
        };
      case "approve":
        return {
          title: "Approve Professional?",
          description: "This will grant the professional full access to the platform.",
          confirmText: "Yes, Approve",
          variant: "primary" as const,
        };
      case "deny":
        return {
          title: "Deny Professional?",
          description: "This will deny the professional access to the platform.",
          confirmText: "Yes, Deny",
          variant: "danger" as const,
        };
      default:
        return { title: "", description: "", confirmText: "" };
    }
  };

  if (isLoading && !selectedVetProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#2D8A39] mb-4" size={48} />
        <p className="text-gray-500 font-medium">
          Loading professional details...
        </p>
      </div>
    );
  }

  if (!selectedVetProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 font-medium">Professional not found</p>
        <Button variant="secondary" onClick={() => navigate("/vets")} className="mt-4">
          Back to Vets
        </Button>
      </div>
    );
  }

  const vet = selectedVetProfile;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#1D2939]">
            Manage Vets./Professional
          </h1>
        </div>
        <Button
          variant="primary"
          className="bg-[#2D8A39] hover:bg-[#2D8A39]/90"
          onClick={() => navigate("/vets/create")}
        >
          <Plus size={18} /> Add New Vet./Professional
        </Button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-50 shadow-inner bg-gray-100 flex items-center justify-center">
              {vet.image_url || vet.image ? (
                <img
                  src={vet.image_url || vet.image}
                  alt="Vet"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-400">
                  {vet.fullName?.charAt(0)}
                </span>
              )}
            </div>
            <div
              className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${vet.is_suspended || vet.isSuspended ? "bg-red-500" : "bg-green-500"}`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1D2939]">{vet.fullName}</h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  vet.is_suspended || vet.isSuspended
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-[#2D8A39]"
                }`}
              >
                {vet.is_suspended || vet.isSuspended ? "Suspended" : "Active"}
              </span>
              {(vet.is_approved || vet.isApproved) && (
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  Verified
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm italic">
              {vet.email} • {vet.phone_number || vet.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!(vet.is_approved || vet.isApproved) && (
            <>
              <Button
                variant="secondary"
                className="text-red-500 border-red-100 hover:bg-red-50 text-xs"
                onClick={() => setModalConfig({ isOpen: true, type: "deny" })}
              >
                <X size={14} /> Deny
              </Button>
              <Button
                variant="secondary"
                className="text-[#2D8A39] border-green-100 hover:bg-green-50 text-xs"
                onClick={() =>
                  setModalConfig({ isOpen: true, type: "approve" })
                }
              >
                <Check size={14} /> Approve
              </Button>
            </>
          )}

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2.5 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all shadow-sm"
            >
              <MoreVertical size={18} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    setIsResetOpen(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Key size={16} className="text-gray-400" /> Reset Password
                </button>

                <div className="h-px bg-gray-50 my-1" />

                {!(vet.is_suspended || vet.isSuspended) ? (
                  <button
                    onClick={() =>
                      setModalConfig({ isOpen: true, type: "suspend" })
                    }
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <ShieldAlert size={16} /> Suspend Account
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setModalConfig({ isOpen: true, type: "activate" })
                    }
                    className="w-full px-4 py-2.5 text-left text-sm text-[#2D8A39] hover:bg-green-50 flex items-center gap-3"
                  >
                    <ShieldCheck size={16} /> Activate Account
                  </button>
                )}

                <button
                  onClick={() =>
                    setModalConfig({ isOpen: true, type: "delete" })
                  }
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <Trash2 size={16} /> Delete Record
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-8 border-b border-gray-100 overflow-x-auto">
        {[
          "Profile Overview",
          "Verification Details",
          "Tickets",
          "Earnings",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 font-semibold text-sm transition-all whitespace-nowrap relative ${
              activeTab === tab
                ? "text-[#2D8A39]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2D8A39] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "Profile Overview" && <ProfileOverview />}
        {activeTab === "Verification Details" && <VerificationDetails />}
        {activeTab === "Tickets" && <Tickets />}
        {activeTab === "Earnings" && <Earnings />}
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
        userName={vet.fullName}
        userType="vet"
      />
    </div>
  );
}
