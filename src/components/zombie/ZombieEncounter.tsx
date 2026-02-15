// Plantasia: Guardians — Zombie Encounter Overlay
import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GameEvent } from '../../types';

export function ZombieEncounter() {
    const gameEvents = useGameStore(s => s.gameEvents);
    const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

    useEffect(() => {
        const lastEvent = gameEvents[gameEvents.length - 1];
        if (!lastEvent) return;

        if (lastEvent.type === 'challenger_approaching') {
            setActiveEvent(lastEvent);
            setTimeout(() => setActiveEvent(null), 4000);
        } else if (lastEvent.type === 'zombie_defeated') {
            setActiveEvent(lastEvent);
            triggerVictoryConfetti();
            setTimeout(() => setActiveEvent(null), 5000);
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
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    if (!activeEvent) return null;

    if (activeEvent.type === 'challenger_approaching') {
        return (
            <>
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'rgba(220, 0, 0, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem',
                    animation: 'zombie-fullscreen-flash 3.5s ease-out forwards',
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        animation: 'zombie-icon-shake 0.5s ease-in-out infinite',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: '#FFF',
                        textShadow: '0 0 40px rgba(0,0,0,0.8)'
                    }}>
                        <div style={{ fontSize: '18rem', opacity: 0.9, lineHeight: 1, fontWeight: '900', fontFamily: 'Impact, sans-serif' }}>!</div>
                    </div>

                    <h1 style={{
                        fontFamily: "'Impact', sans-serif",
                        fontSize: '6rem',
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        textAlign: 'center',
                        margin: 0,
                        textShadow: '0 4px 30px rgba(0,0,0,0.8)',
                        animation: 'zombie-text-zoom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        ZOMBIE SPAWNED
                    </h1>
                </div>
                <style>{`
                    @keyframes zombie-fullscreen-flash {
                        0% { opacity: 0; background: rgba(255, 0, 0, 0); }
                        10% { opacity: 1; background: rgba(220, 0, 0, 0.95); }
                        20% { opacity: 1; background: rgba(0, 0, 0, 0.9); }
                        30% { opacity: 1; background: rgba(220, 0, 0, 0.95); }
                        80% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                    @keyframes zombie-icon-shake {
                        0% { transform: translate(0, 0) rotate(0deg); }
                        25% { transform: translate(-5px, 5px) rotate(-5deg); }
                        50% { transform: translate(5px, -5px) rotate(5deg); }
                        75% { transform: translate(-5px, -5px) rotate(-5deg); }
                        100% { transform: translate(0, 0) rotate(0deg); }
                    }
                    @keyframes zombie-text-zoom {
                        0% { transform: scale(0.5); opacity: 0; }
                        80% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </>
        );
    }

    if (activeEvent.type === 'zombie_defeated') {
        return (
            <>
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'rgba(20, 83, 45, 0.95)', // Dark green background
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem',
                    animation: 'zombie-fullscreen-flash 4.5s ease-out forwards',
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        animation: 'zombie-icon-bounce 1s ease-in-out infinite',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: '#4ADE80', // Light green
                        textShadow: '0 0 40px rgba(74, 222, 128, 0.6)'
                    }}>
                        <div style={{ fontSize: '12rem', opacity: 1, lineHeight: 1, fontWeight: '900', fontFamily: 'Impact, sans-serif' }}>🏆</div>
                    </div>

                    <h1 style={{
                        fontFamily: "'Impact', sans-serif",
                        fontSize: '6rem',
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        textAlign: 'center',
                        margin: 0,
                        textShadow: '0 4px 30px rgba(0,0,0,0.8)',
                        animation: 'zombie-text-zoom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        ZOMBIE DEFEATED
                    </h1>
                </div>
                <style>{`
                    @keyframes zombie-fullscreen-flash {
                        0% { opacity: 0; }
                        10% { opacity: 1; }
                        80% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                    @keyframes zombie-icon-bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-20px); }
                    }
                    @keyframes zombie-text-zoom {
                        0% { transform: scale(0.5); opacity: 0; }
                        80% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </>
        );
    }

    return null;
}
