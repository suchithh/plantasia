// Plantasia: Guardians — Sensor Pairing Screen
// A polished mock BLE pairing animation
import { useState, useEffect } from 'react';
import { Bluetooth, CheckCircle, X, Wifi } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

export function SensorPairScreen() {
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const setSensorConnection = useGameStore(s => s.setSensorConnection);
    const [phase, setPhase] = useState<'scanning' | 'found' | 'pairing' | 'success'>('scanning');

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        timers.push(setTimeout(() => setPhase('found'), 1800));
        timers.push(setTimeout(() => setPhase('pairing'), 3200));
        timers.push(setTimeout(() => {
            setPhase('success');
            setSensorConnection('connected_simulated');
        }, 4800));
        return () => timers.forEach(clearTimeout);
    }, [setSensorConnection]);

    const handleClose = () => {
        setActivePanel('none');
    };

    const statusText = {
        scanning: 'Scanning for sensors...',
        found: 'Found: Plantasia Soil Sensor v2',
        pairing: 'Pairing...',
        success: 'Sensor Paired!',
    };

    const statusSub = {
        scanning: 'Make sure your sensor is turned on and nearby',
        found: 'ESP32 • Bluetooth LE • Soil + Touch',
        pairing: 'Establishing secure connection...',
        success: 'Soil moisture & touch detection active',
    };

    return (
        <div className="sensor-pair-overlay">
            <div className="sensor-pair-card">
                <button className="sensor-pair-close" onClick={handleClose}>
                    <X size={20} />
                </button>

                <div className="sensor-pair-icon-area">
                    {phase === 'success' ? (
                        <div className="sensor-pair-success-icon">
                            <CheckCircle size={64} />
                        </div>
                    ) : (
                        <div className={`sensor-pair-pulse ${phase}`}>
                            <div className="pulse-ring ring-1" />
                            <div className="pulse-ring ring-2" />
                            <div className="pulse-ring ring-3" />
                            <div className="sensor-pair-bt-icon">
                                <Bluetooth size={40} />
                            </div>
                        </div>
                    )}
                </div>

                <h2 className="sensor-pair-title">{statusText[phase]}</h2>
                <p className="sensor-pair-subtitle">{statusSub[phase]}</p>

                {phase === 'found' && (
                    <div className="sensor-pair-device">
                        <Wifi size={16} />
                        <span>Plantasia Sensor v2</span>
                        <span className="sensor-pair-signal">Strong Signal</span>
                    </div>
                )}

                {phase === 'success' && (
                    <button className="sensor-pair-done-btn" onClick={handleClose}>
                        Let's Go!
                    </button>
                )}

                <button className="sensor-pair-skip" onClick={handleClose}>
                    {phase === 'success' ? '' : 'Skip for Now'}
                </button>
            </div>
        </div>
    );
}
