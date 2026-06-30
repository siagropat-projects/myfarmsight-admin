import { useState } from 'react';
import { Calendar, Download, X } from 'lucide-react';
import Button from './Button';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (params: ExportParams) => Promise<void>;
  loading?: boolean;
  showReportType?: boolean;
}

export interface ExportParams {
  startDate: string;
  endDate: string;
  reportType?: 'farmer' | 'vet' | 'lms';
}

export default function ExportModal({ 
  isOpen, 
  onClose, 
  onExport, 
  loading = false,
  showReportType = false 
}: ExportModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<'farmer' | 'vet' | 'lms'>('farmer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      return;
    }

    const params: ExportParams = {
      startDate,
      endDate,
      ...(showReportType && { reportType }),
    };

    await onExport(params);
    onClose();
    // Reset form
    setStartDate('');
    setEndDate('');
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setStartDate('');
      setEndDate('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
            <p className="text-sm text-gray-500">Select date range to export data</p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {showReportType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand focus:border-brand"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as 'farmer' | 'vet' | 'lms')}
                  disabled={loading}
                >
                  <option value="farmer">Farmer Report</option>
                  <option value="vet">Veterinarian Report</option>
                  <option value="lms">LMS Report</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  required
                  type="date"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-brand focus:border-brand"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || new Date().toISOString().split('T')[0]}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  required
                  type="date"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-brand focus:border-brand"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex gap-3 justify-end">
            <Button 
              variant="secondary" 
              onClick={handleClose} 
              className="bg-white border-gray-200"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              className="bg-brand px-8 flex items-center gap-2"
              disabled={loading || !startDate || !endDate}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
