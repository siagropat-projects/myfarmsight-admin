import { useEffect, useState } from "react";
import { 
  Search, 
  User, 
  Mail, 
  Clock, 
  Calendar, 
  Info, 
  ChevronRight, 
  History,
  FileText,
  Activity as ActivityIcon,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Layout,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Loader2
} from "lucide-react";
import { useActivityStore } from "../stores/activity";

export default function ActivityLog() {
  const { 
    activities, 
    selectedActivity, 
    pagination, 
    isLoading, 
    fetchActivities, 
    fetchActivityById,
    getActivityTheme 
  } = useActivityStore();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchActivities({ search: debouncedSearch, page: currentPage });
  }, [debouncedSearch, currentPage, fetchActivities]);

  const handleSelectActivity = (id: string) => {
    fetchActivityById(id);
  };

  const renderActivityIcon = (actionType: string) => {
    const type = actionType.toLowerCase();
    if (type.includes("create") || type.includes("register")) return <UserPlus size={18} />;
    if (type.includes("vet") || type.includes("ticket")) return <ActivityIcon size={18} />;
    if (type.includes("update") || type.includes("edit")) return <RefreshCw size={18} />;
    if (type.includes("suspend") || type.includes("delete")) return <ShieldCheck size={18} />;
    return <History size={18} />;
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-sm text-gray-500">Monitor all system and user activities across the platform.</p>
        </div>
        <button 
          onClick={() => fetchActivities({ search, page: currentPage })}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin text-brand" : "text-brand"} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="flex-1 flex bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* List Pane (30%) */}
        <div className="w-[30%] border-r border-gray-100 flex flex-col bg-gray-50/30">
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand outline-none transition-all"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading && activities.length === 0 ? (
              <div className="p-4 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <History size={40} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">No activity logs found</p>
              </div>
            ) : (
              activities.map((activity) => {
                const theme = getActivityTheme(activity.action_type);
                const isSelected = selectedActivity?.id === activity.id;

                return (
                  <div 
                    key={activity.id}
                    onClick={() => handleSelectActivity(activity.id)}
                    className={`p-4 flex gap-3 cursor-pointer transition-all border-b border-gray-50 hover:bg-white group ${
                      isSelected ? "bg-white border-l-4 border-l-brand shadow-sm" : "bg-transparent"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${theme.color}`}>
                      {renderActivityIcon(activity.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={`text-sm font-bold truncate ${isSelected ? "text-brand" : "text-gray-900"}`}>
                          {activity.action_type}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                          {new Date(activity.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-0.5">
                        <p className="text-xs text-gray-500 truncate flex-1">
                          {activity.user_full_name}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`mt-1 transition-transform group-hover:translate-x-1 ${isSelected ? "text-brand" : "text-gray-300"}`} />
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
              <button 
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-gray-500">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button 
                disabled={currentPage === pagination.last_page || isLoading}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Detail Pane (70%) */}
        <div className="flex-1 flex flex-col bg-white relative">
          {isLoading && !activities.length ? null : isLoading && !selectedActivity ? (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50/5">
              <Loader2 className="w-8 h-8 text-brand animate-spin mb-4" />
              <p className="text-sm text-gray-500 font-medium">Loading details...</p>
            </div>
          ) : !selectedActivity ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 text-center bg-gray-50/10">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
                <Layout size={32} className="opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Preview Activity</h3>
              <p className="text-sm max-w-xs leading-relaxed">Select an activity from the list to view detailed logs and metadata.</p>
            </div>
          ) : (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Detail Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start gap-6">
                  <div className="flex gap-4 items-start">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${getActivityTheme(selectedActivity.action_type).color}`}>
                      {renderActivityIcon(selectedActivity.action_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {getActivityTheme(selectedActivity.action_type).label}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">•</span>
                        <span className="text-xs text-gray-400 font-medium">ID: {selectedActivity.id}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedActivity.action_type}</h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-3xl space-y-8">
                  {/* Description Card */}
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText size={14} /> Description
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-lg font-medium">
                      {selectedActivity.description}
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <User size={14} /> Performed By
                        </h4>
                        <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                          <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center font-bold">
                            {selectedActivity.user_full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{selectedActivity.user_full_name}</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Mail size={12} />
                              {selectedActivity.user_email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={14} /> Timestamp
                        </h4>
                        <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {new Date(selectedActivity.created_at).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              {new Date(selectedActivity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Info size={14} /> Event Metadata
                      </h4>
                      <div className="bg-gray-900 rounded-2xl p-6 h-full min-h-[200px] overflow-x-auto shadow-inner">
                        {selectedActivity.metadata ? (
                          <pre className="text-green-400 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                            {JSON.stringify(selectedActivity.metadata, null, 2)}
                          </pre>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-gray-600 italic text-sm text-center">
                            <p>No additional metadata available for this event.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span>This log is immutable and protected for audit purposes.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
