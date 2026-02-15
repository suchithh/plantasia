// Plantasia: Guardians — High Fidelity 3D Plant Character Model
import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { PlantCharacter } from '../../types';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { damp } from '../../utils/animationUtils'; // Smooth damping utility

interface PlantModelProps {
    plant: PlantCharacter;
    onClick: () => void;
}

const statusColors: Record<string, string> = {
    healthy: '#4ADE80',
    threatened: '#FBBF24',
    in_battle: '#F87171',
    damaged: '#9CA3AF',
    dead: '#6B7280',
};

const personalityInitial: Record<string, string> = {
    dramatic: 'D',
    chill: 'C',
    anxious: 'A',
    wise: 'W',
    cheerful: 'Ch',
};

// --- Procedural Geometry Generators ---

// Create a curved identifying pot profile using LatheGeometry
function createPotGeometry() {
    const points = [];
    // Base
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(0.3, 0));
    // Curved body
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const x = 0.3 + Math.sin(t * Math.PI) * 0.1; // Bulge out
        const y = t * 0.45;
        points.push(new THREE.Vector2(x, y));
    }
    // Rim
    points.push(new THREE.Vector2(0.42, 0.45));
    points.push(new THREE.Vector2(0.42, 0.5));
    points.push(new THREE.Vector2(0.35, 0.5));
    points.push(new THREE.Vector2(0.35, 0.45)); // Inner lip

    return new THREE.LatheGeometry(points, 32);
}

// Create a realistic leaf shape for ExtrudeGeometry
function createLeafShape() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    // Left side curve
    shape.bezierCurveTo(-0.1, 0.1, -0.2, 0.3, 0, 0.6);
    // Right side curve
    shape.bezierCurveTo(0.2, 0.3, 0.1, 0.1, 0, 0);
    return shape;
}

// Create a swaying stem curve
function createStemCurve(height: number = 1.0, bent: number = 0) {
    return new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(bent * 0.2, height * 0.3, 0),
        new THREE.Vector3(-bent * 0.1, height * 0.6, 0),
        new THREE.Vector3(0, height, 0),
    ]);
}

// Premium floating text texture
function createNameTexture(name: string, _initial: string, statusColor: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 120; // Taller for better layout
    const ctx = canvas.getContext('2d')!;

    // Setup text
    ctx.font = '700 48px "Noto Serif", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Dark outline
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.strokeText(name, 256, 50);

    // White fill with soft glow
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(name, 256, 50);

    // Elegant underline
    const textWidth = ctx.measureText(name).width;
    ctx.fillStyle = statusColor;
    ctx.globalAlpha = 0.8;
    ctx.shadowColor = statusColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(256 - textWidth / 2 - 10, 85, textWidth + 20, 6, 3);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}


function HappyParticles({ position }: { position: [number, number, number] }) {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        const t = clock.getElapsedTime();
        groupRef.current.children.forEach((child, i) => {
            child.position.y = 1.5 + Math.sin(t * 2 + i) * 0.2 + (i * 0.1);
            child.position.x = Math.sin(t * 3 + i * 2) * 0.3;
            child.scale.setScalar(0.1 + Math.sin(t * 4 + i) * 0.05);
        });
    });

    return (
        <group ref={groupRef} position={position}>
            {[0, 1, 2, 3].map((i) => (
                <mesh key={i} position={[0, 0, 0]}>
                    <planeGeometry args={[0.3, 0.3]} />
                    <meshBasicMaterial
                        color="#F472B6"
                        transparent
                        opacity={0.8}
                        side={THREE.DoubleSide}
                        map={useMemo(() => {
                            const canvas = document.createElement('canvas');
                            canvas.width = 64; canvas.height = 64;
                            const ctx = canvas.getContext('2d')!;
                            ctx.fillStyle = '#FFFFFF';
                            ctx.beginPath();
                            // Heart shape
                            ctx.moveTo(32, 20);
                            ctx.bezierCurveTo(32, 17, 28, 10, 16, 10);
                            ctx.bezierCurveTo(0, 10, 0, 27.5, 0, 27.5);
                            ctx.bezierCurveTo(0, 40, 16, 52, 32, 60);
                            ctx.bezierCurveTo(48, 52, 64, 40, 64, 27.5);
                            ctx.bezierCurveTo(64, 27.5, 64, 10, 48, 10);
                            ctx.bezierCurveTo(38, 10, 32, 17, 32, 20);
                            ctx.fill();
                            return new THREE.CanvasTexture(canvas);
                        }, [])}
                    />
                </mesh>
            ))}
        </group>
    );
}

