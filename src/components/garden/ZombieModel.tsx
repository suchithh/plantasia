// Plantasia: Guardians — High Fidelity "Reference Quality" Zombie
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ZombieEnemy } from '../../types';
import { useGameStore } from '../../stores/gameStore';
import * as THREE from 'three';
import { damp } from '../../utils/animationUtils';

interface ZombieModelProps {
    zombie: ZombieEnemy;
    onClick: () => void;
}

// --- Procedural Geometry Helpers ---

// A distinct "bean" shaped head using LatheGeometry
function createHeadGeometry() {
    const points = [];
    // Jaw
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(0.15, 0.02));
    points.push(new THREE.Vector2(0.22, 0.1));
    // Cheeks
    points.push(new THREE.Vector2(0.24, 0.25));
    // Cranium (flaring out)
    points.push(new THREE.Vector2(0.28, 0.45));
    points.push(new THREE.Vector2(0.26, 0.6));
    // Top
    points.push(new THREE.Vector2(0.15, 0.7));
    points.push(new THREE.Vector2(0, 0.72));

    return new THREE.LatheGeometry(points, 32);
}

// Suit Lapel Shape
function createLapelShape(isRight: boolean) {
    const shape = new THREE.Shape();
    const w = 0.1;
    const h = 0.35;
    if (isRight) {
        shape.moveTo(0, 0);
        shape.lineTo(w, -0.1);
        shape.lineTo(0.02, -h);
        shape.lineTo(0, -h);
    } else {
        shape.moveTo(0, 0);
        shape.lineTo(-w, -0.1);
        shape.lineTo(-0.02, -h);
        shape.lineTo(0, -h);
    }
    return shape;
}

// Tie Shape
function createTieShape() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.06, -0.05);
    shape.lineTo(0.04, -0.35); // Long part
    shape.lineTo(0, -0.4);
    shape.lineTo(-0.04, -0.35);
    shape.lineTo(-0.06, -0.05);
    return shape;
}

