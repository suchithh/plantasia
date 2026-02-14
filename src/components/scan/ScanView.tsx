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

export function ScanView() {
    const setActivePanel = useGameStore(s => s.setActivePanel);
    const addPlant = useGameStore(s => s.addPlant);
    const addCoins = useGameStore(s => s.addCoins);
    const plants = useGameStore(s => s.plants);

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

        try {
            // Plant ID
            const ident = await identifyPlant(base64);
            setIdentResult(ident);

            // Generate personality
            const personality = await generatePersonality(ident.species, ident.commonName);
            setPersonalityResult(personality);
            setNickname(personality.suggestedName);

            setScanState('naming');
        } catch (err) {
            setError('Could not identify plant. Try again with better lighting!');
            setScanState('camera');
        }
    }, []);

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
            handleClose();
        }, 2000);
    };

    const handleClose = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        setActivePanel('none');
    };

    return (
        <div className="checkin-overlay">
            <div className="checkin-hud">
                <div className="checkin-header">
                    <h2>Add New Plant</h2>
                    <p>Scan your real plant to bring it into the game!</p>
                </div>

                <div className="checkin-camera-frame">
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {scanState === 'camera' && (
                        <>
                            <video ref={videoRef} className="checkin-video" autoPlay playsInline muted />
                            <div className="camera-guide-overlay">
                                <div className="guide-text">
                                    <Camera size={20} />
                                    <span>Point at your plant</span>
                                </div>
                            </div>
                        </>
                    )}

                    {(scanState === 'capturing' || scanState === 'identifying') && (
                        <div className="analysis-view">
                            <div className="scanner-line" />
                            <div className="analysis-status">
                                <ScanSearch size={24} className="spin-slow" />
                                <span>Identifying plant species...</span>
                            </div>
                        </div>
                    )}

                    {scanState === 'naming' && identResult && personalityResult && (
                        <div className="scan-result-glass">
                            <div className="scan-result-icon"><Leaf size={32} /></div>
                            <h3>{identResult.commonName}</h3>
                            <div className="scan-species-tag">{identResult.species}</div>

                            <div className="scan-name-input-container">
                                <label>Name your friend:</label>
                                <input
                                    value={nickname}
                                    onChange={e => setNickname(e.target.value)}
                                    placeholder={personalityResult.suggestedName}
                                    className="scan-glass-input"
                                />
                            </div>

                            <button className="scan-confirm-btn" onClick={handleConfirm}>
                                <Plus size={18} /> Add to Garden
                            </button>
                        </div>
                    )}

                    {scanState === 'done' && (
                        <div className="analysis-view" style={{ flexDirection: 'column', gap: '16px' }}>
                            <div className="scan-done-icon-large"><PartyPopper size={48} /></div>
                            <h2 style={{ color: '#4ADE80', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Welcome to the Garden!</h2>
                        </div>
                    )}
                </div>

                {/* Controls Area */}
                <div className="checkin-controls">
                    {scanState === 'camera' && (
                        <button className="capture-btn-large" onClick={handleCapture}>
                            <div className="capture-inner" />
                        </button>
                    )}

                    <button className="checkin-close-fab" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

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
