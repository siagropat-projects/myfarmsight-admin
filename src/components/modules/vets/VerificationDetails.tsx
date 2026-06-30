import { useState, useEffect } from "react";
import {
  Download,
  Briefcase,
  Calendar,
  FileText,
  Award,
  MapPin,
  Globe,
  Loader2,
  X,
  Search,
} from "lucide-react";
import { useVetStore } from "../../../stores/vets";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function VerificationDetails() {
  const { selectedVetBusiness, selectedVetProfile, updateBusiness, loading: isStoreLoading } = useVetStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    vet_name: "",
    date_joined: "",
    licence_number: "",
    years_of_experience: "",
    specialization: "",
    about: "",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
  });

  useEffect(() => {
    if (selectedVetBusiness) {
      setFormData({
        vet_name: selectedVetBusiness.businessName || "",
        date_joined: selectedVetProfile.createdAt || "",
        licence_number: selectedVetBusiness.vcn || "",
        years_of_experience: selectedVetBusiness.experienceYears || "",
        specialization: selectedVetBusiness.profession || "",
        about: selectedVetBusiness.about || "",
        street: selectedVetBusiness.street || "",
        city: selectedVetBusiness.city || "",
        state: selectedVetBusiness.state || "",
        country: selectedVetBusiness.country || "Nigeria",
      });
    }
  }, [selectedVetBusiness]);

  const handleSave = async () => {
    if (!selectedVetBusiness?.id) return;
    setIsLoading(true);
    try {
      await updateBusiness(selectedVetBusiness.id, formData);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (selectedVetBusiness) {
      setFormData({
        vet_name: selectedVetBusiness.vet_name || "",
        date_joined: selectedVetBusiness.date_joined || "",
        licence_number: selectedVetBusiness.licence_number || "",
        years_of_experience: selectedVetBusiness.years_of_experience || "",
        specialization: selectedVetBusiness.specialization || "",
        about: selectedVetBusiness.about || "",
        street: selectedVetBusiness.street || "",
        city: selectedVetBusiness.city || "",
        state: selectedVetBusiness.state || "",
        country: selectedVetBusiness.country || "Nigeria",
      });
    }
    setIsEditing(false);
  };

  const inputStyles = isEditing
    ? "bg-white border-brand/20"
    : "bg-gray-50/50 cursor-not-allowed";

  if (!selectedVetBusiness) return null;

  const gallery = Array.isArray(selectedVetBusiness.gallery)
    ? selectedVetBusiness.gallery
    : typeof selectedVetBusiness.gallery === "string"
      ? JSON.parse(selectedVetBusiness.gallery)
      : [];

  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-500">
      {/* Business Info Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#1D2939]">Business Overview</h3>
          <div className="flex gap-3">
            {!isEditing ? (
              <Button
                variant="primary"
                className="bg-[#2D8A39] hover:bg-[#2D8A39]/90 px-8 text-white"
                onClick={() => setIsEditing(true)}
              >
                Edit Details
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  className="px-8 border-gray-300"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="bg-[#2D8A39] hover:bg-[#2D8A39]/90 px-8 text-white min-w-[120px]"
                  onClick={handleSave}
                  disabled={isLoading || isStoreLoading}
                >
                  {isLoading || isStoreLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Save"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Business/Vet Name"
            value={formData.vet_name}
            leftIcon={<Briefcase size={18} />}
            readOnly={!isEditing}
            onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })}
            className={inputStyles}
          />
          <Input
            label="Date Joined"
            value={formData.date_joined}
            type="date"
            leftIcon={<Calendar size={18} />}
            readOnly={!isEditing}
            onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
            className={inputStyles}
          />
          <Input
            label="Licence No."
            value={formData.licence_number}
            leftIcon={<FileText size={18} />}
            readOnly={!isEditing}
            onChange={(e) => setFormData({ ...formData, licence_number: e.target.value })}
            className={inputStyles}
          />
          <Input
            label="Specialization"
            value={formData.specialization}
            leftIcon={<Award size={18} />}
            readOnly={!isEditing}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            className={inputStyles}
          />
          <Input
            label="Experience (Years)"
            value={formData.years_of_experience}
            type="number"
            leftIcon={<Award size={18} />}
            readOnly={!isEditing}
            onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
            className={inputStyles}
          />
          <div className="md:col-span-2">
            <Input
              label="About"
              value={formData.about}
              readOnly={!isEditing}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              className={inputStyles}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Street"
            value={formData.street}
            leftIcon={<MapPin size={18} />}
            readOnly={!isEditing}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            className={inputStyles}
          />
          <Input
            label="City"
            value={formData.city}
            leftIcon={<MapPin size={18} />}
            readOnly={!isEditing}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className={inputStyles}
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-gray-700">State</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-gray-400 pointer-events-none">
                <Globe size={18} />
              </div>
              <select
                disabled={!isEditing}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 appearance-none outline-none transition-all ${inputStyles}`}
              >
                <option value="">Select State</option>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Rivers">Rivers</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-gray-700">Country</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-gray-400 pointer-events-none">
                <Globe size={18} />
              </div>
              <select
                disabled={!isEditing}
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 appearance-none outline-none transition-all ${inputStyles}`}
              >
                <option value="Nigeria">Nigeria</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Documents Gallery */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#1D2939]">Verification Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.length > 0 ? (
            gallery.map((doc: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group cursor-zoom-in"
                onClick={() => setZoomedImage(doc?.url || doc)}
              >
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                  <img
                    src={doc?.url || doc}
                    alt={doc?.title || `Document ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 bg-white p-2 rounded-full shadow-lg transition-opacity">
                      <Search size={20} className="text-[#2D8A39]" />
                    </div>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="font-semibold text-[#1D2939]">
                    {doc?.title || `Licence Document ${index + 1}`}
                  </span>
                  <a
                    href={doc?.url || doc}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-gray-50 rounded-full text-[#2D8A39]"
                  >
                    <Download size={18} />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border border-dashed rounded-xl bg-gray-50">
              <FileText size={48} className="mb-2 opacity-20" />
              <p>No verification documents uploaded</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setZoomedImage(null)}
          >
            <X size={32} />
          </button>
          <img
            src={zoomedImage}
            alt="Zoomed document"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300"
          />
        </div>
      )}
    </div>
  );
}