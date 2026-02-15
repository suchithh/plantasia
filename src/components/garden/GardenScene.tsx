// Plantasia: Guardians — 3D Garden Scene
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { getSensorBridge } from '../../services/sensorBridge';
import { MapControls } from '@react-three/drei';
import { PlantModel } from './PlantModel';
import { ZombieModel } from './ZombieModel';
import { useGameStore } from '../../stores/gameStore';
import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

// Sky dome — a huge inverted sphere so there's never any void visible
function SkyDome() {
    return (
        <mesh scale={[-1, 1, 1]}>
            <sphereGeometry args={[80, 32, 32]} />
            <meshBasicMaterial side={THREE.BackSide}>
                <primitive
                    attach="map"
                    object={(() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 256;
                        canvas.height = 256;
                        const ctx = canvas.getContext('2d')!;
                        const grad = ctx.createLinearGradient(0, 0, 0, 256);
                        grad.addColorStop(0, '#7DD3FC');
                        grad.addColorStop(0.4, '#BAE6FD');
                        grad.addColorStop(0.75, '#E0F2FE');
                        grad.addColorStop(1.0, '#FEF3C7');
                        ctx.fillStyle = grad;
                        ctx.fillRect(0, 0, 256, 256);
                        const tex = new THREE.CanvasTexture(canvas);
                        return tex;
                    })()}
                />
            </meshBasicMaterial>
        </mesh>
    );
}

