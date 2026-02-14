// Plantasia: Guardians — 3D Garden Scene
import { Canvas } from '@react-three/fiber';
import { PlantModel } from './PlantModel';
import { ZombieModel } from './ZombieModel';
import { useGameStore } from '../../stores/gameStore';
import { Suspense } from 'react';

function Ground() {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#90C67C" />
            </mesh>
            {[[-2, 0], [0, 0], [2, 0], [-2, 2], [0, 2], [2, 2], [-2, -2], [0, -2], [2, -2]].map(([x, z], i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.49, z]} receiveShadow>
                    <circleGeometry args={[0.7, 32]} />
                    <meshStandardMaterial color="#8B6F47" />
                </mesh>
            ))}
        </group>
    );
}

function Fence() {
    const posts: [number, number, number][] = [];
    for (let i = -5; i <= 5; i += 1) {
        posts.push([i, 0, -5]);
        posts.push([i, 0, 5]);
        posts.push([-5, 0, i]);
        posts.push([5, 0, i]);
    }
    return (
        <group>
            {posts.map((pos, i) => (
                <mesh key={i} position={[pos[0], 0, pos[2]]} castShadow>
                    <boxGeometry args={[0.08, 1.2, 0.08]} />
                    <meshStandardMaterial color="#A0845C" />
                </mesh>
            ))}
        </group>
    );
}

function Flowers() {
    const positions: [number, number, number][] = [
        [-3.5, -0.3, -3.5], [3.5, -0.3, -3.5], [-3.5, -0.3, 3.5], [3.5, -0.3, 3.5],
        [-1, -0.3, -3.5], [1, -0.3, 3.5], [4, -0.3, 0],
    ];
    const flowerColors = ['#F472B6', '#FB923C', '#FBBF24', '#A78BFA', '#F87171'];
    return (
        <group>
            {positions.map((pos, i) => (
                <group key={i} position={pos}>
                    <mesh position={[0, 0.2, 0]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
                        <meshStandardMaterial color="#4ADE80" />
                    </mesh>
                    <mesh position={[0, 0.5, 0]}>
                        <sphereGeometry args={[0.12, 8, 8]} />
                        <meshStandardMaterial color={flowerColors[i % flowerColors.length]} />
                    </mesh>
                </group>
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
            <ambientLight intensity={0.6} color="#FFF8E7" />
            <directionalLight
                position={[5, 8, 5]}
                intensity={1.2}
                color="#FFF4D6"
                castShadow
                shadow-mapSize={2048}
            />
            <directionalLight position={[-3, 4, -2]} intensity={0.3} color="#87CEEB" />

            <Ground />
            <Fence />
            <Flowers />

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
            camera={{ position: [10, 10, 10], zoom: 80, near: 0.1, far: 100 }}
            style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #87CEEB 0%, #F0F7DA 100%)' }}
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
