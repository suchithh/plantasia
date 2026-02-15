// Plantasia: Guardians — Zombie Encounter Overlay
import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Skull, Trophy, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { GameEvent } from '../../types';

export function ZombieEncounter() {
    const gameEvents = useGameStore(s => s.gameEvents);
    const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

    useEffect(() => {
        // Listen for new events
        const lastEvent = gameEvents[gameEvents.length - 1];
        if (!lastEvent) return;

        if (lastEvent.type === 'challenger_approaching') {
            setActiveEvent(lastEvent);
            // Hide after 4 seconds
            setTimeout(() => setActiveEvent(null), 4000);
        } else if (lastEvent.type === 'zombie_defeated') {
            triggerVictoryConfetti();
        }
    }, [gameEvents]);

    const triggerVictoryConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    if (!activeEvent) return null;

    if (activeEvent.type === 'challenger_approaching') {
        return (
            <div className="zombie-encounter-overlay">
                <div className="challenger-backdrop" />

                <div className="challenger-content">
                    <div className="challenger-icon-wrapper">
                        <div className="challenger-icon-pulse" />
                        <Skull size={120} color="#EF4444" strokeWidth={1.5} />
                    </div>

                    <div className="challenger-text-container">
                        <h2 className="challenger-subtitle">WARNING</h2>
                        <h1 className="challenger-title">
                            A NEW CHALLENGER<br />
                            <span className="text-red-500">APPROACHES!</span>
                        </h1>
                        <div className="challenger-flash" />
                    </div>
                </div>

                <style>{`
                    .zombie-encounter-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        pointer-events: none;
                        perspective: 1000px;
                    }
                    .challenger-backdrop {
                        position: absolute;
                        inset: 0;
                        background: radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%);
                        animation: flash-bg 0.2s ease-out;
                    }
                    .challenger-content {
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 2rem;
                        transform: rotate(-5deg);
                    }
                    .challenger-text-container {
                        text-align: center;
                        position: relative;
                    }
                    .challenger-subtitle {
                        font-family: 'Impact', sans-serif;
                        font-size: 3rem;
                        color: #FCA5A5;
                        letter-spacing: 0.5rem;
                        margin: 0;
                        text-transform: uppercase;
                        text-shadow: 0 0 20px rgba(248, 113, 113, 0.8);
                        animation: slide-in-left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    }
                    .challenger-title {
                        font-family: 'Impact', sans-serif;
                        font-size: 5rem;
                        line-height: 0.9;
                        color: white;
                        text-transform: uppercase;
                        font-style: italic;
                        text-shadow: 5px 5px 0px #7F1D1D;
                        margin: 0;
                        animation: zoom-slam 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s forwards;
                        opacity: 0;
                        transform: scale(2);
                    }
                    .challenger-icon-wrapper {
                        position: relative;
                        animation: drop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s forwards;
                        opacity: 0;
                        transform: translateY(-100px);
                    }
                    .challenger-icon-pulse {
                        position: absolute;
                        inset: -20px;
                        border-radius: 50%;
                        border: 4px solid #EF4444;
                        opacity: 0;
                        animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                    }

                    @keyframes flash-bg {
                        0% { background: #FFFFFF; }
                        50% { background: #EF4444; }
                        100% { background: radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%); }
                    }
                    @keyframes slide-in-left {
                        from { transform: translateX(-100vw); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes zoom-slam {
                        from { transform: scale(3); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    @keyframes drop-in {
                        from { transform: translateY(-50vh) rotate(180deg); opacity: 0; }
                        to { transform: translateY(0) rotate(0); opacity: 1; }
                    }
                    @keyframes pulse-ring {
                        0% { transform: scale(0.5); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: scale(1.5); opacity: 0; }
                    }
                `}</style>
            </div>
        );
    }

    return null;
}
