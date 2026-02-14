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
function createNameTexture(name: string, emoji: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Background pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    const r = 28;
    ctx.beginPath();
    ctx.roundRect(8, 4, 240, 56, r);
    ctx.fill();

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    // Text
    ctx.shadowColor = 'transparent';
    ctx.font = 'bold 28px Nunito, sans-serif';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${emoji} ${name}`, 128, 34);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

const personalityEmoji: Record<string, string> = {
    dramatic: '🎭',
    chill: '☕',
    anxious: '😰',
    wise: '📚',
    cheerful: '✨',
};

export function PlantModel({ plant, onClick }: PlantModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const leafRef = useRef<THREE.Group>(null);

    const color = statusColors[plant.healthStatus] || plant.avatarColor;
    const isDead = plant.healthStatus === 'dead';
    const isThreatened = plant.healthStatus === 'threatened';
    const inBattle = plant.healthStatus === 'in_battle';

    // Memoize the name tag texture
    const nameTexture = useMemo(() => {
        const emoji = personalityEmoji[plant.personality.type] || '🌱';
        return createNameTexture(plant.nickname, emoji);
    }, [plant.nickname, plant.personality.type]);

    useFrame(() => {
        if (!groupRef.current) return;
        const t = performance.now() * 0.001;

        if (isDead) {
            groupRef.current.rotation.z += (0.3 - groupRef.current.rotation.z) * 0.02;
        } else if (isThreatened) {
            groupRef.current.rotation.z = Math.sin(t * 4) * 0.05;
        } else if (inBattle) {
            const scale = 1 + Math.sin(t * 6) * 0.03;
            groupRef.current.scale.setScalar(scale);
        } else {
            const breathe = 1 + Math.sin(t * 1.5) * 0.015;
            groupRef.current.scale.set(breathe, breathe, breathe);
            groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.01;
        }

        if (leafRef.current && !isDead) {
            leafRef.current.rotation.z = Math.sin(t * 1.2) * 0.08;
        }
    });

    return (
        <group
            ref={groupRef}
            position={[plant.position.x, 0, plant.position.z]}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {/* Pot */}
            <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.35, 0.25, 0.4, 16]} />
                <meshStandardMaterial color="#C2845A" />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.38, 0.35, 0.06, 16]} />
                <meshStandardMaterial color="#D4956B" />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
                <cylinderGeometry args={[0.32, 0.32, 0.04, 16]} />
                <meshStandardMaterial color="#5C4033" />
            </mesh>

            {/* Stem */}
            <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.04, 0.06, 0.35, 8]} />
                <meshStandardMaterial color={isDead ? '#9CA3AF' : '#2D7A3A'} />
            </mesh>

            {/* Plant body */}
            <mesh position={[0, 0.7, 0]} castShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial
                    color={isDead ? '#9CA3AF' : color}
                    emissive={inBattle ? '#F87171' : '#000000'}
                    emissiveIntensity={inBattle ? 0.2 : 0}
                />
            </mesh>

            {/* Leaves */}
            <group ref={leafRef} position={[0, 0.65, 0]}>
                {[0, 1.2, 2.4, 3.6, 5].map((angle, i) => (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * 0.3,
                            0.1 + i * 0.06,
                            Math.sin(angle) * 0.3
                        ]}
                        rotation={[0.3, angle, 0.2]}
                    >
                        <coneGeometry args={[0.08, 0.25, 4]} />
                        <meshStandardMaterial
                            color={isDead ? '#9CA3AF' : '#3CB371'}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}
            </group>

            {/* Shield effect */}
            {plant.shieldStrength > 30 && !isDead && (
                <mesh position={[0, 0.6, 0]}>
                    <sphereGeometry args={[0.55, 16, 16]} />
                    <meshStandardMaterial
                        color="#38BDF8"
                        transparent
                        opacity={plant.shieldStrength / 400}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Dead halo */}
            {isDead && (
                <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.2, 0.03, 8, 16]} />
                    <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.5} />
                </mesh>
            )}

            {/* Name tag sprite (canvas texture — no Html!) */}
            <sprite position={[0, 1.35, 0]} scale={[1.2, 0.3, 1]}>
                <spriteMaterial map={nameTexture} transparent depthTest={false} />
            </sprite>
        </group>
    );
}