// Animated floating clouds
function Clouds() {
    const groupRef = useRef<THREE.Group>(null);
    const clouds = useMemo(() => [
        { x: -6, y: 5, z: -4, scale: 1.2 },
        { x: 4, y: 6, z: -6, scale: 0.9 },
        { x: 7, y: 4.5, z: 2, scale: 1.0 },
        { x: -5, y: 5.5, z: 5, scale: 0.8 },
        { x: 0, y: 5, z: 8, scale: 1.1 },
    ], []);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.children.forEach((cloud, i) => {
                cloud.position.x += 0.002 * (i % 2 === 0 ? 1 : 0.7);
                if (cloud.position.x > 12) cloud.position.x = -12;
            });
        }
    });

    return (
        <group ref={groupRef}>
            {clouds.map((c, i) => (
                <group key={i} position={[c.x, c.y, c.z]} scale={c.scale}>
                    <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[0.5, 8, 8]} />
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
                    </mesh>
                    <mesh position={[0.4, 0.1, 0]}>
                        <sphereGeometry args={[0.4, 8, 8]} />
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
                    </mesh>
                    <mesh position={[-0.35, 0.05, 0]}>
                        <sphereGeometry args={[0.35, 8, 8]} />
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
                    </mesh>
                    <mesh position={[0.15, 0.25, 0]}>
                        <sphereGeometry args={[0.3, 8, 8]} />
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Animated butterflies
function Butterflies() {
    const groupRef = useRef<THREE.Group>(null);
    const butterflies = useMemo(() => [
        { x: -2, y: 1.5, z: -2, color: '#F472B6', speed: 1.2 },
        { x: 3, y: 1.8, z: 1, color: '#FBBF24', speed: 0.9 },
        { x: -1, y: 2, z: 3, color: '#A78BFA', speed: 1.1 },
    ], []);

    useFrame(() => {
        if (groupRef.current) {
            const t = performance.now() * 0.001;
            groupRef.current.children.forEach((butterfly, i) => {
                const b = butterflies[i];
                butterfly.position.x = b.x + Math.sin(t * b.speed) * 1.5;
                butterfly.position.y = b.y + Math.sin(t * b.speed * 1.5) * 0.3;
                butterfly.position.z = b.z + Math.cos(t * b.speed) * 1.5;
                butterfly.rotation.y = Math.sin(t * b.speed) * 0.5;
            });
        }
    });

    return (
        <group ref={groupRef}>
            {butterflies.map((b, i) => (
                <group key={i} position={[b.x, b.y, b.z]} scale={0.15}>
                    <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[0.3, 6, 6]} />
                        <meshStandardMaterial color="#1F2937" />
                    </mesh>
                    <mesh position={[-0.4, 0.1, 0]} rotation={[0, 0, 0.3]}>
                        <circleGeometry args={[0.5, 8]} />
                        <meshStandardMaterial color={b.color} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0.4, 0.1, 0]} rotation={[0, 0, -0.3]}>
                        <circleGeometry args={[0.5, 8]} />
                        <meshStandardMaterial color={b.color} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Sparkle particles floating around
function Sparkles() {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 50;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 12;
            pos[i * 3 + 1] = Math.random() * 3 + 0.5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
        }
        return pos;
    }, []);

    useFrame(() => {
        if (pointsRef.current) {
            const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                positions[i * 3 + 1] += 0.005;
                if (positions[i * 3 + 1] > 4) {
                    positions[i * 3 + 1] = 0.5;
                }
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#FBBF24"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

// Grass tufts — small blade clusters scattered on terrain
function GrassTufts() {
    const groupRef = useRef<THREE.Group>(null);
    const tufts = useMemo(() => {
        const result: { x: number; z: number; scale: number; rot: number; color: string }[] = [];
        const rng = (seed: number) => {
            let s = seed;
            return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
        };
        const rand = rng(42);
        const colors = ['#5B9A42', '#6DAD52', '#4E8B35', '#78B85E', '#3D7A2B'];
        for (let i = 0; i < 120; i++) {
            const angle = rand() * Math.PI * 2;
            const dist = 5.5 + rand() * 14;
            result.push({
                x: Math.cos(angle) * dist,
                z: Math.sin(angle) * dist,
                scale: 0.15 + rand() * 0.25,
                rot: rand() * Math.PI,
                color: colors[Math.floor(rand() * colors.length)],
            });
        }
        return result;
    }, []);

    useFrame(() => {
        if (groupRef.current) {
            const t = performance.now() * 0.0008;
            groupRef.current.children.forEach((tuft, i) => {
                tuft.rotation.z = Math.sin(t + i * 0.7) * 0.06;
            });
        }
    });

    return (
        <group ref={groupRef}>
            {tufts.map((t, i) => (
                <group key={i} position={[t.x, -0.4, t.z]} rotation={[0, t.rot, 0]} scale={t.scale}>
                    {/* 3 blades per tuft */}
                    <mesh position={[0, 0.15, 0]}>
                        <coneGeometry args={[0.06, 0.4, 3]} />
                        <meshStandardMaterial color={t.color} />
                    </mesh>
                    <mesh position={[-0.04, 0.12, 0.02]} rotation={[0, 0, 0.15]}>
                        <coneGeometry args={[0.05, 0.3, 3]} />
                        <meshStandardMaterial color={t.color} />
                    </mesh>
                    <mesh position={[0.04, 0.1, -0.02]} rotation={[0, 0, -0.12]}>
                        <coneGeometry args={[0.045, 0.25, 3]} />
                        <meshStandardMaterial color={t.color} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Trees outside the fence
function OuterTrees() {
    const trees = useMemo(() => [
        { x: -8, z: -8, scale: 1.2, trunkH: 1.8, color: '#2D8B3E' },
        { x: 9, z: -7, scale: 0.9, trunkH: 1.5, color: '#3A9E4A' },
        { x: -9, z: 7, scale: 1.0, trunkH: 1.6, color: '#267A34' },
        { x: 8, z: 9, scale: 1.1, trunkH: 1.7, color: '#35934A' },
        { x: -12, z: 0, scale: 0.85, trunkH: 1.4, color: '#2E8F3F' },
        { x: 11, z: 2, scale: 1.3, trunkH: 2.0, color: '#1E7A2E' },
        { x: 0, z: -10, scale: 0.7, trunkH: 1.2, color: '#4AAD5C' },
        { x: -7, z: 11, scale: 0.95, trunkH: 1.5, color: '#338C42' },
        { x: 7, z: -12, scale: 0.75, trunkH: 1.3, color: '#2A8636' },
        { x: -14, z: -6, scale: 1.15, trunkH: 1.9, color: '#247830' },
        { x: 13, z: -3, scale: 0.8, trunkH: 1.35, color: '#3DA04E' },
        { x: -6, z: -13, scale: 1.0, trunkH: 1.6, color: '#2B8838' },
    ], []);

    return (
        <group>
            {trees.map((t, i) => (
                <group key={i} position={[t.x, -0.5, t.z]} scale={t.scale}>
                    {/* Trunk */}
                    <mesh position={[0, t.trunkH / 2, 0]} castShadow>
                        <cylinderGeometry args={[0.12, 0.18, t.trunkH, 6]} />
                        <meshStandardMaterial color="#8B6914" />
                    </mesh>
                    {/* Canopy layers — stacked spheres for full foliage */}
                    <mesh position={[0, t.trunkH * 0.7, 0]} castShadow>
                        <sphereGeometry args={[0.8, 8, 8]} />
                        <meshStandardMaterial color={t.color} flatShading />
                    </mesh>
                    <mesh position={[0.2, t.trunkH * 0.85, -0.1]} castShadow>
                        <sphereGeometry args={[0.6, 8, 8]} />
                        <meshStandardMaterial color={new THREE.Color(t.color).multiplyScalar(1.1).getStyle()} flatShading />
                    </mesh>
                    <mesh position={[-0.15, t.trunkH * 0.95, 0.15]}>
                        <sphereGeometry args={[0.5, 8, 8]} />
                        <meshStandardMaterial color={new THREE.Color(t.color).multiplyScalar(0.85).getStyle()} flatShading />
                    </mesh>
                    {/* Shadow on ground */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                        <circleGeometry args={[0.6, 12]} />
                        <meshStandardMaterial color="#000000" transparent opacity={0.12} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Bushes scattered outside fence
function OuterBushes() {
    const bushes = useMemo(() => {
        const result: { x: number; z: number; scale: number; color: string }[] = [];
        const positions = [
            [-6.5, -5.5], [6.5, -6], [-6, 6.5], [7, 6],
            [-10, 3], [10, -4], [5, -9], [-5, 9],
            [-8, -3], [9, 4], [-3, -8], [3, 8],
            [-11, -8], [12, 7], [-7, -10], [8, 12],
        ];
        const colors = ['#3E8E41', '#4A9E52', '#2D7E33', '#56AE60', '#357E3E'];
        positions.forEach(([x, z], i) => {
            result.push({ x, z, scale: 0.4 + (i % 5) * 0.12, color: colors[i % colors.length] });
        });
        return result;
    }, []);

    return (
        <group>
            {bushes.map((b, i) => (
                <group key={i} position={[b.x, -0.35, b.z]} scale={b.scale}>
                    <mesh castShadow>
                        <sphereGeometry args={[0.6, 8, 8]} />
                        <meshStandardMaterial color={b.color} flatShading />
                    </mesh>
                    <mesh position={[0.3, 0.05, 0.15]}>
                        <sphereGeometry args={[0.4, 7, 7]} />
                        <meshStandardMaterial color={new THREE.Color(b.color).multiplyScalar(1.15).getStyle()} flatShading />
                    </mesh>
                    <mesh position={[-0.25, -0.05, -0.1]}>
                        <sphereGeometry args={[0.35, 7, 7]} />
                        <meshStandardMaterial color={new THREE.Color(b.color).multiplyScalar(0.9).getStyle()} flatShading />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Wildflowers scattered outside the fence
function WildFlowers() {
    const flowers = useMemo(() => {
        const result: { x: number; z: number; color: string; h: number }[] = [];
        const rng = (seed: number) => {
            let s = seed;
            return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
        };
        const rand = rng(99);
        const colors = ['#E879A8', '#F0AD4E', '#D4A5E0', '#7FBFDF', '#F5C542', '#E06B6B'];
        for (let i = 0; i < 30; i++) {
            const angle = rand() * Math.PI * 2;
            const dist = 5.8 + rand() * 10;
            result.push({
                x: Math.cos(angle) * dist,
                z: Math.sin(angle) * dist,
                color: colors[Math.floor(rand() * colors.length)],
                h: 0.15 + rand() * 0.2,
            });
        }
        return result;
    }, []);

    return (
        <group>
            {flowers.map((f, i) => (
                <group key={i} position={[f.x, -0.42, f.z]}>
                    {/* Tiny stem */}
                    <mesh position={[0, f.h / 2, 0]}>
                        <cylinderGeometry args={[0.01, 0.015, f.h, 4]} />
                        <meshStandardMaterial color="#4A8C3F" />
                    </mesh>
                    {/* Flower head */}
                    <mesh position={[0, f.h + 0.03, 0]}>
                        <sphereGeometry args={[0.04, 6, 6]} />
                        <meshStandardMaterial color={f.color} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Dirt path leading to the garden gate
function GardenPath() {
    const segments = useMemo(() => {
        const pts: { x: number; z: number; w: number }[] = [];
        for (let i = 0; i < 8; i++) {
            pts.push({
                x: 0 + Math.sin(i * 0.4) * 0.3,
                z: -5.5 - i * 1.2,
                w: 1.0 + Math.sin(i * 0.8) * 0.2,
            });
        }
        return pts;
    }, []);

    return (
        <group>
            {segments.map((s, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[s.x, -0.495, s.z]}>
                    <planeGeometry args={[s.w, 1.3]} />
                    <meshStandardMaterial color="#C4955A" />
                </mesh>
            ))}
            {/* Stepping stones along path */}
            {segments.filter((_, i) => i % 2 === 0).map((s, i) => (
                <mesh key={`stone-${i}`} rotation={[-Math.PI / 2, 0, Math.random()]} position={[s.x + (i % 2 ? 0.15 : -0.1), -0.49, s.z]}>
                    <circleGeometry args={[0.15, 6]} />
                    <meshStandardMaterial color="#B8A58C" />
                </mesh>
            ))}
        </group>
    );
}

function Ground() {
    // Generate a procedural grass texture for the extended ground
    const grassTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        // Base color
        ctx.fillStyle = '#6AAF55';
        ctx.fillRect(0, 0, 512, 512);
        // Add noise-like variation
        const rng = (seed: number) => {
            let s = seed;
            return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
        };
        const rand = rng(7);
        for (let i = 0; i < 3000; i++) {
            const x = rand() * 512;
            const y = rand() * 512;
            const r = 1 + rand() * 4;
            const shade = rand() > 0.5 ? 'rgba(90,160,60,0.3)' : 'rgba(50,120,40,0.25)';
            ctx.fillStyle = shade;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        // Add lighter flecks
        for (let i = 0; i < 800; i++) {
            const x = rand() * 512;
            const y = rand() * 512;
            ctx.fillStyle = 'rgba(140,210,100,0.2)';
            ctx.beginPath();
            ctx.arc(x, y, 1 + rand() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(6, 6);
        return tex;
    }, []);

    return (
        <group>
            {/* Extended grass — textured, fills visible area */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
                <planeGeometry args={[80, 80]} />
                <meshStandardMaterial map={grassTexture} color="#6AAF55" />
            </mesh>
            {/* Main garden grass — slightly elevated, brighter */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#7EC668" />
            </mesh>
            {/* Inner grass highlight */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
                <planeGeometry args={[8, 8]} />
                <meshStandardMaterial color="#8BD674" transparent opacity={0.45} />
            </mesh>
            {/* Garden path ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
                <ringGeometry args={[3.5, 4.2, 32]} />
                <meshStandardMaterial color="#D4A574" />
            </mesh>
            {/* Planting spots */}
            {[[-2, 0], [0, 0], [2, 0], [-2, 2], [0, 2], [2, 2], [-2, -2], [0, -2], [2, -2]].map(([x, z], i) => (
                <group key={i} position={[x, -0.47, z]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[0.75, 32]} />
                        <meshStandardMaterial color="#6B4423" />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                        <circleGeometry args={[0.6, 32]} />
                        <meshStandardMaterial color="#8B5A2B" />
                    </mesh>
                    {[0, 1.2, 2.4, 3.6, 5].map((angle, j) => (
                        <mesh key={j} position={[Math.cos(angle) * 0.68, 0.02, Math.sin(angle) * 0.68]} rotation={[-Math.PI / 2, 0, 0]}>
                            <circleGeometry args={[0.05, 6]} />
                            <meshStandardMaterial color="#9CA3AF" />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
}

function Fence() {
    const posts: [number, number, number][] = [];
    for (let i = -5; i <= 5; i += 1) {
        posts.push([i, 0, -5]);
        posts.push([i, 0, 5]);
        if (i !== -5 && i !== 5) {
            posts.push([-5, 0, i]);
            posts.push([5, 0, i]);
        }
    }
    return (
        <group>
            {posts.map((pos, i) => (
                <group key={i} position={[pos[0], 0, pos[2]]}>
                    {/* Post */}
                    <mesh position={[0, 0.1, 0]} castShadow>
                        <boxGeometry args={[0.12, 1.4, 0.12]} />
                        <meshStandardMaterial color="#C9A66B" />
                    </mesh>
                    {/* Post cap */}
                    <mesh position={[0, 0.85, 0]}>
                        <coneGeometry args={[0.1, 0.15, 4]} />
                        <meshStandardMaterial color="#A08050" />
                    </mesh>
                </group>
            ))}
            {/* Horizontal rails (front and back) */}
            {[-5, 5].map((z, i) => (
                <group key={`rail-${i}`}>
                    <mesh position={[0, 0.3, z]}>
                        <boxGeometry args={[10, 0.08, 0.06]} />
                        <meshStandardMaterial color="#D4B896" />
                    </mesh>
                    <mesh position={[0, 0.55, z]}>
                        <boxGeometry args={[10, 0.08, 0.06]} />
                        <meshStandardMaterial color="#D4B896" />
                    </mesh>
                </group>
            ))}
            {/* Side rails (left and right) */}
            {[-5, 5].map((x, i) => (
                <group key={`side-rail-${i}`}>
                    <mesh position={[x, 0.3, 0]}>
                        <boxGeometry args={[0.06, 0.08, 10]} />
                        <meshStandardMaterial color="#D4B896" />
                    </mesh>
                    <mesh position={[x, 0.55, 0]}>
                        <boxGeometry args={[0.06, 0.08, 10]} />
                        <meshStandardMaterial color="#D4B896" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function Flowers() {
    const groupRef = useRef<THREE.Group>(null);
    const positions: [number, number, number][] = [
        [-3.5, -0.3, -3.5], [3.5, -0.3, -3.5], [-3.5, -0.3, 3.5], [3.5, -0.3, 3.5],
        [-1, -0.3, -3.5], [1, -0.3, 3.5], [4, -0.3, 0], [-4, -0.3, 1],
        [2.5, -0.3, -3.8], [-2.5, -0.3, 3.8], [4.2, -0.3, -2], [-4.2, -0.3, 2],
    ];
    const flowerColors = ['#F472B6', '#FB923C', '#FBBF24', '#A78BFA', '#F87171', '#34D399'];

    useFrame(() => {
        if (groupRef.current) {
            const t = performance.now() * 0.001;
            groupRef.current.children.forEach((flower, i) => {
                flower.rotation.z = Math.sin(t * 1.5 + i) * 0.05;
            });
        }
    });

    return (
        <group ref={groupRef}>
            {positions.map((pos, i) => (
                <group key={i} position={pos}>
                    {/* Stem */}
                    <mesh position={[0, 0.2, 0]}>
                        <cylinderGeometry args={[0.02, 0.03, 0.5, 8]} />
                        <meshStandardMaterial color="#22C55E" />
                    </mesh>
                    {/* Flower center */}
                    <mesh position={[0, 0.5, 0]}>
                        <sphereGeometry args={[0.08, 8, 8]} />
                        <meshStandardMaterial color="#FBBF24" />
                    </mesh>
                    {/* Petals */}
                    {[0, 1, 2, 3, 4, 5].map((p) => (
                        <mesh key={p} position={[
                            Math.cos(p * Math.PI / 3) * 0.1,
                            0.5,
                            Math.sin(p * Math.PI / 3) * 0.1
                        ]}>
                            <sphereGeometry args={[0.06, 6, 6]} />
                            <meshStandardMaterial color={flowerColors[i % flowerColors.length]} />
                        </mesh>
                    ))}
                    {/* Leaves */}
                    <mesh position={[0.06, 0.15, 0]} rotation={[0, 0, 0.5]}>
                        <coneGeometry args={[0.03, 0.12, 4]} />
                        <meshStandardMaterial color="#4ADE80" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Decorative mushrooms
function Mushrooms() {
    const positions: [number, number, number][] = [
        [-4.5, -0.35, -3], [4.3, -0.35, 2.5], [-3, -0.35, 4.2],
    ];
    return (
        <group>
            {positions.map((pos, i) => (
                <group
                    key={i}
                    position={pos}
                    scale={0.4 + i * 0.1}
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('Secret mushroom clicked: Rising moisture');
                        const bridge = getSensorBridge();
                        bridge.setMoistureTrend('rising');
                    }}
                >
                    <mesh position={[0, 0.15, 0]}>
                        <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
                        <meshStandardMaterial color="#F5F5DC" />
                    </mesh>
                    <mesh position={[0, 0.35, 0]}>
                        <sphereGeometry args={[0.18, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color={i % 2 === 0 ? '#EF4444' : '#FB923C'} />
                    </mesh>
                    {/* Spots */}
                    <mesh position={[0.08, 0.4, 0.08]}>
                        <sphereGeometry args={[0.03, 6, 6]} />
                        <meshStandardMaterial color="#FFFFFF" />
                    </mesh>
                    <mesh position={[-0.05, 0.42, 0.1]}>
                        <sphereGeometry args={[0.025, 6, 6]} />
                        <meshStandardMaterial color="#FFFFFF" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Decorative rocks
function Rocks() {
    const rocks = [
        { pos: [-4.5, -0.35, 0], scale: 0.3, color: '#6B7280' },
        { pos: [4.5, -0.35, -1], scale: 0.25, color: '#9CA3AF' },
        { pos: [3, -0.35, 4], scale: 0.2, color: '#78716C' },
    ];
    return (
        <group>
            {rocks.map((rock, i) => (
                <mesh key={i} position={rock.pos as [number, number, number]} scale={rock.scale}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color={rock.color} flatShading />
                </mesh>
            ))}
        </group>
    );
}

// Handles camera movement, clamping, and cinematic events
function CinematicCamera() {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);
    const gameEvents = useGameStore(s => s.gameEvents);
    const zombies = useGameStore(s => s.zombies);

    // The camera default offset
    const offset = useMemo(() => new THREE.Vector3(10, 10, 10), []);

    // Cutscene state
    const [targetSubject, setTargetSubject] = useState<{ x: number, z: number } | null>(null);

    // Watch for dramatic events
    useEffect(() => {
        const lastEvent = gameEvents[gameEvents.length - 1];
        if (!lastEvent) return;

        if (lastEvent.type === 'challenger_approaching') {
            const zombie = zombies.find(z => z.id === lastEvent.zombieId);
            if (zombie) {
                setTargetSubject({ x: zombie.position.x, z: zombie.position.z });
                // Reset after 4s
                setTimeout(() => setTargetSubject(null), 4000);
            }
        }
    }, [gameEvents, zombies]);

    useFrame((state, delta) => {
        if (targetSubject) {
            // Cutscene Mode: Smoothly pan to subject
            const desiredPos = new THREE.Vector3(targetSubject.x + 5, 5, targetSubject.z + 5); // Zoomed in closer
            camera.position.lerp(desiredPos, delta * 3);

            // Look at subject
            const currentLookAt = new THREE.Vector3();
            camera.getWorldDirection(currentLookAt);
            const targetLookAt = new THREE.Vector3(targetSubject.x, 0, targetSubject.z);

            // Update controls target to match cutscene focus
            if (controlsRef.current) {
                controlsRef.current.target.lerp(targetLookAt, delta * 3);
                controlsRef.current.update();
            }
        } else {
            // Normal Gameplay Mode: Clamp based on TARGET, not camera position
            // This ensures we don't change the angle (camera-target offset) when hitting bounds
            if (controlsRef.current) {
                const controls = controlsRef.current;
                const target = controls.target;

                // Clamp the target (the point we're looking at / pivoting around)
                const clampedX = Math.max(-6, Math.min(6, target.x));
                const clampedZ = Math.max(-6, Math.min(6, target.z));

                if (target.x !== clampedX || target.z !== clampedZ) {
                    // Smoothly pull target back to bounds
                    const newTargetX = THREE.MathUtils.lerp(target.x, clampedX, delta * 10);
                    const newTargetZ = THREE.MathUtils.lerp(target.z, clampedZ, delta * 10);

                    // Apply offset to camera to maintain rigid angle
                    // Current offset = Camera - Target
                    const currentOffset = camera.position.clone().sub(target);

                    // Update target
                    controls.target.set(newTargetX, 0, newTargetZ);

                    // Update camera to maintain original offset from new target
                    camera.position.copy(controls.target.clone().add(currentOffset));

                    controls.update();
                }
            }
        }
    });

    return (
        <MapControls
            ref={controlsRef}
            enableRotate={false}
            enableDamping
            dampingFactor={0.15}
            minZoom={75}
            maxZoom={160}
            panSpeed={0.6}
            screenSpacePanning={false}
            mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
            touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }}
            enabled={!targetSubject} // Disable user control during cutscene
        />
    );
}

function SceneContent() {
    const plants = useGameStore(s => s.plants);
    const zombies = useGameStore(s => s.zombies);
    const selectPlant = useGameStore(s => s.selectPlant);
    const selectZombie = useGameStore(s => s.selectZombie);

    return (
        <>
            {/* Camera controls & Cutscenes */}
            <CinematicCamera />

            {/* Sky dome — eliminates void */}
            <SkyDome />

            {/* Warm sunny lighting */}
            <ambientLight intensity={0.5} color="#FFF8E7" />
            <directionalLight
                position={[8, 12, 8]}
                intensity={1.4}
                color="#FFF4D6"
                castShadow
                shadow-mapSize={2048}
            />
            <directionalLight position={[-5, 6, -3]} intensity={0.25} color="#87CEEB" />
            {/* Rim light for depth */}
            <directionalLight position={[-8, 4, 8]} intensity={0.3} color="#FDE68A" />

            {/* Hemisphere light for natural outdoor feel */}
            <hemisphereLight args={['#87CEEB', '#90C67C', 0.4]} />

            {/* Environment */}
            <Clouds />
            <Butterflies />
            <Sparkles />
            <Ground />
            <Fence />
            <Flowers />
            <Mushrooms />
            <Rocks />
            {/* Outer terrain — life beyond the fence */}
            <GrassTufts />
            <OuterTrees />
            <OuterBushes />
            <WildFlowers />
            <GardenPath />

            {plants.map(plant => (
                <PlantModel
                    key={plant.id}
                    plant={plant}
                    onClick={() => selectPlant(plant.id)}
                />
            ))}

            {zombies.filter(z => z.state !== 'defeated').map(zombie => (
                <ZombieModel
                    key={zombie.id}
                    zombie={zombie}
                    onClick={() => selectZombie(zombie.id)}
                />
            ))}
        </>
    );
}

export function GardenScene() {
    return (
        <Canvas
            shadows
            orthographic
            camera={{ position: [10, 10, 10], zoom: 85, near: 0.1, far: 100 }}
            style={{ width: '100%', height: '100%', cursor: 'grab', background: 'linear-gradient(180deg, #7DD3FC 0%, #BAE6FD 40%, #FEF3C7 100%)' }}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ camera }) => {
                camera.lookAt(0, 0, 0);
            }}
        >
            <Suspense fallback={null}>
                <SceneContent />
            </Suspense>
        </Canvas>
    );
}
