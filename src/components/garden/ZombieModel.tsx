// Plantasia: Guardians — 3D Zombie Character Model
// Uses only Three.js primitives — no drei Html
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ZombieEnemy } from '../../types';
import * as THREE from 'three';

interface ZombieModelProps {
    zombie: ZombieEnemy;
    onClick: () => void;
}

function createZombieNameTexture(name: string, emoji: string, color: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Background pill with zombie color tint
    ctx.fillStyle = color + '33';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    const r = 28;
    ctx.beginPath();
    ctx.roundRect(8, 4, 240, 56, r);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${emoji} ${name}`, 128, 34);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function ZombieModel({ zombie, onClick }: ZombieModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const armLeftRef = useRef<THREE.Mesh>(null);
    const armRightRef = useRef<THREE.Mesh>(null);

    const nameTexture = useMemo(
        () => createZombieNameTexture(zombie.name, zombie.emoji, zombie.color),
        [zombie.name, zombie.emoji, zombie.color]
    );

    useFrame(() => {
        if (!groupRef.current) return;
        const t = performance.now() * 0.001;

        if (zombie.state === 'defeated') {
            groupRef.current.position.y += (-1 - groupRef.current.position.y) * 0.03;
            groupRef.current.rotation.z += (0.5 - groupRef.current.rotation.z) * 0.03;
            return;
        }

        groupRef.current.position.y = Math.sin(t * 3) * 0.05;
        groupRef.current.rotation.z = Math.sin(t * 2) * 0.06;

        if (armLeftRef.current) armLeftRef.current.rotation.x = Math.sin(t * 3) * 0.3;
        if (armRightRef.current) armRightRef.current.rotation.x = Math.sin(t * 3 + Math.PI) * 0.3;
    });

    const color = zombie.color;

    return (
        <group
            ref={groupRef}
            position={[zombie.position.x, 0, zombie.position.z]}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {/* Body */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.95, 0]} castShadow>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Eyes */}
            <mesh position={[-0.08, 1, 0.18]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[0.08, 1.02, 0.18]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[-0.08, 1, 0.24]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#1F2937" />
            </mesh>
            <mesh position={[0.08, 1.02, 0.24]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="#1F2937" />
            </mesh>

            {/* Mouth */}
            <mesh position={[0, 0.88, 0.2]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[0.12, 0.04, 0.02]} />
                <meshStandardMaterial color="#1F2937" />
            </mesh>

            {/* Arms */}
            <mesh ref={armLeftRef} position={[-0.35, 0.55, 0.1]} rotation={[0.5, 0, 0.3]}>
                <cylinderGeometry args={[0.04, 0.035, 0.35, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh ref={armRightRef} position={[0.35, 0.55, 0.1]} rotation={[0.5, 0, -0.3]}>
                <cylinderGeometry args={[0.04, 0.035, 0.35, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Legs */}
            <mesh position={[-0.1, 0.12, 0]}>
                <cylinderGeometry args={[0.06, 0.05, 0.25, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.1, 0.12, 0]}>
                <cylinderGeometry args={[0.06, 0.05, 0.25, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Type accents */}
            {zombie.type === 'drownface' && (
                <>
                    {[0, 1, 2].map(i => (
                        <mesh key={i} position={[Math.sin(i * 2) * 0.2, 0.7 + i * 0.15, Math.cos(i) * 0.15]}>
                            <sphereGeometry args={[0.03, 6, 6]} />
                            <meshStandardMaterial color="#93C5FD" transparent opacity={0.7} />
                        </mesh>
                    ))}
                </>
            )}

            {zombie.type === 'fungus_phil' && (
                <mesh position={[0, 1.2, 0]}>
                    <coneGeometry args={[0.18, 0.15, 8]} />
                    <meshStandardMaterial color="#C084FC" />
                </mesh>
            )}

            {zombie.type === 'sunscorch' && (
                <>
                    {[0, 1, 2].map(i => (
                        <mesh key={i} position={[Math.sin(i * 2.5) * 0.15, 1.2 + i * 0.08, Math.cos(i * 1.5) * 0.1]}>
                            <coneGeometry args={[0.04, 0.12, 4]} />
                            <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={0.5} />
                        </mesh>
                    ))}
                </>
            )}

            {/* Name tag sprite */}
            <sprite position={[0, 1.4, 0]} scale={[1.2, 0.3, 1]}>
                <spriteMaterial map={nameTexture} transparent depthTest={false} />
            </sprite>
        </group>
    );
}
