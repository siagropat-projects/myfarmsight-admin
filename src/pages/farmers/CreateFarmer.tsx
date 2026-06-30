import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Home,
  Activity,
  Layers,
  MapPin,
  Hash,
  Globe,
  Droplets,
  Wind,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import { useFarmerStore } from "../../stores/farmers";

// Types for our form payload
type FarmerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  animalHouseName: string;
  capacity: string;
  numFarmhouses: string;
  street: string;
  city: string;
  totalBatches: string;
  state: string;
  country: string;
  activeBatches: string;
  systemType: string;
  waterSystem: string;
  totalBirds: string;
  autoVentilator: string;
};

export default function CreateFarmer() {
  const [step, setStep] = useState<"farmer" | "animal">("farmer");
  const { createFarmer, loading: isLoading } = useFarmerStore();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FarmerFormValues>({
    mode: "onChange",
  });

  const goBack = () => window.history.back();

  // Validates current step before moving forward
  const handleNextStep = async () => {
    const fieldsToValidate = ["firstName", "lastName", "email", "phoneNumber"];
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) setStep("animal");
    else toast.error("Please fix the errors in Farmer Details first");
  };

  const onSubmit = async (data: FarmerFormValues) => {
    // --- API PAYLOAD PREPARATION ---
    const payload = {
      farmer_info: {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phoneNumber,
      },
      farm_details: {
        house_name: data.animalHouseName,
        capacity: Number(data.capacity),
        farmhouse_count: Number(data.numFarmhouses),
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
        },
        production: {
          total_batches: Number(data.totalBatches),
          active_batches: Number(data.activeBatches),
          total_birds_current: Number(data.totalBirds),
        },
        systems: {
          type: data.systemType,
          water: data.waterSystem,
          ventilation: data.autoVentilator,
        },
      },
    };

    try {
      await createFarmer(payload);
      goBack();
    } catch (error) {
      // Error handled in store
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={goBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Manage Farms</h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm"
      >
        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-gray-100 mb-8">
          <button
            type="button"
            className={`pb-4 px-2 font-semibold transition-all relative ${step === "farmer" ? "text-brand" : "text-gray-400"}`}
            onClick={() => setStep("farmer")}
          >
            Farmer Details
            {step === "farmer" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand rounded-t-full" />
            )}
          </button>
          <button
            type="button"
            className={`pb-4 px-2 font-semibold transition-all relative ${step === "animal" ? "text-brand" : "text-gray-400"}`}
            onClick={handleNextStep}
          >
            Animal House Details
            {step === "animal" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand rounded-t-full" />
            )}
          </button>
        </div>

        {/* Step 1: Farmer Details */}
        {step === "farmer" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <Input
              label="First Name"
              {...register("firstName", { required: "First name is required" })}
              error={errors.firstName?.message}
              leftIcon={
                <User
                  size={18}
                  className={
                    errors.firstName ? "text-red-400" : "text-gray-400"
                  }
                />
              }
            />
            <Input
              label="Last Name"
              {...register("lastName", { required: "Last name is required" })}
              error={errors.lastName?.message}
              leftIcon={
                <User
                  size={18}
                  className={errors.lastName ? "text-red-400" : "text-gray-400"}
                />
              }
            />
            <Input
              label="Email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              error={errors.email?.message}
              leftIcon={
                <Mail
                  size={18}
                  className={errors.email ? "text-red-400" : "text-gray-400"}
                />
              }
            />
            <Input
              label="Phone number"
              {...register("phoneNumber", { required: "Phone is required" })}
              error={errors.phoneNumber?.message}
              leftIcon={
                <Phone
                  size={18}
                  className={
                    errors.phoneNumber ? "text-red-400" : "text-gray-400"
                  }
                />
              }
            />
          </div>
        )}

        {/* Step 2: Animal House Details */}
        {step === "animal" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
            <Input
              label="Animal house name"
              {...register("animalHouseName")}
              leftIcon={<Home size={18} className="text-gray-400" />}
            />
            <Input
              label="Capacity"
              {...register("capacity")}
              leftIcon={<Activity size={18} className="text-gray-400" />}
            />
            <Input
              label="Number of farmhouses"
              {...register("numFarmhouses")}
              leftIcon={<Layers size={18} className="text-gray-400" />}
            />

            <Input
              label="Street"
              {...register("street")}
              leftIcon={<MapPin size={18} className="text-gray-400" />}
            />
            <Input
              label="City"
              {...register("city")}
              leftIcon={<MapPin size={18} className="text-gray-400" />}
            />
            <Input
              label="Total batches"
              {...register("totalBatches")}
              leftIcon={<Hash size={18} className="text-gray-400" />}
            />

            <SelectInput
              label="State"
              icon={<MapPin size={18} />}
              options={["Lagos", "Ogun", "Oyo"]}
              register={register("state")}
            />
            <SelectInput
              label="Country"
              icon={<Globe size={18} />}
              options={["Nigeria", "Ghana"]}
              register={register("country")}
            />
            <Input
              label="Active batches"
              {...register("activeBatches")}
              leftIcon={<Activity size={18} className="text-gray-400" />}
            />

            <SelectInput
              label="Type of system used"
              icon={<Layers size={18} />}
              options={["Deep litters", "Battery Cage"]}
              register={register("systemType")}
            />
            <SelectInput
              label="Water system"
              icon={<Droplets size={18} />}
              options={["Automatic", "Manual"]}
              register={register("waterSystem")}
            />
            <Input
              label="Total birds (current cycle)"
              {...register("totalBirds")}
              leftIcon={<Hash size={18} className="text-gray-400" />}
            />

            <SelectInput
              label="Automatic ventilator"
              icon={<Wind size={18} />}
              options={["Yes", "No"]}
              register={register("autoVentilator")}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-12 pt-8 border-t border-gray-50">
          <Button
            type="button"
            variant="secondary"
            className="px-10"
            onClick={goBack}
            disabled={isLoading}
          >
            Cancel
          </Button>

          {step === "farmer" ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="px-10 bg-brand hover:bg-brand/90"
            >
              Next: Animal House Details
            </Button>
          ) : (
            <Button
              type="submit"
              className="px-10 bg-brand hover:bg-brand/90 min-w-[160px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Save details"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// Reusable Select Input with React Hook Form integration
function SelectInput({ label, icon, options, register }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <select
          {...register}
          className="w-full pl-10 pr-10 p-3 border border-gray-200 rounded-lg outline-none focus:border-brand bg-white text-gray-700 appearance-none"
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown size={18} />
        </span>
      </div>
    </div>
  );
}
