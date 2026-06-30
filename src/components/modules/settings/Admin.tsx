import { useState, useEffect } from 'react';
import { MoreVertical, Search, Trash2, Filter, Download, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../ui/Button';
import Pagination from '../../ui/Pagination';
import ConfirmationModal from '../../ui/ConfirmationModal';
import ExportModal, { type ExportParams } from '../../ui/ExportModal';
import { useAccountsStore, type AdminUser, type AdminRole } from '../../../stores/settings/accounts';
import RolesPermissionsModal from './RolesAndPermissions';

export default function AdminManagement() {
  const { admins, loading, fetchAdmins, createAdmin, exportAccounts } = useAccountsStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  // Add Admin Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    adminRole: 'content_admin' as AdminRole,
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedIds(selectedIds.length === admins?.length ? [] : admins?.map(a => a.id) || []);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await createAdmin(formData);
      setIsAddModalOpen(false);
      setFormData({ 
        fullName: '', 
        email: '', 
        adminRole: 'content_admin', 
        password: '', 
        confirmPassword: '' 
      });
    } catch (error) {
      // Error handled by store toast
    }
  };

  const handleOpenRolesModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsRolesModalOpen(true);
    setActiveMenu(null);
  };

  const handleExport = async (params: ExportParams) => {
    await exportAccounts(params);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Admin Logs</h2>
          <p className="text-sm text-gray-500">Manage and monitor all registered admins</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Conditional Delete Button */}
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setDeleteId("multiple")}
              className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 size={18} /> Delete
            </button>
          )}

          <button className="flex items-center gap-2 text-gray-600 px-3 py-2 text-sm font-medium hover:bg-gray-50 rounded-lg">
            <Filter size={18} /> Filters
          </button>

          {/* Expandable Search */}
          <div className={`flex items-center transition-all duration-300 border rounded-lg px-2 ${searchOpen ? 'w-64 border-brand ring-1 ring-brand' : 'w-10 border-transparent'}`}>
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-1">
              <Search size={18} className="text-gray-500" />
            </button>
            {searchOpen && (
              <input 
                autoFocus
                className="bg-transparent border-none focus:ring-0 text-sm w-full h-8"
                placeholder="Search admins..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            )}
          </div>

          <button className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50" onClick={() => setIsExportModalOpen(true)}>
            <Download size={18} /> Export
          </button>
          
          <Button 
            variant="primary" 
            className="bg-brand flex items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} /> Add Admin
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-b-xl border border-gray-100 overflow-hidden min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        )}
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-[#667085] font-medium">
            <tr>
              <th className="p-4 w-10">
                <input 
                    type="checkbox" 
                    checked={admins.length > 0 && selectedIds.length === admins.length} 
                    onChange={selectAll} 
                    className="accent-brand rounded w-4 h-4 cursor-pointer" 
                />
              </th>
              <th className="p-4">Users</th>
              <th className="p-4">Access Rights</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(!admins || admins.length === 0) && !loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No admins found</td>
              </tr>
            ) : (
              admins?.map((admin) => (
                <tr key={admin.id} className={`hover:bg-gray-50/50 transition-colors ${selectedIds.includes(admin.id) ? 'bg-brand/5' : ''}`}>
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(admin.id)} 
                      onChange={() => toggleSelection(admin.id)} 
                      className="accent-brand rounded w-4 h-4 cursor-pointer" 
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#101828]">{admin?.fullName || 'N/A'}</span>
                      <span className="text-xs text-gray-500">{admin?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#667085] capitalize">{admin.adminRole?.replace('_', ' ') || 'N/A'}</td>
                  <td className="p-4 text-[#667085]">
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-50 text-brand">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                      Active
                    </span>
                  </td>
                  <td className="p-4 relative text-right">
                      <button onClick={() => setActiveMenu(activeMenu === admin.id ? null : admin.id)} className="p-1 hover:bg-gray-100 rounded-full">
                          <MoreVertical size={18} className="text-gray-400" />
                      </button>
                      {activeMenu === admin.id && (
                          <div className="absolute right-10 top-8 w-44 bg-white shadow-xl border border-gray-100 rounded-lg z-50 py-1 text-left">
                              <button 
                                onClick={() => handleOpenRolesModal(admin)}
                                className="w-full px-4 py-2 hover:bg-gray-50 text-sm"
                              >
                                Assign Role
                              </button>
                              <button className="w-full px-4 py-2 hover:bg-gray-50 text-sm">Reset Password</button>
                              <button onClick={() => setDeleteId(admin.id)} className="w-full px-4 py-2 hover:bg-gray-50 text-sm text-red-500 font-medium">Suspend Admin</button>
                          </div>
                      )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination 
          currentRecords={admins || []} 
          totalRecords={admins?.length || 0} 
          currentPage={1} 
          totalPages={1} 
          onPageChange={() => {}} 
        />
      </div>

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
                <p className="text-sm text-gray-500">Create a new administrator account.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand focus:border-brand"
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand focus:border-brand"
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    required
                    type="password"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand focus:border-brand"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    required
                    type="password"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand focus:border-brand"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand focus:border-brand"
                    value={formData.adminRole}
                    onChange={e => setFormData({ ...formData, adminRole: e.target.value as AdminRole })}
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="operations_admin">Operations Admin</option>
                    <option value="finance_admin">Finance Admin</option>
                    <option value="content_admin">Content Admin</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="bg-white border-gray-200">Cancel</Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="bg-brand px-8"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RolesPermissionsModal
        isOpen={isRolesModalOpen}
        onClose={() => {
          setIsRolesModalOpen(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => setDeleteId(null)}
        title={deleteId === "multiple" ? "Suspend multiple admins?" : "Suspend Admin?"}
        description="This will restrict access for the selected accounts until reinstated."
      />
    </div>
  );
}