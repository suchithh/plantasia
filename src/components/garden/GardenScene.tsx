// Plantasia: Guardians — 3D Garden Scene
import { Canvas, useFrame } from '@react-three/fiber';
import { PlantModel } from './PlantModel';
import { ZombieModel } from './ZombieModel';
import { useGameStore } from '../../stores/gameStore';
import { Suspense, useRef, useMemo } from 'react';
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
        { x: 0, y: 6.5, z: -8, scale: 1.1 },
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

function Ground() {
    return (
        <group>
            {/* Extended grass — fills entire visible area */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
                <planeGeometry args={[80, 80]} />
                <meshStandardMaterial color="#6AAF55" />
            </mesh>
            {/* Main garden grass */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <planeGeometry args={[30, 30]} />
                <meshStandardMaterial color="#7EC668" />
            </mesh>
            {/* Grass texture variation — inner */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
                <planeGeometry args={[22, 22]} />
                <meshStandardMaterial color="#8BD674" transparent opacity={0.5} />
            </mesh>
            {/* Scattered darker patches for depth at distance */}
            {[
                [-12, -12, 0.6], [14, -10, 0.5], [-10, 14, 0.45], [15, 12, 0.55],
                [-18, 5, 0.4], [20, -5, 0.35], [8, -18, 0.5], [-8, 20, 0.45],
            ].map(([x, z, op], i) => (
                <mesh key={`patch-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.51, z]}>
                    <circleGeometry args={[3 + i * 0.4, 16]} />
                    <meshStandardMaterial color="#5A9E48" transparent opacity={op} />
                </mesh>
            ))}
            {/* Garden path */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
                <ringGeometry args={[3.5, 4.2, 32]} />
                <meshStandardMaterial color="#D4A574" />
            </mesh>
            {/* Planting spots with better styling */}
            {[[-2, 0], [0, 0], [2, 0], [-2, 2], [0, 2], [2, 2], [-2, -2], [0, -2], [2, -2]].map(([x, z], i) => (
                <group key={i} position={[x, -0.47, z]}>
                    {/* Soil circle */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[0.75, 32]} />
                        <meshStandardMaterial color="#6B4423" />
                    </mesh>
                    {/* Soil inner */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                        <circleGeometry args={[0.6, 32]} />
                        <meshStandardMaterial color="#8B5A2B" />
                    </mesh>
                    {/* Decorative stones */}
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
                <group key={i} position={pos} scale={0.4 + i * 0.1}>
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

function SceneContent() {
    const plants = useGameStore(s => s.plants);
    const zombies = useGameStore(s => s.zombies);
    const selectPlant = useGameStore(s => s.selectPlant);
    const selectZombie = useGameStore(s => s.selectZombie);

    return (
        <>
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
            camera={{ position: [10, 10, 10], zoom: 75, near: 0.1, far: 100 }}
            style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #7DD3FC 0%, #BAE6FD 40%, #FEF3C7 100%)' }}
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
