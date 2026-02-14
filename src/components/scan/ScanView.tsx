// Plantasia: Guardians — Scan View (Webcam + Plant ID)
import { useRef, useState, useCallback, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { identifyPlant, generatePersonality } from '../../services/gemini';
import { getNextAvailableSlot } from '../../services/mockData';
import type { PlantCharacter } from '../../types';
import { colors } from '../../constants/colors';

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

        const slot = getNextAvailableSlot(plants.map(p => p.position));
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
        <div className="scan-overlay">
            <button className="scan-close-btn" onClick={handleClose}>✕</button>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {scanState === 'camera' && (
                <>
                    <video ref={videoRef} className="scan-video" autoPlay playsInline muted />
                    <div className="scan-guide">📸 Point at your plant</div>
                    <div className="scan-guide-sub">Make sure the plant is well-lit and centered</div>
                    <button className="scan-capture-btn" onClick={handleCapture} />
                </>
            )}

            {scanState === 'capturing' && (
                <div className="scan-guide">📷 Capturing...</div>
            )}

            {scanState === 'identifying' && (
                <div style={{ textAlign: 'center' }}>
                    <div className="scan-identifying-icon">🔍</div>
                    <div className="scan-guide">Identifying your plant...</div>
                    <div className="scan-guide-sub">Our AI botanist is analyzing the photo</div>
                </div>
            )}

            {scanState === 'naming' && identResult && personalityResult && (
                <div className="scan-result-card">
                    <div className="scan-result-emoji">🌿</div>
                    <div className="scan-result-name">
                        {identResult.commonName}
                    </div>
                    <div className="scan-result-species">
                        {identResult.species}
                    </div>
                    <div className={`scan-care-badge ${identResult.careLevel}`}>
                        {identResult.careLevel} care
                    </div>

                    <div className="scan-name-section">
                        <label className="scan-name-label">
                            Name your plant friend:
                        </label>
                        <input
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            className="scan-name-input"
                            placeholder={personalityResult.suggestedName}
                        />
                    </div>

                    <div className="scan-personality-preview">
                        Personality: <strong>{personalityResult.personality.type}</strong>
                        <br />
                        "{personalityResult.personality.speakingStyle}"
                    </div>

                    <button
                        className="action-btn primary"
                        style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                        onClick={handleConfirm}
                    >
                        🌱 Add to Garden (+100 coins)
                    </button>
                </div>
            )}

            {scanState === 'done' && (
                <div style={{ textAlign: 'center' }}>
                    <div className="scan-done-icon">🎉</div>
                    <div className="scan-guide">Welcome to the garden!</div>
                    <div className="scan-guide-sub">+100 coins earned</div>
                </div>
            )}

            {error && (
                <div className="scan-error">
                    {error}
                </div>
            )}
        </div>
    );
}
