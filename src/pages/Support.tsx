import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, RefreshCw, Send, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSupportStore, type SupportStatus } from '../stores/support';
import Button from '../components/ui/Button';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Pagination from '../components/ui/Pagination';

export default function Support() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<{ id: string; status: SupportStatus } | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const {
    tickets,
    selectedTicket,
    loading,
    fetchTickets,
    fetchTicketById,
    updateTicketStatus,
    sendResponse,
  } = useSupportStore();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.messages]);

  const handleTicketClick = async (ticketId: string) => {
    setSelectedTicketId(ticketId);
    await fetchTicketById(ticketId);
  };

  const handleStatusUpdate = (id: string, status: SupportStatus) => {
    setStatusToUpdate({ id, status });
    setIsStatusModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (statusToUpdate) {
      await updateTicketStatus(statusToUpdate.id, statusToUpdate.status);
      setIsStatusModalOpen(false);
      setStatusToUpdate(null);
    }
  };

  const handleSendResponse = async () => {
    if (selectedTicket && responseMessage.trim()) {
      await sendResponse(selectedTicket.id, responseMessage);
      setResponseMessage('');
    }
  };

  const handleRefresh = () => {
    fetchTickets(tickets.currentPage, searchValue);
  };

  const getStatusColor = (status: SupportStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: SupportStatus) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'processing': return <AlertCircle size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const isTicketClosed = (status: SupportStatus) => status === 'completed' || status === 'cancelled';

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4">
      {/* Header - Fixed height */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1D2939]">Support Tickets</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center bg-white border rounded-lg px-3 py-1.5 transition-all ${isSearchOpen ? 'w-64 border-brand' : 'w-10 border-transparent cursor-pointer'}`} onClick={() => !isSearchOpen && setIsSearchOpen(true)}>
            <Search size={18} className="text-gray-500 shrink-0" />
            {isSearchOpen && (
              <input
                autoFocus
                placeholder="Search..."
                className="ml-2 outline-none text-sm w-full"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  fetchTickets(tickets.currentPage, e.target.value);
                }}
              />
            )}
          </div>
          <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Main Content - Takes remaining height */}
      <div className="flex flex-1 gap-6 overflow-hidden">

        {/* Left: Tickets List */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 shrink-0">
            <h2 className="font-semibold">All Tickets ({tickets.totalRecords})</h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading && tickets.data.length === 0 ? (
              <div className="p-8 text-center"><div className="animate-spin inline-block w-6 h-6 border-2 border-brand rounded-full border-t-transparent" /></div>
            ) : (
              tickets?.data?.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-all ${selectedTicketId === ticket.id ? 'bg-blue-50/50 border-l-4 border-l-brand' : ''}`}
                  onClick={() => handleTicketClick(ticket.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] flex gap-1 font-bold uppercase border ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </span>
                    <span className="text-[10px] text-gray-400">{new Date(ticket.updated_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 truncate">{ticket.subject}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{ticket.user_name}</p>
                </div>
              ))
            )}
          </div>

          {/* Sticky Pagination */}
          {tickets.totalPages > 1 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
              <Pagination
                currentRecords={tickets.data}
                totalRecords={tickets.totalRecords}
                currentPage={tickets.currentPage}
                totalPages={tickets.totalPages}
                onPageChange={(page) => {
                  fetchTickets(page, searchValue);
                }}
              />
            </div>
          )}
        </div>

        {/* Right: Chat Window */}
        <div className="hidden lg:flex flex-col flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 shrink-0 flex justify-between items-center bg-white z-10">
                <div>
                  <h2 className="font-bold text-gray-900">{selectedTicket.subject}</h2>
                  <p className="text-xs text-gray-500">{selectedTicket.user_name} • {selectedTicket.user_email}</p>
                </div>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusUpdate(selectedTicket.id, e.target.value as SupportStatus)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-gray-50 outline-none"
                  disabled={isTicketClosed(selectedTicket.status)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Chat Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {selectedTicket?.messages?.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${message.sender === 'admin'
                        ? 'bg-brand text-white rounded-tr-none'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none shadow-sm'
                      }`}>
                      <p>{message.content}</p>
                      <p className={`text-[10px] mt-1 opacity-70 ${message.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Area */}
              <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                {!isTicketClosed(selectedTicket.status) ? (
                  <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-brand transition-colors">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      className="flex-1 bg-transparent px-2 outline-none text-sm"
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendResponse()}
                    />
                    <Button
                      variant="primary"
                      className="rounded-lg h-9 w-9 p-0 flex items-center justify-center shrink-0"
                      onClick={handleSendResponse}
                      disabled={!responseMessage.trim() || loading}
                      isLoading={loading}
                    >
                      {!loading && <Send size={18} />}
                    </Button>
                  </div>
                ) : (
                  <div className="py-2 px-4 bg-gray-100 rounded-lg text-center text-xs text-gray-500 font-medium">
                    This conversation is closed
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <div className="p-4 bg-gray-50 rounded-full"><Search size={32} /></div>
              <p>Select a ticket to start messaging</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={confirmStatusUpdate}
        title="Update Status"
        description={`Set status to ${statusToUpdate?.status}?`}
        confirmText="Update"
        variant="proceed"
      />
    </div>
  );
}