import {
  Home,
  MapPin,
  Layers,
  Droplets,
  Wind,
  Globe,
  Activity,
} from "lucide-react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { useFarmerStore } from "../../../stores/farmers";

export default function Farm() {
  const { selectedFarmhouse: farm } = useFarmerStore();

  if (!farm) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-400">Loading farm details...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 mb-8">
        <Input
          label="Animal house name"
          defaultValue={farm.name}
          leftIcon={<Home size={18} className="text-gray-400" />}
        />
        <Input
          label="Capacity"
          defaultValue={farm.capacity?.toLocaleString()}
          leftIcon={<Activity size={18} className="text-gray-400" />}
        />
        <Input
          label="Street"
          defaultValue={farm.address}
          leftIcon={<MapPin size={18} className="text-gray-400" />}
        />

        <Input
          label="City"
          defaultValue={farm.city}
          leftIcon={<MapPin size={18} className="text-gray-400" />}
        />
        <Input
          label="State"
          defaultValue={farm.state}
          leftIcon={<MapPin size={18} className="text-gray-400" />}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Country</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Globe size={18} />
            </span>
            <select 
              className="w-full pl-10 p-3 border border-gray-200 rounded-lg outline-none focus:border-brand bg-white text-sm appearance-none"
              defaultValue={farm.country || "Nigeria"}
            >
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Type of system used
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Layers size={18} />
            </span>
            <select 
              className="w-full pl-10 p-3 border border-gray-200 rounded-lg outline-none focus:border-brand bg-white appearance-none"
              defaultValue={farm.system}
            >
              <option value="Battery cage">Battery cage</option>
              <option value="Deep Litter">Deep Litter</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Water system
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Droplets size={18} />
            </span>
            <select 
              className="w-full pl-10 p-3 border border-gray-200 rounded-lg outline-none focus:border-brand bg-white appearance-none"
              defaultValue={farm.water}
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Automatic ventilator
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Wind size={18} />
            </span>
            <select 
              className="w-full pl-10 p-3 border border-gray-200 rounded-lg outline-none focus:border-brand bg-white appearance-none"
              defaultValue={farm.ventilator ? "Yes" : "No"}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="secondary" className="px-8">
          Cancel
        </Button>
        <Button variant="primary" className="bg-brand hover:bg-brand/90 px-8">
          Edit Farm
        </Button>
      </div>
    </div>
  );
}
