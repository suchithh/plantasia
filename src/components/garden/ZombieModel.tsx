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
    const armLeftRef = useRef<THREE.Group>(null);
    const armRightRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const leftPupilRef = useRef<THREE.Mesh>(null);
    const rightPupilRef = useRef<THREE.Mesh>(null);
    const jawRef = useRef<THREE.Group>(null);
    const dangerRingRef = useRef<THREE.Mesh>(null);

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

        // Menacing hover — bouncy, springy motion
        groupRef.current.position.y = Math.sin(t * 2.5) * 0.1 + Math.sin(t * 5) * 0.02;
        groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.08;
        groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.06;

        // Body wobble — breathing effect
        if (bodyRef.current) {
            bodyRef.current.rotation.x = Math.sin(t * 3) * 0.06;
            bodyRef.current.scale.y = 1 + Math.sin(t * 4) * 0.02;
        }

        // Animated pupils — darting eyes looking around
        if (leftPupilRef.current && rightPupilRef.current) {
            const lookX = Math.sin(t * 1.8) * 0.025;
            const lookY = Math.cos(t * 2.2) * 0.015;
            leftPupilRef.current.position.x = -0.1 + lookX;
            leftPupilRef.current.position.y = 1.02 + lookY;
            rightPupilRef.current.position.x = 0.1 + lookX;
            rightPupilRef.current.position.y = 1.02 + lookY;
        }

        // Jaw chomping
        if (jawRef.current) {
            jawRef.current.rotation.x = Math.sin(t * 3.5) * 0.08 + 0.05;
        }

        // Pulsing danger ring
        if (dangerRingRef.current) {
            const pulse = 1 + Math.sin(t * 4) * 0.15;
            dangerRingRef.current.scale.set(pulse, pulse, 1);
            (dangerRingRef.current.material as THREE.MeshStandardMaterial).opacity = 0.25 + Math.sin(t * 4) * 0.15;
        }

        // Creepy arm reaching — offset wave
        if (armLeftRef.current) {
            armLeftRef.current.rotation.x = Math.sin(t * 2) * 0.5 + 0.4;
            armLeftRef.current.rotation.z = Math.sin(t * 1.5) * 0.12 + 0.25;
        }
        if (armRightRef.current) {
            armRightRef.current.rotation.x = Math.sin(t * 2 + Math.PI) * 0.5 + 0.4;
            armRightRef.current.rotation.z = Math.sin(t * 1.5 + Math.PI) * 0.12 - 0.25;
        }
    });

    const color = zombie.color;
    const darkerColor = '#' + new THREE.Color(color).multiplyScalar(0.65).getHexString();
    const lighterColor = '#' + new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.3).getHexString();

    return (
        <group
            ref={groupRef}
            position={[zombie.position.x, 0, zombie.position.z]}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {/* Shadow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
                <circleGeometry args={[0.4, 16]} />
                <meshStandardMaterial color="#000000" transparent opacity={0.18} />
            </mesh>

            {/* Aura effect */}
            <ZombieAura color={color} type={zombie.type} />

            <group ref={bodyRef}>
                {/* Body — rounder, chunkier */}
                <mesh position={[0, 0.5, 0]} castShadow>
                    <sphereGeometry args={[0.34, 16, 16]} />
                    <meshStandardMaterial color={color} roughness={0.5} />
                </mesh>
                {/* Belly — lighter underbelly */}
                <mesh position={[0, 0.46, 0.22]}>
                    <sphereGeometry args={[0.2, 12, 12]} />
                    <meshStandardMaterial color={lighterColor} roughness={0.6} />
                </mesh>
                {/* Back hunch */}
                <mesh position={[0, 0.58, -0.15]}>
                    <sphereGeometry args={[0.18, 10, 10]} />
                    <meshStandardMaterial color={darkerColor} roughness={0.7} />
                </mesh>

                {/* Head — bigger, more expressive (oversized for character) */}
                <mesh position={[0, 0.95, 0.05]} castShadow>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color={color} roughness={0.5} />
                </mesh>
                {/* Cranium bump — lumpy shape */}
                <mesh position={[0, 1.12, -0.05]}>
                    <sphereGeometry args={[0.15, 10, 10]} />
                    <meshStandardMaterial color={color} roughness={0.5} />
                </mesh>

                {/* Thick angry eyebrows — more dramatic */}
                <mesh position={[-0.12, 1.1, 0.24]} rotation={[-0.1, 0, 0.4]}>
                    <boxGeometry args={[0.14, 0.04, 0.03]} />
                    <meshStandardMaterial color="#1a1a2e" />
                </mesh>
                <mesh position={[0.12, 1.1, 0.24]} rotation={[-0.1, 0, -0.4]}>
                    <boxGeometry args={[0.14, 0.04, 0.03]} />
                    <meshStandardMaterial color="#1a1a2e" />
                </mesh>

                {/* Eyes — big, bulging, expressive */}
                {/* Left eye */}
                <mesh position={[-0.11, 1.02, 0.24]}>
                    <sphereGeometry args={[0.09, 12, 12]} />
                    <meshStandardMaterial color="#FFFEF0" />
                </mesh>
                {/* Right eye — slightly different size for asymmetric charm */}
                <mesh position={[0.11, 1.02, 0.24]}>
                    <sphereGeometry args={[0.08, 12, 12]} />
                    <meshStandardMaterial color="#FFFEF0" />
                </mesh>
                {/* Left pupil — animated */}
                <mesh ref={leftPupilRef} position={[-0.1, 1.02, 0.31]}>
                    <sphereGeometry args={[0.045, 8, 8]} />
                    <meshStandardMaterial color="#1a1a2e" />
                </mesh>
                {/* Right pupil — animated */}
                <mesh ref={rightPupilRef} position={[0.1, 1.02, 0.3]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color="#1a1a2e" />
                </mesh>
                {/* Eye glow — colored, menacing */}
                <mesh position={[-0.09, 1.025, 0.33]}>
                    <sphereGeometry args={[0.015, 6, 6]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
                </mesh>
                <mesh position={[0.11, 1.025, 0.32]}>
                    <sphereGeometry args={[0.013, 6, 6]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
                </mesh>
                {/* Under-eye bags — darker circles for tired/undead look */}
                <mesh position={[-0.1, 0.94, 0.26]}>
                    <sphereGeometry args={[0.04, 8, 4, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.4]} />
                    <meshStandardMaterial color={darkerColor} transparent opacity={0.6} />
                </mesh>
                <mesh position={[0.1, 0.94, 0.26]}>
                    <sphereGeometry args={[0.035, 8, 4, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.4]} />
                    <meshStandardMaterial color={darkerColor} transparent opacity={0.6} />
                </mesh>

                {/* Mouth — wide jagged grin */}
                <mesh position={[0, 0.86, 0.26]} rotation={[0.15, 0, 0]}>
                    <boxGeometry args={[0.22, 0.07, 0.04]} />
                    <meshStandardMaterial color="#0d0d15" />
                </mesh>
                {/* Teeth — jagged, uneven for character */}
                <group ref={jawRef}>
                    {/* Upper teeth */}
                    {[-0.07, -0.025, 0.02, 0.065].map((x, i) => (
                        <mesh key={`ut-${i}`} position={[x, 0.88, 0.28]}>
                            <boxGeometry args={[0.025, 0.035 + (i % 2) * 0.015, 0.015]} />
                            <meshStandardMaterial color={i % 3 === 0 ? '#E8E4D0' : '#F0EDE0'} />
                        </mesh>
                    ))}
                    {/* Lower teeth — fewer, bigger */}
                    {[-0.04, 0.04].map((x, i) => (
                        <mesh key={`lt-${i}`} position={[x, 0.835, 0.28]}>
                            <boxGeometry args={[0.03, 0.03, 0.015]} />
                            <meshStandardMaterial color="#E0DCC8" />
                        </mesh>
                    ))}
                </group>
                {/* Drool — slimy drip */}
                <mesh position={[0.03, 0.8, 0.27]}>
                    <cylinderGeometry args={[0.008, 0.003, 0.08, 4]} />
                    <meshStandardMaterial color={lighterColor} transparent opacity={0.5} />
                </mesh>

                {/* Stitches on head — undead character detail */}
                <mesh position={[0.08, 1.12, 0.18]} rotation={[0, 0, 0.8]}>
                    <boxGeometry args={[0.08, 0.012, 0.01]} />
                    <meshStandardMaterial color={darkerColor} />
                </mesh>
                {[-0.02, 0.01, 0.04].map((off, i) => (
                    <mesh key={`st-${i}`} position={[0.06 + off, 1.12 + (i - 1) * 0.015, 0.19]} rotation={[0, 0, -0.1]}>
                        <boxGeometry args={[0.008, 0.025, 0.008]} />
                        <meshStandardMaterial color={darkerColor} />
                    </mesh>
                ))}

                {/* Arms — with distinct hands and fingers */}
                <group ref={armLeftRef} position={[-0.35, 0.55, 0.05]}>
                    {/* Upper arm */}
                    <mesh position={[0, 0.1, 0.08]} rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0.055, 0.045, 0.35, 8]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    {/* Hand — claw-like */}
                    <mesh position={[-0.02, 0.28, 0.18]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color={lighterColor} />
                    </mesh>
                    {/* Fingers/claws */}
                    {[0, 1, 2].map(f => (
                        <mesh key={f} position={[-0.04 + f * 0.02, 0.32, 0.22]} rotation={[0.3, 0, (f - 1) * 0.15]}>
                            <coneGeometry args={[0.01, 0.05, 4]} />
                            <meshStandardMaterial color={darkerColor} />
                        </mesh>
                    ))}
                </group>

                <group ref={armRightRef} position={[0.35, 0.55, 0.05]}>
                    <mesh position={[0, 0.1, 0.08]}>
                        <cylinderGeometry args={[0.055, 0.045, 0.35, 8]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    <mesh position={[0.02, 0.28, 0.18]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color={lighterColor} />
                    </mesh>
                    {[0, 1, 2].map(f => (
                        <mesh key={f} position={[0.04 - f * 0.02, 0.32, 0.22]} rotation={[0.3, 0, -(f - 1) * 0.15]}>
                            <coneGeometry args={[0.01, 0.05, 4]} />
                            <meshStandardMaterial color={darkerColor} />
                        </mesh>
                    ))}
                </group>

                {/* Legs — stubby, thicker */}
                <mesh position={[-0.13, 0.15, 0]}>
                    <cylinderGeometry args={[0.08, 0.065, 0.28, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0.13, 0.15, 0]}>
                    <cylinderGeometry args={[0.08, 0.065, 0.28, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Feet — bigger, clompy */}
                <mesh position={[-0.13, 0.02, 0.06]}>
                    <sphereGeometry args={[0.08, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color={darkerColor} />
                </mesh>
                <mesh position={[0.13, 0.02, 0.06]}>
                    <sphereGeometry args={[0.08, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color={darkerColor} />
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
                        <mesh position={[-0.15, 1.25, 0]} rotation={[0, 0, 0.3]}>
                            <cylinderGeometry args={[0.02, 0.01, 0.18, 4]} />
                            <meshStandardMaterial color="#059669" />
                        </mesh>
                        <mesh position={[0.1, 1.22, 0.05]} rotation={[0.2, 0, -0.2]}>
                            <cylinderGeometry args={[0.015, 0.01, 0.14, 4]} />
                            <meshStandardMaterial color="#10B981" />
                        </mesh>
                        <mesh position={[0.02, 1.28, -0.08]} rotation={[0.3, 0, 0.1]}>
                            <cylinderGeometry args={[0.018, 0.008, 0.16, 4]} />
                            <meshStandardMaterial color="#047857" />
                        </mesh>
                    </>
                )}

                {/* Thirster - cracked/dry appearance */}
                {zombie.type === 'thirster' && (
                    <>
                        {[0, 1, 2, 3].map(i => (
                            <mesh key={i} position={[Math.sin(i * 2) * 0.18, 0.92 + i * 0.06, 0.24]} rotation={[0, 0, i * 0.6 - 0.3]}>
                                <boxGeometry args={[0.1, 0.015, 0.01]} />
                                <meshStandardMaterial color="#78350F" />
                            </mesh>
                        ))}
                        {[0, 1, 2, 3].map(i => (
                            <mesh key={`dust-${i}`} position={[Math.sin(i * 1.2) * 0.35, 0.4 + i * 0.18, Math.cos(i * 1.2) * 0.35]}>
                                <sphereGeometry args={[0.025, 4, 4]} />
                                <meshStandardMaterial color="#D4A574" transparent opacity={0.4} />
                            </mesh>
                        ))}
                    </>
                )}

                {/* Fungus Phil - mushroom cap and spores */}
                {zombie.type === 'fungus_phil' && (
                    <>
                        <mesh position={[0, 1.3, 0]}>
                            <coneGeometry args={[0.25, 0.2, 12]} />
                            <meshStandardMaterial color="#C084FC" />
                        </mesh>
                        {[0, 1, 2, 3, 4].map(i => (
                            <mesh key={i} position={[Math.cos(i * 1.3) * 0.14, 1.27, Math.sin(i * 1.3) * 0.14]}>
                                <sphereGeometry args={[0.03, 6, 6]} />
                                <meshStandardMaterial color="#E9D5FF" />
                            </mesh>
                        ))}
                        {[0, 1, 2].map(i => (
                            <mesh key={`spore-${i}`} position={[Math.sin(i * 2.5) * 0.4, 1.15, Math.cos(i * 2.5) * 0.4]}>
                                <sphereGeometry args={[0.05, 6, 6]} />
                                <meshStandardMaterial color="#DDD6FE" transparent opacity={0.35} />
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
                                1.25 + i * 0.06,
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
                        {[0, 1, 2].map(i => (
                            <mesh key={i} position={[Math.sin(i * 2) * 0.25, 0.4 + i * 0.1, Math.cos(i * 2) * 0.25]}>
                                <torusGeometry args={[0.06, 0.015, 4, 8]} />
                                <meshStandardMaterial color="#6B7280" metalness={0.8} roughness={0.2} />
                            </mesh>
                        ))}
                        <mesh position={[0, 0.1, 0]}>
                            <sphereGeometry args={[0.4, 8, 8]} />
                            <meshStandardMaterial color="#9CA3AF" transparent opacity={0.25} />
                        </mesh>
                    </>
                )}
            </group>

            {/* Danger indicator - pulsing ring */}
            {zombie.state !== 'defeated' && (
                <mesh ref={dangerRingRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.5, 0.56, 16]} />
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={0.35}
                        emissive={color}
                        emissiveIntensity={0.4}
                    />
                </mesh>
            )}

            {/* Name tag sprite */}
            <sprite position={[0, 1.65, 0]} scale={[1.4, 0.4, 1]}>
                <spriteMaterial map={nameTexture} transparent depthTest={false} />
            </sprite>
        </group>
    );
}
