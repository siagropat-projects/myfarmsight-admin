import { User, Mail, Phone } from "lucide-react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { useFarmerStore } from "../../../stores/farmers";

export default function Profile() {
  const { selectedFarmerProfile: profile } = useFarmerStore();

  if (!profile) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse text-gray-400">Loading profile details...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
        <Input
          label="First Name"
          defaultValue={profile.firstName}
          leftIcon={<User size={18} className="text-gray-400" />}
        />
        <Input
          label="Last Name"
          defaultValue={profile.lastName}
          leftIcon={<User size={18} className="text-gray-400" />}
        />
        <Input
          label="Email"
          type="email"
          defaultValue={profile.email}
          leftIcon={<Mail size={18} className="text-gray-400" />}
        />
        <Input
          label="Phone number"
          type="tel"
          defaultValue={profile.phone}
          leftIcon={<Phone size={18} className="text-gray-400" />}
        />
      </div>

      <div className="flex gap-4">
        <Button variant="secondary" className="px-8">
          Cancel
        </Button>
        <Button variant="primary" className="bg-brand hover:bg-brand/90 px-8">
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
