// components/modules//VetEmptyState.tsx
import { Plus, UserPlus } from "lucide-react";
import Button from "../../ui/Button";
import { useNavigate } from "react-router";

export function VetEmptyState() {
    const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
        <UserPlus className="text-[#2D8A39]" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-[#101828]">
        No veterinarians found
      </h3>
      <p className="text-[#667085] text-sm max-w-xs text-center mt-1 mb-6">
        It looks like you haven't added any veterinary professionals yet. Start
        by adding your first one.
      </p>
      <Button variant="primary" className="bg-[#2D8A39] hover:bg-[#246e2d]" onClick={()=>navigate('/vets/create')}>
        <Plus size={18} /> Add new Vet/Pro.
      </Button>
    </div>
  );
}