// Premium floating text
function createZombieNameTexture(name: string, emoji: string, color: string, threatLevel: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    // Dynamic color based on threat
    const mainColor = '#FFFFFF';
    const shadowColor = color;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 20;
    ctx.fillStyle = mainColor;
    ctx.font = '800 36px "Inter", sans-serif';
    ctx.fillText(`${emoji} ${name.toUpperCase()}`, 200, 40);

    // Threat Bar
    const barWidth = 200;
    const barHeight = 6;
    const filledWidth = (threatLevel / 5) * barWidth;

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(200 - barWidth / 2, 70, barWidth, barHeight);

    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = shadowColor;
    ctx.fillRect(200 - barWidth / 2, 70, filledWidth, barHeight);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function ZombieModel({ zombie, onClick }: ZombieModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const bodyGroupRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const jawRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);

    // Pupils
    const leftPupilRef = useRef<THREE.Mesh>(null);
    const rightPupilRef = useRef<THREE.Mesh>(null);

    // Geometry Memos
    const headGeometry = useMemo(() => createHeadGeometry(), []);
    const lapelRightGeo = useMemo(() => new THREE.ExtrudeGeometry(createLapelShape(true), { depth: 0.02, bevelEnabled: false }), []);
    const lapelLeftGeo = useMemo(() => new THREE.ExtrudeGeometry(createLapelShape(false), { depth: 0.02, bevelEnabled: false }), []);
    const tieGeo = useMemo(() => new THREE.ExtrudeGeometry(createTieShape(), { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 }), []);

    const nameTexture = useMemo(
        () => createZombieNameTexture(zombie.name, zombie.emoji, zombie.color, zombie.threatLevel),
        [zombie.name, zombie.emoji, zombie.color, zombie.threatLevel]
    );

    // Reference Colors
    const skinColor = '#5D8C34'; // Classic zombie green
    const suitColor = '#4E342E'; // Brown suit
    const shirtColor = '#F5F5F5'; // White shirt
    const tieColor = '#C62828'; // Red tie
    const pantsColor = '#4A148C'; // Purple pants
    const shoeColor = '#3E2723'; // Dark brown shoes

    // Random asymmetry for personality
    const lookOffset = useMemo(() => Math.random() * 100, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime() + lookOffset;

        // --- Global Movement ---
        const targetPlant = useGameStore.getState().plants.find(p => p.id === zombie.targetPlantId);

        if (zombie.state === 'defeated') {
            groupRef.current.rotation.z = damp(groupRef.current.rotation.z, -1.5, 4, delta);
            groupRef.current.position.y = damp(groupRef.current.position.y, -1, 4, delta);
            return;
        }

        // Shuffle Movement
        if (targetPlant) {
            const dx = targetPlant.position.x - groupRef.current.position.x;
            const dz = targetPlant.position.z - groupRef.current.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist > 1.8) {
                // Classic shuffle: move forward
                groupRef.current.position.x += dx * 0.0006;
                groupRef.current.position.z += dz * 0.0006;
                const targetAngle = Math.atan2(dx, dz);
                groupRef.current.rotation.y = damp(groupRef.current.rotation.y, targetAngle, 3, delta);
            }
        }

        // --- Body Animation "The Shuffle" ---
        // Side to side lean
        const walkCycle = Math.sin(t * 4);
        const lean = Math.sin(t * 2) * 0.1;

        if (bodyGroupRef.current) {
            bodyGroupRef.current.rotation.z = lean;
            bodyGroupRef.current.position.y = Math.abs(walkCycle) * 0.05; // Bob up/down
        }

        // Head bob (delayed)
        if (headRef.current) {
            headRef.current.rotation.z = -lean * 0.5 + Math.sin(t * 1.5) * 0.05;
            headRef.current.rotation.x = Math.sin(t) * 0.1; // Nod
        }

        // Jaw Breather
        if (jawRef.current) {
            jawRef.current.rotation.x = 0.2 + Math.sin(t * 2) * 0.1;
        }

        // Arms "Zombie Reach"
        if (leftArmRef.current) {
            leftArmRef.current.rotation.x = -1.5 + Math.sin(t * 3.5) * 0.1; // Reaching forward
            leftArmRef.current.rotation.z = 0.2;
        }
        if (rightArmRef.current) {
            rightArmRef.current.rotation.x = -1.4 + Math.sin(t * 3.5 + 1) * 0.1;
            rightArmRef.current.rotation.z = -0.2;
        }

        // Legs "The Limp"
        if (leftLegRef.current) {
            leftLegRef.current.rotation.x = Math.sin(t * 4) * 0.4;
        }
        if (rightLegRef.current) {
            rightLegRef.current.rotation.x = Math.sin(t * 4 + Math.PI) * 0.4;
            // Drag the broken leg a bit?
            // rightLegRef.current.rotation.x *= 0.5; 
        }

        // Eyes Chaos
        if (leftPupilRef.current && rightPupilRef.current) {
            // Random twitches
            const twitch = Math.sin(t * 15) > 0.9 ? 0.02 : 0;
            leftPupilRef.current.position.x = Math.sin(t) * 0.02;
            rightPupilRef.current.position.x = Math.sin(t * 1.2) * 0.02 + twitch;
        }
    });

    return (
        <group
            ref={groupRef}
            position={[zombie.position.x, 0, zombie.position.z]}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {/* Shadow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <circleGeometry args={[0.45, 16]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.3} />
            </mesh>

            <group ref={bodyGroupRef} position={[0, 0.85, 0]}>

                {/* --- HEAD --- */}
                <group ref={headRef} position={[0, 0.5, 0]}>
                    {/* Cranium */}
                    <mesh geometry={headGeometry} position={[0, -0.25, 0]}>
                        <meshStandardMaterial color={skinColor} roughness={0.4} />
                    </mesh>

                    {/* Hairs on top */}
                    {[0, 1, 2].map(i => (
                        <mesh key={i} position={[(i - 1) * 0.05, 0.48, 0]} rotation={[0, 0, (i - 1) * 0.3]}>
                            <cylinderGeometry args={[0.002, 0.002, 0.15, 4]} />
                            <meshStandardMaterial color="#222" />
                        </mesh>
                    ))}

                    {/* Eyes - Bulging */}
                    <group position={[0, 0.1, 0.22]}>
                        {/* Left Eye */}
                        <group position={[-0.12, 0.05, 0]}>
                            <mesh>
                                <sphereGeometry args={[0.1, 16, 16]} />
                                <meshStandardMaterial color="white" roughness={0.2} />
                            </mesh>
                            <mesh ref={leftPupilRef} position={[0, 0, 0.09]}>
                                <sphereGeometry args={[0.015, 8, 8]} />
                                <meshStandardMaterial color="black" />
                            </mesh>
                            {/* Eyelid (tired look) */}
                            <mesh position={[0, 0.06, 0.02]} rotation={[0.2, 0, 0]}>
                                <sphereGeometry args={[0.105, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
                                <meshStandardMaterial color={skinColor} side={THREE.DoubleSide} />
                            </mesh>
                        </group>

                        {/* Right Eye - Slightly smaller/different */}
                        <group position={[0.12, 0.06, 0]}>
                            <mesh>
                                <sphereGeometry args={[0.09, 16, 16]} />
                                <meshStandardMaterial color="white" roughness={0.2} />
                            </mesh>
                            <mesh ref={rightPupilRef} position={[0, 0, 0.08]}>
                                <sphereGeometry args={[0.012, 8, 8]} />
                                <meshStandardMaterial color="black" />
                            </mesh>
                            {/* Eyelid */}
                            <mesh position={[0, -0.06, 0.02]} rotation={[-0.2, 0, 0]}>
                                <sphereGeometry args={[0.095, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
                                <meshStandardMaterial color={skinColor} side={THREE.DoubleSide} />
                            </mesh>
                        </group>
                    </group>

                    {/* Jaw / Mouth */}
                    <group ref={jawRef} position={[0, -0.15, 0.15]}>
                        <mesh rotation={[0.1, 0, 0]}>
                            <cylinderGeometry args={[0.12, 0.08, 0.15, 8]} />
                            <meshStandardMaterial color={skinColor} />
                        </mesh>

                        {/* Teeth */}
                        <group position={[0, 0.08, 0.1]}>
                            {[-1, 1].map(s => (
                                <mesh key={s} position={[s * 0.04, 0, 0]}>
                                    <boxGeometry args={[0.02, 0.03, 0.01]} />
                                    <meshStandardMaterial color="#EEE" />
                                </mesh>
                            ))}
                        </group>
                    </group>
                </group>

                {/* --- TORSO (Suit) --- */}
                <group position={[0, 0, 0]}>
                    {/* Main Coat */}
                    <mesh position={[0, 0.15, 0]}>
                        <boxGeometry args={[0.45, 0.6, 0.25]} />
                        <meshStandardMaterial color={suitColor} roughness={0.7} />
                    </mesh>

                    {/* White Shirt Area */}
                    <mesh position={[0, 0.2, 0.13]}>
                        <planeGeometry args={[0.15, 0.4]} />
                        <meshStandardMaterial color={shirtColor} />
                    </mesh>

                    {/* Lapels */}
                    <mesh geometry={lapelRightGeo} position={[0.08, 0.42, 0.14]} rotation={[0, 0, 0]}>
                        <meshStandardMaterial color={suitColor} />
                    </mesh>
                    <mesh geometry={lapelLeftGeo} position={[-0.08, 0.42, 0.14]} rotation={[0, 0, 0]}>
                        <meshStandardMaterial color={suitColor} />
                    </mesh>

                    {/* Tie */}
                    <mesh geometry={tieGeo} position={[0, 0.38, 0.15]} rotation={[0, 0, 0]} scale={[0.8, 0.8, 1]}>
                        <meshStandardMaterial color={tieColor} />
                    </mesh>

                    {/* Collar */}
                    <mesh position={[0, 0.45, 0.12]} rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0.12, 0.15, 0.08, 16, 1, true, 0, Math.PI]} />
                        <meshStandardMaterial color={shirtColor} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* --- ARMS --- */}
                <group ref={leftArmRef} position={[-0.28, 0.35, 0]}>
                    {/* Sleeve */}
                    <mesh position={[0, -0.25, 0]}>
                        <cylinderGeometry args={[0.08, 0.07, 0.5, 8]} />
                        <meshStandardMaterial color={suitColor} />
                    </mesh>
                    {/* Hand */}
                    <mesh position={[0, -0.55, 0]}>
                        <boxGeometry args={[0.1, 0.12, 0.04]} />
                        <meshStandardMaterial color={skinColor} />
                    </mesh>
                    {/* Fingers */}
                    <mesh position={[0, -0.62, 0.02]} rotation={[0.5, 0, 0]}>
                        <boxGeometry args={[0.08, 0.08, 0.02]} />
                        <meshStandardMaterial color={skinColor} />
                    </mesh>
                </group>

                <group ref={rightArmRef} position={[0.28, 0.35, 0]}>
                    {/* Sleeve */}
                    <mesh position={[0, -0.25, 0]}>
                        <cylinderGeometry args={[0.08, 0.07, 0.5, 8]} />
                        <meshStandardMaterial color={suitColor} />
                    </mesh>
                    {/* Hand */}
                    <mesh position={[0, -0.55, 0]}>
                        <boxGeometry args={[0.1, 0.12, 0.04]} />
                        <meshStandardMaterial color={skinColor} />
                    </mesh>
                    <mesh position={[0, -0.62, 0.02]} rotation={[0.5, 0, 0]}>
                        <boxGeometry args={[0.08, 0.08, 0.02]} />
                        <meshStandardMaterial color={skinColor} />
                    </mesh>
                </group>
            </group>

            {/* --- LEGS --- */}
            <group position={[0, 0.6, 0]}>
                {/* Pelvis/Belt area */}
                <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[0.38, 0.15, 0.22]} />
                    <meshStandardMaterial color={pantsColor} />
                </mesh>

                {/* Left Leg (Intact) */}
                <group ref={leftLegRef} position={[-0.12, -0.1, 0]}>
                    <mesh position={[0, -0.3, 0]}>
                        <cylinderGeometry args={[0.08, 0.07, 0.6, 8]} />
                        <meshStandardMaterial color={pantsColor} />
                    </mesh>
                    {/* Shoe */}
                    <group position={[0, -0.65, 0.05]}>
                        {/* Sole */}
                        <mesh position={[0, 0.02, 0]}>
                            <boxGeometry args={[0.12, 0.04, 0.25]} />
                            <meshStandardMaterial color="#222" />
                        </mesh>
                        {/* Top */}
                        <mesh position={[0, 0.08, 0]}>
                            <sphereGeometry args={[0.08, 16, 16]} />
                            <meshStandardMaterial color={shoeColor} />
                        </mesh>
                    </group>
                </group>

                {/* Right Leg (Torn) */}
                <group ref={rightLegRef} position={[0.12, -0.1, 0]}>
                    {/* Upper Pant */}
                    <mesh position={[0, -0.15, 0]}>
                        <cylinderGeometry args={[0.08, 0.085, 0.3, 8]} />
                        <meshStandardMaterial color={pantsColor} />
                    </mesh>
                    {/* Bone Exposed */}
                    <mesh position={[0, -0.4, 0]}>
                        <cylinderGeometry args={[0.03, 0.02, 0.4, 6]} />
                        <meshStandardMaterial color="#DDD" />
                    </mesh>
                    {/* Shoe (Sock?) */}
                    <group position={[0, -0.65, 0.05]}>
                        <mesh position={[0, 0.02, 0]}>
                            <boxGeometry args={[0.12, 0.04, 0.25]} />
                            <meshStandardMaterial color="#222" />
                        </mesh>
                        <mesh position={[0, 0.08, 0]}>
                            <sphereGeometry args={[0.08, 16, 16]} />
                            <meshStandardMaterial color={shoeColor} />
                        </mesh>
                        {/* Sock */}
                        <mesh position={[0, 0.12, -0.02]}>
                            <cylinderGeometry args={[0.05, 0.06, 0.1, 8]} />
                            <meshStandardMaterial color="#FFF" />
                        </mesh>
                    </group>
                </group>

            </group>

            {/* Name Tag */}
            <sprite position={[0, 2.1, 0]} scale={[1.8, 0.45, 1]}>
                <spriteMaterial map={nameTexture} transparent depthTest={false} />
            </sprite>
        </group>
    );
}
