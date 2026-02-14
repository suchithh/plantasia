// Plantasia: Guardians — Web Bluetooth Service
// Connects to ESP32 "Plantasia-Sensor" device via BLE

import type { SensorData } from '../types';

// BLE UUIDs (must match ESP32 firmware)
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const SENSOR_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

type SensorCallback = (data: SensorData) => void;

let device: BluetoothDevice | null = null;
let characteristic: BluetoothRemoteGATTCharacteristic | null = null;
const listeners: SensorCallback[] = [];

// ─── Check Support ───

export function isWebBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

// ─── Connect ───

export async function connectToSensor(): Promise<boolean> {
    if (!isWebBluetoothSupported()) {
        console.warn('Web Bluetooth not supported in this browser');
        return false;
    }

    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'Plantasia' }],
            optionalServices: [SERVICE_UUID],
        });

        if (!device.gatt) throw new Error('No GATT server');

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        characteristic = await service.getCharacteristic(SENSOR_CHAR_UUID);

        // Subscribe to notifications
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleSensorData);

        // Listen for disconnection
        device.addEventListener('gattserverdisconnected', () => {
            console.log('BLE device disconnected');
            device = null;
            characteristic = null;
        });

        console.log('✅ Connected to Plantasia sensor via BLE');
        return true;
    } catch (err) {
        console.error('BLE connection failed:', err);
        return false;
    }
}

// ─── Parse Sensor Data ───

function handleSensorData(event: Event) {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const data = parseSensorPacket(value);
    listeners.forEach(cb => cb(data));
}

export function parseSensorPacket(value: DataView): SensorData {
    // Expected packet format from ESP32:
    // Byte 0-1: GSR value (uint16, little-endian)
    // Byte 2-3: Soil moisture raw (uint16, little-endian)
    // Byte 4-7: GSR variance (float32, little-endian)
    // Byte 8: Touch detected (uint8, 0 or 1)

    const gsrValue = value.byteLength >= 2 ? value.getUint16(0, true) : 0;
    const soilRaw = value.byteLength >= 4 ? value.getUint16(2, true) : 0;
    const gsrVariance = value.byteLength >= 8 ? value.getFloat32(4, true) : 0;
    const touchByte = value.byteLength >= 9 ? value.getUint8(8) : 0;

    // Convert raw soil moisture (0-4095 ADC) to percentage (0-100)
    const soilMoisture = Math.min(100, Math.max(0, (soilRaw / 4095) * 100));

    return {
        gsrValue,
        soilMoisture: Math.round(soilMoisture),
        gsrVariance,
        touchDetected: touchByte === 1,
        timestamp: Date.now(),
    };
}

// ─── Subscribe ───

export function onSensorData(callback: SensorCallback): () => void {
    listeners.push(callback);
    return () => {
        const idx = listeners.indexOf(callback);
        if (idx >= 0) listeners.splice(idx, 1);
    };
}

// ─── Disconnect ───

export function disconnectSensor(): void {
    if (characteristic) {
        characteristic.removeEventListener('characteristicvaluechanged', handleSensorData);
    }
    if (device?.gatt?.connected) {
        device.gatt.disconnect();
    }
    device = null;
    characteristic = null;
}

// ─── Status ───

export function isConnected(): boolean {
    return device?.gatt?.connected ?? false;
}
