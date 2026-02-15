// Plantasia: Guardians — Scan View (Webcam + Plant ID)
import { useRef, useState, useCallback, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { identifyPlant, generatePersonality } from '../../services/gemini';
import { getNextAvailableSlot } from '../../services/mockData';
import type { PlantCharacter } from '../../types';
import {
    Camera,
    ScanSearch,
    Sprout,
    Leaf,
    PartyPopper,
    Plus,
    Coins,
    X,
    Sparkles,
    Check
} from 'lucide-react';

type ScanState = 'camera' | 'capturing' | 'identifying' | 'naming' | 'done';

export function ScanView({ mode = 'new_plant' }: { mode?: 'new_plant' | 'victory' }) {
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const addPlant = useGameStore(s => s.addPlant);
    const addCoins = useGameStore(s => s.addCoins);
    const plants = useGameStore(s => s.plants);
    const defeatZombie = useGameStore(s => s.defeatZombie);
    const zombies = useGameStore(s => s.zombies);
    const activeZombie = zombies.find(z => z.state !== 'defeated');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scanState, setScanState] = useState<ScanState>('camera');
    const [identResult, setIdentResult] = useState<any>(null);
    const [personalityResult, setPersonalityResult] = useState<any>(null);
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const streamRef = useRef<MediaStream | null>(null);

    // Start webcam
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: 640, height: 480 },
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setError('Could not access camera. Please allow camera permissions.');
            }
        };
        startCamera();

        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const handleCapture = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setScanState('capturing');
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        setScanState('identifying');

        if (mode === 'victory') {
            // VICTORY FLOW
            try {
                // 1. Simulate "Analyzing..." delay (5-8 seconds)
                const delay = 5000 + Math.random() * 3000;
                await new Promise(r => setTimeout(r, delay));

                // 2. Trigger defeat & Complete Quest
                if (activeZombie) {
                    // Find active battle quest
                    const quests = useGameStore.getState().quests;
                    const battleQuest = quests.find(q => q.active && q.type === 'battle' && q.zombieId === activeZombie.id);

                    // Complete quest FIRST (so quest_completed event happens before zombie_defeated)
                    if (battleQuest) {
                        useGameStore.getState().completeQuest(battleQuest.id);
                    }

                    // Then defeat zombie (triggers zombie_defeated event LAST)
                    defeatZombie(activeZombie.id);
                }

                // 3. Close panel (ZombieEncounter will handle the alert)
                setActivePanel('none');
            } catch (e) {
                console.error(e);
            }
            return;
        }

        // Demo fallback for Bird's Nest Fern
        const demoFallbackIdent = {
            species: 'Asplenium nidus',
            commonName: "Bird's Nest Fern",
            confidence: 0.94,
            careLevel: 'moderate' as const,
        };
        const demoFallbackPersonality = {
            suggestedName: 'Princess Finn',
            personality: {
                type: 'dramatic' as const,
                quirks: ['Throws tantrums when thirsty', 'Loves humidity gossip', 'Faints at direct sunlight'],
                speakingStyle: 'Over-the-top dramatic royalty who speaks in proclamations',
            },
        };

        try {
            // SIMULATED DELAY FOR DEMO
            await new Promise(r => setTimeout(r, 2500));

            // Plant ID
            // const ident = await identifyPlant(base64);
            // setIdentResult(ident);

            // Generate personality
            // const personality = await generatePersonality(ident.species, ident.commonName);
            // setPersonalityResult(personality);
            // setNickname(personality.suggestedName);

            // FORCE DEMO FALLBACK
            setIdentResult(demoFallbackIdent);
            setPersonalityResult(demoFallbackPersonality);
            setNickname(demoFallbackPersonality.suggestedName);

            setScanState('naming');
        } catch (err) {
            // Fallback: use hardcoded Bird's Nest Fern for demo
            console.log('Gemini ID failed, using demo fallback (Bird\'s Nest Fern)');
            setIdentResult(demoFallbackIdent);
            setPersonalityResult(demoFallbackPersonality);
            setNickname(demoFallbackPersonality.suggestedName);
            setScanState('naming');
        }
    }, [mode, activeZombie, defeatZombie, setActivePanel]);

    const handleConfirm = () => {
        if (!identResult || !personalityResult) return;

        const { plants, gardenSize } = useGameStore.getState();
        const slot = getNextAvailableSlot(plants.map(p => p.position), gardenSize);
        if (!slot) {
            setError('Garden is full! (9 plants max)');
            return;
        }

        const personalityColors = ['#22C55E', '#059669', '#A855F7', '#3B82F6', '#F59E0B', '#EC4899'];
        const newPlant: PlantCharacter = {
            id: `plant_${Date.now()}`,
            species: identResult.species,
            commonName: identResult.commonName,
            nickname: nickname || personalityResult.suggestedName,
            personality: personalityResult.personality,
            mood: 'happy' as const,
            avatarColor: personalityColors[Math.floor(Math.random() * personalityColors.length)],
            healthStatus: 'healthy',
            position: slot,
            xp: 0,
            level: 1,
            happiness: 80,
            streak: 0,
            shieldStrength: 0,
            createdAt: new Date().toISOString(),
        };

        addPlant(newPlant);
        addCoins(100);
        setScanState('done');

        setTimeout(() => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            setActivePanel('sensor_pair');
        }, 2000);
    };

    const handleClose = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        setActivePanel('none');
    };

    const headerTitle = mode === 'victory' ? "Victory Scan" : "Add New Plant";
    const headerSubtitle = mode === 'victory' ? "Confirm the area is safe" : "Scan your real plant to bring it into the game!";

    return (
        <div className="checkin-overlay">
            {/* Close Button */}
            <button className="checkin-close-fab" onClick={handleClose}>
                <X size={24} />
            </button>

            <div className="checkin-hud">
                <div className="checkin-header">
                    <h2>{headerTitle}</h2>
                    <p>{headerSubtitle}</p>
                </div>

                <div className="checkin-camera-frame">
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {scanState === 'camera' && (
                        <>
                            <video ref={videoRef} className="checkin-video" autoPlay playsInline muted />
                            <div className="camera-guide-overlay">
                                <div className="guide-corners" />
                                <div className="guide-text">
                                    <Camera size={20} />
                                    <span>Point at your plant</span>
                                </div>
                            </div>
                        </>
                    )}

                    {(scanState === 'capturing' || scanState === 'identifying') && (
                        <div className="analysis-view" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="analysis-status">
                                <ScanSearch size={24} className="spin-slow" />
                                <span>{mode === 'victory' ? "Verifying Health..." : "Identifying..."}</span>
                            </div>
                        </div>
                    )}

                    {scanState === 'done' && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(52, 211, 153, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <PartyPopper size={48} color="white" />
                            <h3 style={{ color: 'white', marginTop: 10, fontFamily: 'var(--font-heading)' }}>Success!</h3>
                        </div>
                    )}
                </div>

                {/* Controls - Only show when in camera mode */}
                {scanState === 'camera' && (
                    <div className="checkin-controls">
                        <button className="capture-btn-large" onClick={handleCapture}>
                            <div className="capture-inner" />
                        </button>
                    </div>
                )}

                {/* Scan Results (Naming) */}
                {scanState === 'naming' && identResult && personalityResult && (
                    <div className="scan-result-glass">
                        <Leaf size={32} color="#4ADE80" style={{ marginBottom: 10 }} />
                        <h3>{identResult.commonName}</h3>
                        <div className="scan-species-tag">{identResult.species}</div>

                        <div style={{ marginTop: 20 }}>
                            <label style={{ display: 'block', textAlign: 'left', marginBottom: 8, fontWeight: 600, fontSize: '0.9rem' }}>Name your friend:</label>
                            <input
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                placeholder={personalityResult.suggestedName}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--font-body)',
                                    marginBottom: 8
                                }}
                            />
                        </div>

                        <button className="scan-confirm-btn" onClick={handleConfirm}>
                            Add to Garden
                        </button>
                    </div>
                )}

                {error && (
                    <div className="scan-error-toast">
                        {error}
                        <button onClick={() => setError('')}><X size={14} /></button>
                    </div>
                )}
            </div>
        </div>
    );
}
