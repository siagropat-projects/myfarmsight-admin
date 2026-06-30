import { X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import { useAccountsStore, type AdminUser, type AdminRole } from '../../../stores/settings/accounts';

interface RolesPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminUser | null;
}

export default function RolesPermissionsModal({ isOpen, onClose, admin }: RolesPermissionsModalProps) {
  const { assignRole, loading } = useAccountsStore();
  const [selectedRole, setSelectedRole] = useState<AdminRole>('content_admin');

  useEffect(() => {
    if (admin) {
      setSelectedRole(admin.adminRole);
    }
  }, [admin]);

  if (!isOpen || !admin) return null;

  const handleSave = async () => {
    try {
      await assignRole({
        userId: admin.id,
        adminRole: selectedRole,
      });
      onClose();
    } catch (error) {
      // Error handled by store toast
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Roles & Permission</h2>
            <p className="text-sm text-gray-500">Assign system access level for {admin.fullName}.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-gray-700">{admin.fullName}</span>
              <span className="text-xs text-gray-500">{admin.email}</span>
            </div>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand focus:border-brand"
            >
              <option value="super_admin">Super Admin</option>
              <option value="operations_admin">Operations Admin</option>
              <option value="finance_admin">Finance Admin</option>
              <option value="content_admin">Content Admin</option>
            </select>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} className="bg-white border-gray-200">Cancel</Button>
          <Button 
            variant="primary" 
            className="bg-brand px-8" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}