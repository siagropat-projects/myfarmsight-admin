import { useState, useEffect } from "react";
import {
  Briefcase,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { useVetStore } from "../../../stores/vets";

export default function ProfileOverview() {
  const { selectedVetProfile, updateProfile, loading: isStoreLoading } = useVetStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  useEffect(() => {
    if (selectedVetProfile) {
      setFormData({
        name: selectedVetProfile.fullName || "",
        email: selectedVetProfile.email || "",
        phone_number: selectedVetProfile.phone_number || selectedVetProfile.phone || "",
      });
    }
  }, [selectedVetProfile]);

  const handleSave = async () => {
    if (!selectedVetProfile?.id) return;
    setIsLoading(true);
    try {
      await updateProfile(selectedVetProfile.id, formData);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (selectedVetProfile) {
      setFormData({
        name: selectedVetProfile.fullName || "",
        email: selectedVetProfile.email || "",
        phone_number: selectedVetProfile.phone_number || selectedVetProfile.phone || "",
      });
    }
    setIsEditing(false);
  };

  const inputStyles = isEditing
    ? "bg-white border-brand/20"
    : "bg-gray-50/50 cursor-not-allowed";

  if (!selectedVetProfile) return null;

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
        <Input
          label="Vet name"
          value={formData.name}
          leftIcon={<Briefcase size={18} />}
          readOnly={!isEditing}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputStyles}
        />
        <Input
          label="Email"
          value={formData.email}
          leftIcon={<Mail size={18} />}
          readOnly={!isEditing}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={inputStyles}
        />
        <Input
          label="Phone number"
          value={formData.phone_number}
          leftIcon={<Phone size={18} />}
          readOnly={!isEditing}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          className={inputStyles}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gray-100">
        <Button
          variant="secondary"
          className="px-10 border-gray-300"
          onClick={
            isEditing ? handleCancel : () => {}
          }
          disabled={!isEditing && !selectedVetProfile}
        >
          Cancel
        </Button>

        {isEditing ? (
          <Button
            variant="primary"
            className="bg-[#2D8A39] hover:bg-[#2D8A39]/90 px-10 text-white min-w-[140px]"
            onClick={handleSave}
            disabled={isLoading || isStoreLoading}
          >
            {isLoading || isStoreLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Save Changes"
            )}
          </Button>
        ) : (
          <Button
            variant="primary"
            className="bg-[#2D8A39] hover:bg-[#2D8A39]/90 px-10 text-white"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
}
