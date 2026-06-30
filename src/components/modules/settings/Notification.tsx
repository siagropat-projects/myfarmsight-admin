import { useEffect } from 'react';
import { useSettingsStore } from '../../../stores/settings/settings';
import { Loader2 } from 'lucide-react';

export default function Notification() {
    const { notifications, loading, fetchNotificationSettings, updateNotificationSettings } = useSettingsStore();

    useEffect(() => {
        fetchNotificationSettings();
    }, [fetchNotificationSettings]);

    const handleToggle = async (key: 'email' | 'push' | 'ticket') => {
        if (!notifications) return;
        try {
            await updateNotificationSettings({
                [key]: !notifications[key]
            });
        } catch (error) {
            // Error handled by store toast
        }
    };

    const Toggle = ({ active, onClick, disabled }: { active: boolean; onClick: () => void; disabled?: boolean }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-brand' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? 'left-7' : 'left-1'}`} />
        </button>
    );

    if (loading && !notifications) {
        return (
            <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-gray-100 p-8 max-w-2xl">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    if (!notifications) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-8 max-w-2xl relative overflow-hidden">
            {loading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-brand animate-spin" />
                </div>
            )}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Email Notifications</span>
                    <Toggle 
                        active={notifications.email} 
                        onClick={() => handleToggle('email')} 
                        disabled={loading}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Push Notifications</span>
                    <Toggle 
                        active={notifications.push} 
                        onClick={() => handleToggle('push')} 
                        disabled={loading}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Ticket Alert Settings</span>
                    <Toggle 
                        active={notifications.ticket} 
                        onClick={() => handleToggle('ticket')} 
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
}