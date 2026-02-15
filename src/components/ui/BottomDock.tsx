import { ShoppingBag, Scan, ClipboardList } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

export function BottomDock() {
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const activePanel = useGameStore(s => s.activePanel);
    const checkInHistory = useGameStore(s => s.checkInHistory);
    const coins = useGameStore(s => s.coins);

    // Check if check-in done today
    const today = new Date().toISOString().split('T')[0];
    const isCheckInDone = checkInHistory.some(r => r.date.startsWith(today));

    const menuItems = [
        {
            id: 'shop',
            label: 'Shop',
            icon: ShoppingBag,
            action: () => setActivePanel(activePanel === 'shop' ? 'none' : 'shop'),
            active: activePanel === 'shop'
        },
        {
            id: 'scan',
            label: 'Add Plant',
            icon: Scan,
            action: () => setActivePanel('scan'),
            active: activePanel === 'scan',
            highlight: true // Special styling for the center button
        },
        {
            id: 'checkin',
            label: 'Check-In',
            icon: ClipboardList, // Changed icon
            action: () => setActivePanel('daily_checkin'),
            active: activePanel === 'daily_checkin'
        }
    ];

    return (
        <div className="bottom-dock-container">
            <div className="bottom-dock">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`dock-item ${item.active ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
                        onClick={item.action}
                        aria-label={item.label}
                    >
                        <div className="dock-icon-wrapper">
                            <item.icon size={item.highlight ? 28 : 24} strokeWidth={2.5} />

                            {/* Badges */}
                            {item.id === 'checkin' && !isCheckInDone && (
                                <span className="dock-badge notification" title="Not checked in today" />
                            )}
                            {item.id === 'checkin' && isCheckInDone && (
                                <span className="dock-badge success" title="Checked in!" />
                            )}
                            {item.id === 'shop' && coins > 100 && (
                                <span className="dock-badge info" />
                            )}
                        </div>
                        <span className="dock-label visible">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