export function PlantModel({ plant, onClick }: PlantModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const leavesRef = useRef<THREE.Group>(null);

    // Animation Refs for dampening
    const currentScale = useRef(1);
    const currentRotZ = useRef(0);
    const currentPosY = useRef(0);

    const color = statusColors[plant.healthStatus] || plant.avatarColor;
    const isDead = plant.healthStatus === 'dead';
    const isThreatened = plant.healthStatus === 'threatened';
    const inBattle = plant.healthStatus === 'in_battle';
    const isHealthy = plant.healthStatus === 'healthy';

    // Geometry Memos
    const potGeometry = useMemo(() => createPotGeometry(), []);
    const leafGeometry = useMemo(() => new THREE.ExtrudeGeometry(createLeafShape(), { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 }), []);
    const stemCurve = useMemo(() => createStemCurve(0.8, -0.2), []); // Slight natural bend
    const stemGeometry = useMemo(() => new THREE.TubeGeometry(stemCurve, 20, 0.04, 8, false), [stemCurve]);

    const nameTexture = useMemo(() => {
        const initial = personalityInitial[plant.personality.type] || 'P';
        return createNameTexture(plant.nickname, initial, color);
    }, [plant.nickname, plant.personality.type, color]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const t = state.clock.getElapsedTime();
        let targetScale = 1;
        let targetRotZ = 0;
        let targetPosY = 0;

        // --- State Dependent Targets ---
        if (isDead) {
            targetRotZ = 0.3; // Slumped
        } else if (plant.activeReaction === 'bounce') {
            targetPosY = Math.abs(Math.sin(t * 12)) * 0.4;
            targetScale = 1 + Math.sin(t * 20) * 0.15;
        } else if (plant.activeReaction === 'shake' || isThreatened) {
            targetRotZ = Math.sin(t * 25) * 0.15;
        } else if (plant.activeReaction === 'wiggle') {
            targetRotZ = Math.sin(t * 8) * 0.1;
        } else if (inBattle) {
            targetScale = 1.1 + Math.sin(t * 5) * 0.05; // Pulsing
        } else {
            // Idle breathing
            targetScale = 1 + Math.sin(t * 1.5) * 0.03;
            targetRotZ = Math.sin(t * 0.8) * 0.02;
        }

        // --- Smooth Damping ---
        currentScale.current = damp(currentScale.current, targetScale, 8, delta);
        currentRotZ.current = damp(currentRotZ.current, targetRotZ, 8, delta);
        currentPosY.current = damp(currentPosY.current, targetPosY, 10, delta); // Snappier Y for bounce

        // Apply transformations
        groupRef.current.scale.setScalar(currentScale.current);
        groupRef.current.rotation.z = currentRotZ.current;
        groupRef.current.position.y = currentPosY.current;


        // Secondary animations
        if (headRef.current && !isDead) {
            // Head tracks mouse slightly or just bobs
            headRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
            headRef.current.rotation.x = Math.sin(t * 0.7) * 0.05;
        }

        if (leavesRef.current && !isDead) {
            leavesRef.current.rotation.y = Math.cos(t * 0.3) * 0.05;
        }
    });

    return (
        <group
            ref={groupRef}
            position={[plant.position.x, 0, plant.position.z]}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
                useGameStore.getState().triggerQuestAction('interaction', 'plant_tap');
            }}
        >
            {/* Shadow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <circleGeometry args={[0.45, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.2} />
            </mesh>

            {/* Pot */}
            <mesh geometry={potGeometry} castShadow receiveShadow>
                <meshStandardMaterial color="#C2845A" roughness={0.6} />
            </mesh>
            {/* Soil */}
            <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.32, 16]} />
                <meshStandardMaterial color="#3E2723" roughness={1} />
            </mesh>

            {/* Plant Structure */}
            <group position={[0, 0.4, 0]}>
                {/* Stem */}
                <mesh geometry={stemGeometry} castShadow>
                    <meshStandardMaterial color={isDead ? '#8D6E63' : '#4CAF50'} roughness={0.7} />
                </mesh>

                {/* Leaves - arranged spirally */}
                <group ref={leavesRef}>
                    {[0.2, 0.4, 0.6].map((h, i) => (
                        <group key={i} position={[0, 0.2 + h, 0]} rotation={[0, i * 2.5, 0]}>
                            <mesh
                                geometry={leafGeometry}
                                position={[0.05, 0, 0]}
                                rotation={[0.5, 0, -0.5]}
                                castShadow
                            >
                                <meshStandardMaterial
                                    color={isDead ? '#A1887F' : '#66BB6A'}
                                    roughness={0.6}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>
                        </group>
                    ))}
                </group>

                {/* Head / Flower */}
                <group ref={headRef} position={[0, 0.85, 0]}>
                    <mesh castShadow>
                        <sphereGeometry args={[0.3, 32, 32]} />
                        <meshStandardMaterial
                            color={isDead ? '#BCAAA4' : color}
                            emissive={inBattle ? '#F44336' : color}
                            emissiveIntensity={inBattle ? 0.4 : 0.1}
                            roughness={0.4}
                        />
                    </mesh>

                    {/* Face Details */}
                    {!isDead && (
                        <group position={[0, 0, 0.26]} scale={0.8}>
                            {/* Eyes */}
                            <group position={[0, 0.05, 0]}>
                                <mesh position={[-0.12, 0, 0]}>
                                    <capsuleGeometry args={[0.04, 0.06, 4, 8]} />
                                    <meshStandardMaterial color="#212121" />
                                </mesh>
                                <mesh position={[0.12, 0, 0]}>
                                    <capsuleGeometry args={[0.04, 0.06, 4, 8]} />
                                    <meshStandardMaterial color="#212121" />
                                </mesh>
                                {/* Shine */}
                                <mesh position={[-0.1, 0.04, 0.035]}>
                                    <sphereGeometry args={[0.015, 8, 8]} />
                                    <meshBasicMaterial color="#FFFFFF" />
                                </mesh>
                                <mesh position={[0.14, 0.04, 0.035]}>
                                    <sphereGeometry args={[0.015, 8, 8]} />
                                    <meshBasicMaterial color="#FFFFFF" />
                                </mesh>
                            </group>

                            {/* Mouth */}
                            <group position={[0, -0.1, 0]}>
                                {isHealthy && (
                                    <mesh rotation={[0, 0, 0]}>
                                        <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
                                        <meshStandardMaterial color="#212121" />
                                    </mesh>
                                )}
                                {isThreatened && (
                                    <mesh>
                                        <ringGeometry args={[0.03, 0.05, 16]} />
                                        <meshStandardMaterial color="#212121" />
                                    </mesh>
                                )}
                                {inBattle && (
                                    <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0]}>
                                        <boxGeometry args={[0.12, 0.02, 0.01]} />
                                        <meshStandardMaterial color="#212121" />
                                    </mesh>
                                )}
                            </group>

                            {/* Blush */}
                            {isHealthy && plant.happiness > 50 && (
                                <>
                                    <mesh position={[-0.18, -0.05, -0.02]}>
                                        <circleGeometry args={[0.05, 16]} />
                                        <meshBasicMaterial color="#FF8A80" transparent opacity={0.5} />
                                    </mesh>
                                    <mesh position={[0.18, -0.05, -0.02]}>
                                        <circleGeometry args={[0.05, 16]} />
                                        <meshBasicMaterial color="#FF8A80" transparent opacity={0.5} />
                                    </mesh>
                                </>
                            )}
                        </group>
                    )}

                    {/* Dead Face (X eyes) */}
                    {isDead && (
                        <group position={[0, 0, 0.28]} scale={0.8}>
                            <group position={[-0.12, 0.05, 0]} rotation={[0, 0, Math.PI / 4]}>
                                <mesh>
                                    <boxGeometry args={[0.1, 0.02, 0.01]} />
                                    <meshStandardMaterial color="#4E342E" />
                                </mesh>
                                <mesh rotation={[0, 0, Math.PI / 2]}>
                                    <boxGeometry args={[0.1, 0.02, 0.01]} />
                                    <meshStandardMaterial color="#4E342E" />
                                </mesh>
                            </group>
                            <group position={[0.12, 0.05, 0]} rotation={[0, 0, Math.PI / 4]}>
                                <mesh>
                                    <boxGeometry args={[0.1, 0.02, 0.01]} />
                                    <meshStandardMaterial color="#4E342E" />
                                </mesh>
                                <mesh rotation={[0, 0, Math.PI / 2]}>
                                    <boxGeometry args={[0.1, 0.02, 0.01]} />
                                    <meshStandardMaterial color="#4E342E" />
                                </mesh>
                            </group>
                        </group>
                    )}

                    {/* Shield Effect */}
                    {plant.shieldStrength > 30 && !isDead && (
                        <mesh scale={1.2}>
                            <sphereGeometry args={[0.35, 32, 32]} />
                            <meshStandardMaterial
                                color="#29B6F6"
                                transparent
                                opacity={0.3}
                                depthWrite={false}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    )}
                </group>
            </group>

            {/* Emotions / Particles */}
            {(isHealthy && plant.happiness > 80) || plant.activeReaction === 'heart' ? (
                <HappyParticles position={[0, 1.2, 0]} />
            ) : null}

            {/* Name Tag */}
            <sprite position={[0, 1.8, 0]} scale={[2.5, 0.6, 1]}>
                <spriteMaterial map={nameTexture} transparent sizeAttenuation={true} depthTest={false} />
            </sprite>
        </group>
    );
}
