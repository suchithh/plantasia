// Plantasia: Guardians — Shop Panel
import { useState } from 'react';
import { X, ShoppingBag, Sparkles, TreePine, Castle, Crown, Bug, Rainbow, Waves, PersonStanding, Lock, Check, Coins } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import type { ShopItem } from '../../types';

const iconMap: Record<string, LucideIcon> = {
    TreePine, Castle, PersonStanding, Sparkles, Rainbow, Crown, Bug, Waves,
};

export function ShopPanel() {
    const coins = useGameStore(s => s.coins);
    const shopItems = useGameStore(s => s.shopItems);
    const gardenSize = useGameStore(s => s.gardenSize);
    const purchaseItem = useGameStore(s => s.purchaseItem);
    const setActivePanel = useGameStore(s => s.setActivePanel);

    const [tab, setTab] = useState<'garden' | 'cosmetics'>('garden');
    const [justBought, setJustBought] = useState<string | null>(null);

    const gardenItems = shopItems.filter(i => i.category === 'garden_upgrade');
    const cosmeticItems = shopItems.filter(i => i.category === 'cosmetic');

    const handleBuy = (item: ShopItem) => {
        if (item.owned || coins < item.price) return;

        if (item.category === 'cosmetic') {
            // Cosmetics show "coming soon" toast
            setJustBought('coming_soon');
            setTimeout(() => setJustBought(null), 2000);
            return;
        }

        // Check prerequisite (can't skip medium)
        if (item.gardenSize === 'large' && gardenSize === 'small') {
            return; // must buy medium first
        }

        const success = purchaseItem(item.id);
        if (success) {
            setJustBought(item.id);
            setTimeout(() => setJustBought(null), 2000);
        }
    };

    const getGardenStatus = (item: ShopItem) => {
        if (item.owned) return 'owned';
        if (item.gardenSize === 'large' && gardenSize === 'small') return 'locked';
        if (coins < item.price) return 'too_expensive';
        return 'available';
    };

    const gardenSizeLabel = { small: '3×3 (9 slots)', medium: '4×4 (16 slots)', large: '5×5 (25 slots)' };

    return (
        <div className="shop-overlay">
            <div className="shop-panel glass-panel">
                <div className="shop-header">
                    <div className="shop-header-left">
                        <ShoppingBag size={24} className="text-emerald-500" />
                        <h2>Garden Shop</h2>
                    </div>
                    <div className="shop-coins">
                        <Coins size={18} />
                        <span>{coins}</span>
                    </div>
                    <button className="shop-close" onClick={() => setActivePanel('none')}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="shop-tabs">
                    <button
                        className={`shop-tab ${tab === 'garden' ? 'active' : ''}`}
                        onClick={() => setTab('garden')}
                    >
                        <TreePine size={16} />
                        Garden
                    </button>
                    <button
                        className={`shop-tab ${tab === 'cosmetics' ? 'active' : ''}`}
                        onClick={() => setTab('cosmetics')}
                    >
                        <Sparkles size={16} />
                        Cosmetics
                    </button>
                </div>

                {/* Current garden info */}
                {tab === 'garden' && (
                    <div className="shop-garden-current">
                        <span>Current Garden: <strong>{gardenSizeLabel[gardenSize]}</strong></span>
                    </div>
                )}

                {/* Items grid */}
                <div className="shop-items">
                    {tab === 'garden' && gardenItems.map(item => {
                        const status = getGardenStatus(item);
                        const Icon = iconMap[item.icon] || TreePine;
                        return (
                            <div key={item.id} className={`shop-item-card garden ${status}`}>
                                <div className="shop-item-icon">
                                    {status === 'owned' ? <Check size={28} /> : status === 'locked' ? <Lock size={28} /> : <Icon size={28} />}
                                </div>
                                <div className="shop-item-content">
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>

                                    <div className="shop-item-action">
                                        {status === 'owned' ? (
                                            <span className="shop-owned-badge">Owned</span>
                                        ) : status === 'locked' ? (
                                            <span className="shop-locked-badge">Locked</span>
                                        ) : (
                                            <button
                                                className="shop-buy-btn"
                                                onClick={() => handleBuy(item)}
                                                disabled={status === 'too_expensive'}
                                            >
                                                <Coins size={14} />
                                                {item.price}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {justBought === item.id && (
                                    <div className="shop-purchased-flash">Purchased!</div>
                                )}
                            </div>
                        );
                    })}

                    {tab === 'cosmetics' && cosmeticItems.map(item => {
                        const Icon = iconMap[item.icon] || Sparkles;
                        return (
                            <div key={item.id} className={`shop-item-card cosmetic ${item.owned ? 'owned' : ''}`}>
                                <div className="shop-item-icon cosmetic-icon">
                                    <Icon size={28} />
                                </div>
                                <div className="shop-item-content">
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                    <div className="shop-item-action">
                                        <button
                                            className="shop-buy-btn cosmetic"
                                            onClick={() => handleBuy(item)}
                                        >
                                            <Coins size={14} />
                                            {item.price}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Coming soon toast */}
                {justBought === 'coming_soon' && (
                    <div className="shop-coming-soon">
                        <Sparkles size={16} />
                        Coming soon! Cosmetics are on the way.
                    </div>
                )}
            </div>
        </div>
    );
}
