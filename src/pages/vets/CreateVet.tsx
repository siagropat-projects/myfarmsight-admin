import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  FileText,
  MapPin,
  Award,
  Loader2,
} from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useVetStore } from "../../stores/vets";

type FormSchema = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;

  vetName: string;
  dateJoined: string;
  licenceNo: string;
  specialization: string;
  yearsOfExperience: string;
  about: string;
  street: string;
  city: string;
  state: string;
  country: string;
};

export default function CreateVet() {
  const navigate = useNavigate();
  const { createVet, loading } = useVetStore();
  const [activeTab, setActiveTab] = useState<"details" | "business">("details");

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<FormSchema>({
    defaultValues: {
      country: "Nigeria",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      await createVet({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phoneNumber,
        vet_name: data.vetName,
        date_joined: data.dateJoined,
        licence_number: data.licenceNo,
        specialization: data.specialization,
        years_of_experience: data.yearsOfExperience,
        about: data.about,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
      });
      navigate("/vets");
    } catch (error) {
      // Error handled in store via toast
    }
  };

  const handleNext = async () => {
    const isStepOneValid = await trigger([
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
    ]);
    if (isStepOneValid) {
      setActiveTab("business");
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-[#1D2939]">
          Add Vets./Professional
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "details" ? "text-[#2D8A39]" : "text-gray-500"
          }`}
        >
          Veterinary Details
          {activeTab === "details" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2D8A39]" />
          )}
        </button>
        <button
          onClick={handleNext}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "business" ? "text-[#2D8A39]" : "text-gray-500"
          }`}
        >
          Business Information
          {activeTab === "business" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2D8A39]" />
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Veterinary Details */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Input
              label="First Name"
              placeholder="Chidi"
              leftIcon={<User size={18} />}
              error={errors.firstName?.message}
              {...register("firstName", { required: "First name is required" })}
            />
            <Input
              label="Last Name"
              placeholder="Okeke"
              leftIcon={<User size={18} />}
              error={errors.lastName?.message}
              {...register("lastName", { required: "Last name is required" })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="chidi_okeke@gmail.com"
              leftIcon={<Mail size={18} />}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
            />
            <Input
              label="Phone number"
              placeholder="+234 123 456 7890"
              leftIcon={<Phone size={18} />}
              error={errors.phoneNumber?.message}
              {...register("phoneNumber", {
                required: "Phone number is required",
              })}
            />
          </div>
        )}

        {/* Step 2: Business Information */}
        {activeTab === "business" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="md:col-span-1">
              <Input
                label="Vet name"
                placeholder="Penial Veterinary Services"
                leftIcon={<Briefcase size={18} />}
                error={errors.vetName?.message}
                {...register("vetName", { required: "Vet name is required" })}
              />
            </div>
            <Input
              label="Date joined"
              type="date"
              leftIcon={<Calendar size={18} />}
              error={errors.dateJoined?.message}
              {...register("dateJoined", { required: "Date is required" })}
            />
            <Input
              label="Licence No."
              placeholder="MUS-567555"
              leftIcon={<FileText size={18} />}
              error={errors.licenceNo?.message}
              {...register("licenceNo", { required: "Licence is required" })}
            />
            <Input
              label="Specialization"
              placeholder="Consultant"
              leftIcon={<Award size={18} />}
              error={errors.specialization?.message}
              {...register("specialization")}
            />
            <div className="md:col-span-1">
              <Input
                label="About"
                placeholder="Brief description..."
                error={errors.about?.message}
                {...register("about")}
              />
            </div>
            <Input
              label="Years of experience"
              type="number"
              placeholder="5"
              error={errors.yearsOfExperience?.message}
              {...register("yearsOfExperience")}
            />
            <Input
              label="Street"
              placeholder="14, Adegbite Street"
              leftIcon={<MapPin size={18} />}
              error={errors.street?.message}
              {...register("street")}
            />
            <Input
              label="City"
              placeholder="Victoria Island"
              leftIcon={<MapPin size={18} />}
              error={errors.city?.message}
              {...register("city")}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                State
              </label>
              <select
                {...register("state")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#4CAF50] appearance-none bg-white"
              >
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Country
              </label>
              <select
                {...register("country")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#4CAF50] appearance-none bg-white"
              >
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
              </select>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            className="px-10"
            onClick={() =>
              activeTab === "business" ? setActiveTab("details") : navigate(-1)
            }
          >
            Cancel
          </Button>

          {activeTab === "details" ? (
            <Button
              type="button"
              variant="primary"
              className="bg-[#4CAF50] hover:bg-[#43a047] px-10"
              onClick={handleNext}
            >
              Save and Continue
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              className="bg-[#4CAF50] hover:bg-[#43a047] px-10 min-w-[120px]"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Save"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
