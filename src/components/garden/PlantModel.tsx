// Plantasia: Guardians — 3D Plant Character Model
// Uses only Three.js primitives — no drei Html (avoids crash with orthographic + drei v10)
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { PlantCharacter } from '../../types';
import * as THREE from 'three';

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

// Create a canvas-based sprite texture for the name tag
function createNameTexture(name: string, emoji: string, statusColor: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // Background pill with gradient
    const gradient = ctx.createLinearGradient(10, 0, 290, 0);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(10, 8, 280, 64, 32);
    ctx.fill();

    // Colored accent bar
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = statusColor;
    ctx.beginPath();
    ctx.roundRect(10, 8, 8, 64, [32, 0, 0, 32]);
    ctx.fill();

    // Text
    ctx.font = 'bold 30px Nunito, sans-serif';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${emoji} ${name}`, 155, 42);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

const personalityEmoji: Record<string, string> = {
    dramatic: '🎭',
    chill: '😎',
    anxious: '😰',
    wise: '🧙',
    cheerful: '✨',
};

// Floating hearts when happy
function HappyParticles({ position }: { position: [number, number, number] }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current) {
            const t = performance.now() * 0.001;
            groupRef.current.children.forEach((child, i) => {
                child.position.y = 1.2 + Math.sin(t * 2 + i) * 0.15;
                child.rotation.z = Math.sin(t * 3 + i * 0.5) * 0.2;
            });
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {[0, 1, 2].map((i) => (
                <sprite key={i} position={[Math.sin(i * 2.1) * 0.4, 1.2 + i * 0.1, Math.cos(i * 2.1) * 0.4]} scale={[0.15, 0.15, 1]}>
                    <spriteMaterial color="#F472B6" transparent opacity={0.8} />
                </sprite>
            ))}
        </group>
    );
}

export function PlantModel({ plant, onClick }: PlantModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const leafRef = useRef<THREE.Group>(null);
    const eyeRef = useRef<THREE.Group>(null);

    const color = statusColors[plant.healthStatus] || plant.avatarColor;
    const isDead = plant.healthStatus === 'dead';
    const isThreatened = plant.healthStatus === 'threatened';
    const inBattle = plant.healthStatus === 'in_battle';
    const isHealthy = plant.healthStatus === 'healthy';

    // Memoize the name tag texture
    const nameTexture = useMemo(() => {
        const emoji = personalityEmoji[plant.personality.type] || '🌱';
        return createNameTexture(plant.nickname, emoji, color);
    }, [plant.nickname, plant.personality.type, color]);

    useFrame(() => {
        if (!groupRef.current) return;
        const t = performance.now() * 0.001;

        if (isDead) {
            groupRef.current.rotation.z += (0.3 - groupRef.current.rotation.z) * 0.02;
        } else if (isThreatened) {
            groupRef.current.rotation.z = Math.sin(t * 6) * 0.08;
            groupRef.current.position.y = Math.sin(t * 8) * 0.02;
        } else if (inBattle) {
            const scale = 1 + Math.sin(t * 8) * 0.05;
            groupRef.current.scale.setScalar(scale);
        } else {
            const breathe = 1 + Math.sin(t * 2) * 0.02;
            groupRef.current.scale.set(breathe, breathe, breathe);
            groupRef.current.rotation.z = Math.sin(t * 1) * 0.015;
        }

        if (leafRef.current && !isDead) {
            leafRef.current.rotation.z = Math.sin(t * 1.5) * 0.1;
        }

        // Eye blink
        if (eyeRef.current && !isDead) {
            const blinkCycle = (t * 0.5) % 4;
            const isBlinking = blinkCycle > 3.9;
            eyeRef.current.scale.y = isBlinking ? 0.1 : 1;
        }
    });

    return (
        <group
            ref={groupRef}
            position={[plant.position.x, 0, plant.position.z]}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {/* Shadow on ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
                <circleGeometry args={[0.4, 16]} />
                <meshStandardMaterial color="#000000" transparent opacity={0.15} />
            </mesh>

            {/* Pot - terracotta style */}
            <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.38, 0.28, 0.45, 16]} />
                <meshStandardMaterial color="#C2845A" roughness={0.8} />
            </mesh>
            {/* Pot rim */}
            <mesh position={[0, 0.23, 0]}>
                <torusGeometry args={[0.38, 0.05, 8, 16]} />
                <meshStandardMaterial color="#D4956B" />
            </mesh>
            {/* Soil */}
            <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.34, 0.34, 0.06, 16]} />
                <meshStandardMaterial color="#5C4033" />
            </mesh>

            {/* Stem - thicker and greener */}
            <mesh position={[0, 0.42, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
                <meshStandardMaterial color={isDead ? '#9CA3AF' : '#228B22'} />
            </mesh>

            {/* Plant body - the face lives here */}
            <group position={[0, 0.75, 0]}>
                <mesh castShadow>
                    <sphereGeometry args={[0.38, 20, 20]} />
                    <meshStandardMaterial
                        color={isDead ? '#9CA3AF' : color}
                        emissive={inBattle ? '#F87171' : isHealthy ? color : '#000000'}
                        emissiveIntensity={inBattle ? 0.3 : isHealthy ? 0.1 : 0}
                    />
                </mesh>

                {/* FACE - makes it cute! */}
                {!isDead && (
                    <group position={[0, 0.02, 0.35]}>
                        {/* Eyes */}
                        <group ref={eyeRef}>
                            <mesh position={[-0.1, 0.05, 0]}>
                                <sphereGeometry args={[0.06, 8, 8]} />
                                <meshStandardMaterial color="#1F2937" />
                            </mesh>
                            <mesh position={[0.1, 0.05, 0]}>
                                <sphereGeometry args={[0.06, 8, 8]} />
                                <meshStandardMaterial color="#1F2937" />
                            </mesh>
                            {/* Eye shine */}
                            <mesh position={[-0.08, 0.07, 0.03]}>
                                <sphereGeometry args={[0.02, 6, 6]} />
                                <meshStandardMaterial color="#FFFFFF" />
                            </mesh>
                            <mesh position={[0.12, 0.07, 0.03]}>
                                <sphereGeometry args={[0.02, 6, 6]} />
                                <meshStandardMaterial color="#FFFFFF" />
                            </mesh>
                        </group>

                        {/* Mouth - changes with status */}
                        {isHealthy && (
                            // Happy smile
                            <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0]}>
                                <torusGeometry args={[0.06, 0.015, 8, 12, Math.PI]} />
                                <meshStandardMaterial color="#1F2937" />
                            </mesh>
                        )}
                        {isThreatened && (
                            // Worried O mouth
                            <mesh position={[0, -0.1, 0]}>
                                <sphereGeometry args={[0.04, 8, 8]} />
                                <meshStandardMaterial color="#1F2937" />
                            </mesh>
                        )}
                        {inBattle && (
                            // Determined line
                            <mesh position={[0, -0.1, 0]}>
                                <boxGeometry args={[0.1, 0.02, 0.02]} />
                                <meshStandardMaterial color="#1F2937" />
                            </mesh>
                        )}

                        {/* Blush when happy */}
                        {isHealthy && (
                            <>
                                <mesh position={[-0.15, -0.02, 0]}>
                                    <circleGeometry args={[0.04, 8]} />
                                    <meshStandardMaterial color="#FDA4AF" transparent opacity={0.6} />
                                </mesh>
                                <mesh position={[0.15, -0.02, 0]}>
                                    <circleGeometry args={[0.04, 8]} />
                                    <meshStandardMaterial color="#FDA4AF" transparent opacity={0.6} />
                                </mesh>
                            </>
                        )}

                        {/* Sweat drop when threatened */}
                        {isThreatened && (
                            <mesh position={[0.2, 0.1, 0]}>
                                <sphereGeometry args={[0.025, 6, 6]} />
                                <meshStandardMaterial color="#60A5FA" />
                            </mesh>
                        )}
                    </group>
                )}

                {/* Dead face */}
                {isDead && (
                    <group position={[0, 0.02, 0.35]}>
                        {/* X eyes */}
                        <mesh position={[-0.1, 0.05, 0]} rotation={[0, 0, 0.785]}>
                            <boxGeometry args={[0.08, 0.02, 0.02]} />
                            <meshStandardMaterial color="#1F2937" />
                        </mesh>
                        <mesh position={[-0.1, 0.05, 0]} rotation={[0, 0, -0.785]}>
                            <boxGeometry args={[0.08, 0.02, 0.02]} />
                            <meshStandardMaterial color="#1F2937" />
                        </mesh>
                        <mesh position={[0.1, 0.05, 0]} rotation={[0, 0, 0.785]}>
                            <boxGeometry args={[0.08, 0.02, 0.02]} />
                            <meshStandardMaterial color="#1F2937" />
                        </mesh>
                        <mesh position={[0.1, 0.05, 0]} rotation={[0, 0, -0.785]}>
                            <boxGeometry args={[0.08, 0.02, 0.02]} />
                            <meshStandardMaterial color="#1F2937" />
                        </mesh>
                    </group>
                )}
            </group>

            {/* Leaves - more dynamic */}
            <group ref={leafRef} position={[0, 0.72, 0]}>
                {[0, 1.2, 2.4, 3.6, 5].map((angle, i) => (
                    <group key={i}>
                        <mesh
                            position={[
                                Math.cos(angle) * 0.32,
                                0.15 + i * 0.05,
                                Math.sin(angle) * 0.32
                            ]}
                            rotation={[0.4, angle, 0.3]}
                        >
                            <coneGeometry args={[0.1, 0.3, 4]} />
                            <meshStandardMaterial
                                color={isDead ? '#9CA3AF' : '#32CD32'}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                        {/* Leaf vein */}
                        <mesh
                            position={[
                                Math.cos(angle) * 0.35,
                                0.18 + i * 0.05,
                                Math.sin(angle) * 0.35
                            ]}
                            rotation={[0.4, angle, 0.3]}
                        >
                            <cylinderGeometry args={[0.01, 0.01, 0.2, 4]} />
                            <meshStandardMaterial color={isDead ? '#6B7280' : '#228B22'} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Crown/top leaf */}
            <mesh position={[0, 1.15, 0]} rotation={[0.2, 0, 0]}>
                <coneGeometry args={[0.08, 0.2, 4]} />
                <meshStandardMaterial color={isDead ? '#9CA3AF' : '#22C55E'} />
            </mesh>

            {/* Shield effect - more magical */}
            {plant.shieldStrength > 30 && !isDead && (
                <group position={[0, 0.7, 0]}>
                    <mesh>
                        <sphereGeometry args={[0.6, 20, 20]} />
                        <meshStandardMaterial
                            color="#38BDF8"
                            transparent
                            opacity={plant.shieldStrength / 300}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    {/* Shield sparkles */}
                    {[0, 1, 2, 3].map((i) => (
                        <mesh key={i} position={[
                            Math.cos(i * 1.57) * 0.55,
                            Math.sin(performance.now() * 0.002 + i) * 0.1,
                            Math.sin(i * 1.57) * 0.55
                        ]}>
                            <sphereGeometry args={[0.03, 6, 6]} />
                            <meshStandardMaterial color="#7DD3FC" emissive="#38BDF8" emissiveIntensity={0.5} />
                        </mesh>
                    ))}
                </group>
            )}

            {/* Happy particles when healthy */}
            {isHealthy && plant.happiness > 70 && (
                <HappyParticles position={[0, 0, 0]} />
            )}

            {/* Dead halo - angel wings */}
            {isDead && (
                <group position={[0, 1.3, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.2, 0.03, 8, 16]} />
                        <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.8} />
                    </mesh>
                    {/* Mini wings */}
                    <mesh position={[-0.25, -0.1, 0]} rotation={[0, 0, 0.3]}>
                        <coneGeometry args={[0.1, 0.2, 4]} />
                        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
                    </mesh>
                    <mesh position={[0.25, -0.1, 0]} rotation={[0, 0, -0.3]}>
                        <coneGeometry args={[0.1, 0.2, 4]} />
                        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
                    </mesh>
                </group>
            )}

            {/* Name tag sprite */}
            <sprite position={[0, 1.55, 0]} scale={[1.4, 0.35, 1]}>
                <spriteMaterial map={nameTexture} transparent depthTest={false} />
            </sprite>
        </group>
    );
}
