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

// Premium floating text — no bordered pill, colored glow + serif
function createZombieNameTexture(name: string, emoji: string, color: string, threatLevel: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;

    // Colored glow shadow for menacing feel
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 0;

    // Name — bold serif, white with colored glow
    ctx.font = '700 30px "Noto Serif", Georgia, serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${emoji} ${name}`, 180, 28);

    // Second pass with dark shadow for crispness
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fillText(`${emoji} ${name}`, 180, 28);

    // Threat dots — centered beneath name
    ctx.shadowColor = 'transparent';
    const totalWidth = threatLevel * 11;
    const startX = 180 - totalWidth / 2;
    for (let i = 0; i < threatLevel; i++) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(startX + i * 11 + 4, 56, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Particle effect for zombies
function ZombieAura({ color, type }: { color: string, type: string }) {
    const groupRef = useRef<THREE.Group>(null);
    const particleCount = type === 'drownface' ? 8 : type === 'sunscorch' ? 6 : 4;

    useFrame(() => {
        if (groupRef.current) {
            const t = performance.now() * 0.001;
            groupRef.current.children.forEach((child, i) => {
                child.position.y = Math.sin(t * 2 + i * 0.5) * 0.2 + 0.8;
                child.position.x = Math.sin(t + i * 1.2) * 0.3;
                child.position.z = Math.cos(t + i * 1.2) * 0.3;
            });
        }
    });

    const particleColor = type === 'drownface' ? '#60A5FA' : type === 'sunscorch' ? '#FBBF24' : color;

    return (
        <group ref={groupRef}>
            {Array.from({ length: particleCount }).map((_, i) => (
                <mesh key={i} position={[0, 0.8, 0]}>
                    <sphereGeometry args={[0.04, 6, 6]} />
                    <meshStandardMaterial
                        color={particleColor}
                        transparent
                        opacity={0.6}
                        emissive={particleColor}
                        emissiveIntensity={0.3}
                    />
                </mesh>
            ))}
        </group>
    );
}

export function ZombieModel({ zombie, onClick }: ZombieModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const armLeftRef = useRef<THREE.Mesh>(null);
    const armRightRef = useRef<THREE.Mesh>(null);
    const bodyRef = useRef<THREE.Group>(null);

    const nameTexture = useMemo(
        () => createZombieNameTexture(zombie.name, zombie.emoji, zombie.color, zombie.threatLevel),
        [zombie.name, zombie.emoji, zombie.color, zombie.threatLevel]
    );

    useFrame(() => {
        if (!groupRef.current) return;
        const t = performance.now() * 0.001;

        if (zombie.state === 'defeated') {
            groupRef.current.position.y += (-1.5 - groupRef.current.position.y) * 0.05;
            groupRef.current.rotation.z += (1.2 - groupRef.current.rotation.z) * 0.05;
            groupRef.current.scale.lerp(new THREE.Vector3(0.5, 0.5, 0.5), 0.03);
            return;
        }

        // Menacing hover and sway
        groupRef.current.position.y = Math.sin(t * 2.5) * 0.08;
        groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.08;
        groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.05;

        // Body wobble
        if (bodyRef.current) {
            bodyRef.current.rotation.x = Math.sin(t * 3) * 0.05;
        }

        // Creepy arm movements
        if (armLeftRef.current) {
            armLeftRef.current.rotation.x = Math.sin(t * 2) * 0.4 + 0.3;
            armLeftRef.current.rotation.z = Math.sin(t * 1.5) * 0.1 + 0.3;
        }
        if (armRightRef.current) {
            armRightRef.current.rotation.x = Math.sin(t * 2 + Math.PI) * 0.4 + 0.3;
            armRightRef.current.rotation.z = Math.sin(t * 1.5 + Math.PI) * 0.1 - 0.3;
        }
    });

    const color = zombie.color;
    const darkerColor = new THREE.Color(color).multiplyScalar(0.7).getHexString();

    return (
        <group
            ref={groupRef}
            position={[zombie.position.x, 0, zombie.position.z]}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {/* Shadow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
                <circleGeometry args={[0.35, 16]} />
                <meshStandardMaterial color="#000000" transparent opacity={0.2} />
            </mesh>

            {/* Aura effect */}
            <ZombieAura color={color} type={zombie.type} />

            <group ref={bodyRef}>
                {/* Body */}
                <mesh position={[0, 0.55, 0]} castShadow>
                    <sphereGeometry args={[0.32, 16, 16]} />
                    <meshStandardMaterial color={color} roughness={0.6} />
                </mesh>

                {/* Body pattern/belly */}
                <mesh position={[0, 0.52, 0.25]}>
                    <sphereGeometry args={[0.15, 12, 12]} />
                    <meshStandardMaterial color={`#${darkerColor}`} />
                </mesh>

                {/* Head */}
                <mesh position={[0, 0.95, 0]} castShadow>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshStandardMaterial color={color} roughness={0.6} />
                </mesh>

                {/* Angry eyebrows */}
                <mesh position={[-0.1, 1.08, 0.2]} rotation={[0, 0, 0.3]}>
                    <boxGeometry args={[0.12, 0.03, 0.02]} />
                    <meshStandardMaterial color="#1F2937" />
                </mesh>
                <mesh position={[0.1, 1.08, 0.2]} rotation={[0, 0, -0.3]}>
                    <boxGeometry args={[0.12, 0.03, 0.02]} />
                    <meshStandardMaterial color="#1F2937" />
                </mesh>

                {/* Eyes - googly style */}
                <mesh position={[-0.09, 1.0, 0.2]}>
                    <sphereGeometry args={[0.07, 10, 10]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh position={[0.09, 1.02, 0.2]}>
                    <sphereGeometry args={[0.06, 10, 10]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                {/* Pupils - looking menacing */}
                <mesh position={[-0.07, 0.99, 0.26]}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshStandardMaterial color="#1F2937" />
                </mesh>
                <mesh position={[0.11, 1.01, 0.25]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial color="#1F2937" />
                </mesh>
                {/* Red glow in eyes */}
                <mesh position={[-0.06, 0.995, 0.28]}>
                    <sphereGeometry args={[0.012, 6, 6]} />
                    <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.8} />
                </mesh>
                <mesh position={[0.12, 1.015, 0.27]}>
                    <sphereGeometry args={[0.01, 6, 6]} />
                    <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.8} />
                </mesh>

                {/* Mouth - toothy grin */}
                <mesh position={[0, 0.88, 0.22]} rotation={[0.1, 0, 0]}>
                    <boxGeometry args={[0.15, 0.06, 0.03]} />
                    <meshStandardMaterial color="#1F2937" />
                </mesh>
                {/* Teeth */}
                {[-0.05, 0, 0.05].map((x, i) => (
                    <mesh key={i} position={[x, 0.86, 0.24]}>
                        <boxGeometry args={[0.03, 0.04, 0.02]} />
                        <meshStandardMaterial color="#F5F5DC" />
                    </mesh>
                ))}

                {/* Arms */}
                <mesh ref={armLeftRef} position={[-0.38, 0.6, 0.1]} rotation={[0.5, 0, 0.3]}>
                    <cylinderGeometry args={[0.05, 0.04, 0.4, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Left hand */}
                <mesh position={[-0.45, 0.75, 0.25]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>

                <mesh ref={armRightRef} position={[0.38, 0.6, 0.1]} rotation={[0.5, 0, -0.3]}>
                    <cylinderGeometry args={[0.05, 0.04, 0.4, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Right hand */}
                <mesh position={[0.45, 0.75, 0.25]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>

                {/* Legs */}
                <mesh position={[-0.12, 0.15, 0]}>
                    <cylinderGeometry args={[0.07, 0.06, 0.3, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0.12, 0.15, 0]}>
                    <cylinderGeometry args={[0.07, 0.06, 0.3, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Feet */}
                <mesh position={[-0.12, 0.02, 0.05]}>
                    <sphereGeometry args={[0.07, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0.12, 0.02, 0.05]}>
                    <sphereGeometry args={[0.07, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color={color} />
                </mesh>

                {/* TYPE-SPECIFIC FEATURES */}

                {/* Drownface - water droplets and seaweed */}
                {zombie.type === 'drownface' && (
                    <>
                        {[0, 1, 2, 3, 4].map(i => (
                            <mesh key={i} position={[
                                Math.sin(i * 1.3) * 0.25,
                                0.6 + i * 0.12,
                                Math.cos(i * 1.3) * 0.25
                            ]}>
                                <sphereGeometry args={[0.04, 6, 6]} />
                                <meshStandardMaterial color="#93C5FD" transparent opacity={0.8} />
                            </mesh>
                        ))}
                        {/* Seaweed on head */}
                        <mesh position={[-0.15, 1.2, 0]} rotation={[0, 0, 0.3]}>
                            <cylinderGeometry args={[0.02, 0.01, 0.15, 4]} />
                            <meshStandardMaterial color="#059669" />
                        </mesh>
                        <mesh position={[0.1, 1.18, 0.05]} rotation={[0.2, 0, -0.2]}>
                            <cylinderGeometry args={[0.015, 0.01, 0.12, 4]} />
                            <meshStandardMaterial color="#10B981" />
                        </mesh>
                    </>
                )}

                {/* Thirster - cracked/dry appearance */}
                {zombie.type === 'thirster' && (
                    <>
                        {/* Cracks */}
                        {[0, 1, 2].map(i => (
                            <mesh key={i} position={[Math.sin(i * 2) * 0.15, 0.95 + i * 0.05, 0.22]} rotation={[0, 0, i * 0.5]}>
                                <boxGeometry args={[0.08, 0.015, 0.01]} />
                                <meshStandardMaterial color="#78350F" />
                            </mesh>
                        ))}
                        {/* Dust particles */}
                        {[0, 1, 2].map(i => (
                            <mesh key={`dust-${i}`} position={[Math.sin(i) * 0.3, 0.5 + i * 0.2, Math.cos(i) * 0.3]}>
                                <sphereGeometry args={[0.02, 4, 4]} />
                                <meshStandardMaterial color="#D4A574" transparent opacity={0.5} />
                            </mesh>
                        ))}
                    </>
                )}

                {/* Fungus Phil - mushroom cap and spores */}
                {zombie.type === 'fungus_phil' && (
                    <>
                        <mesh position={[0, 1.25, 0]}>
                            <coneGeometry args={[0.22, 0.18, 12]} />
                            <meshStandardMaterial color="#C084FC" />
                        </mesh>
                        {/* Spots on cap */}
                        {[0, 1, 2, 3].map(i => (
                            <mesh key={i} position={[Math.cos(i * 1.5) * 0.12, 1.22, Math.sin(i * 1.5) * 0.12]}>
                                <sphereGeometry args={[0.03, 6, 6]} />
                                <meshStandardMaterial color="#E9D5FF" />
                            </mesh>
                        ))}
                        {/* Spore clouds */}
                        {[0, 1, 2].map(i => (
                            <mesh key={`spore-${i}`} position={[Math.sin(i * 2.5) * 0.35, 1.1, Math.cos(i * 2.5) * 0.35]}>
                                <sphereGeometry args={[0.05, 6, 6]} />
                                <meshStandardMaterial color="#DDD6FE" transparent opacity={0.4} />
                            </mesh>
                        ))}
                    </>
                )}

                {/* Sunscorch - flames on head */}
                {zombie.type === 'sunscorch' && (
                    <>
                        {[0, 1, 2, 3, 4].map(i => (
                            <mesh key={i} position={[
                                Math.sin(i * 1.3) * 0.12,
                                1.2 + i * 0.06,
                                Math.cos(i * 1.3) * 0.08
                            ]}>
                                <coneGeometry args={[0.05 - i * 0.008, 0.15, 4]} />
                                <meshStandardMaterial
                                    color={i % 2 === 0 ? '#F59E0B' : '#EF4444'}
                                    emissive={i % 2 === 0 ? '#F59E0B' : '#EF4444'}
                                    emissiveIntensity={0.6}
                                />
                            </mesh>
                        ))}
                        {/* Heat waves */}
                        <mesh position={[0, 0.8, 0]}>
                            <torusGeometry args={[0.5, 0.02, 4, 12]} />
                            <meshStandardMaterial color="#FCD34D" transparent opacity={0.3} />
                        </mesh>
                    </>
                )}

                {/* The Swarm - bugs everywhere */}
                {zombie.type === 'the_swarm' && (
                    <>
                        {[0, 1, 2, 3, 4, 5, 6].map(i => (
                            <group key={i} position={[
                                Math.sin(i * 0.9) * 0.35,
                                0.7 + Math.sin(i * 1.5) * 0.25,
                                Math.cos(i * 0.9) * 0.35
                            ]}>
                                <mesh>
                                    <sphereGeometry args={[0.03, 6, 6]} />
                                    <meshStandardMaterial color="#1F2937" />
                                </mesh>
                                {/* Bug wings */}
                                <mesh position={[-0.02, 0.01, 0]} rotation={[0, 0, 0.5]}>
                                    <circleGeometry args={[0.02, 4]} />
                                    <meshStandardMaterial color="#D1FAE5" transparent opacity={0.6} side={THREE.DoubleSide} />
                                </mesh>
                                <mesh position={[0.02, 0.01, 0]} rotation={[0, 0, -0.5]}>
                                    <circleGeometry args={[0.02, 4]} />
                                    <meshStandardMaterial color="#D1FAE5" transparent opacity={0.6} side={THREE.DoubleSide} />
                                </mesh>
                            </group>
                        ))}
                    </>
                )}

                {/* Neglecto - ghostly/faded */}
                {zombie.type === 'neglecto' && (
                    <>
                        {/* Chains */}
                        {[0, 1, 2].map(i => (
                            <mesh key={i} position={[Math.sin(i * 2) * 0.25, 0.4 + i * 0.1, Math.cos(i * 2) * 0.25]}>
                                <torusGeometry args={[0.06, 0.015, 4, 8]} />
                                <meshStandardMaterial color="#6B7280" metalness={0.8} roughness={0.2} />
                            </mesh>
                        ))}
                        {/* Dust cloud base */}
                        <mesh position={[0, 0.1, 0]}>
                            <sphereGeometry args={[0.4, 8, 8]} />
                            <meshStandardMaterial color="#9CA3AF" transparent opacity={0.3} />
                        </mesh>
                    </>
                )}
            </group>

            {/* Danger indicator - pulsing ring */}
            {zombie.state !== 'defeated' && (
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.5, 0.55, 16]} />
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={0.4}
                        emissive={color}
                        emissiveIntensity={0.3}
                    />
                </mesh>
            )}

            {/* Name tag sprite */}
            <sprite position={[0, 1.55, 0]} scale={[1.4, 0.4, 1]}>
                <spriteMaterial map={nameTexture} transparent depthTest={false} />
            </sprite>
        </group>
    );
}
