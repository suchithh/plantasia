import * as THREE from 'three';

/**
 * Smoothly damps a value towards a target using frame-rate independent lerp.
 * @param current The current value
 * @param target The target value
 * @param lambda Smoothing factor (higher is faster, e.g., 5-20)
 * @param delta Time delta in seconds
 * @returns The new damped value
 */
export function damp(current: number, target: number, lambda: number, delta: number): number {
    return THREE.MathUtils.damp(current, target, lambda, delta);
}

/**
 * Smoothly damps a Vector3 towards a target.
 */
export function dampv3(current: THREE.Vector3, target: THREE.Vector3, lambda: number, delta: number) {
    current.x = THREE.MathUtils.damp(current.x, target.x, lambda, delta);
    current.y = THREE.MathUtils.damp(current.y, target.y, lambda, delta);
    current.z = THREE.MathUtils.damp(current.z, target.z, lambda, delta);
}

/**
 * Smoothly damps a Euler rotation towards a target.
 */
export function dampe(current: THREE.Euler, target: THREE.Euler, lambda: number, delta: number) {
    current.x = THREE.MathUtils.damp(current.x, target.x, lambda, delta);
    current.y = THREE.MathUtils.damp(current.y, target.y, lambda, delta);
    current.z = THREE.MathUtils.damp(current.z, target.z, lambda, delta);
}
