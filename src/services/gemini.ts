// Plantasia: Guardians — Gemini AI Service
// Adapted from original/plantasia/services/gemini.ts for game context

import type { IdentificationResult, PersonalityResult, DiagnosisResult, PlantCharacter, ChatMessage, ZombieType } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.5-flash';

// ─── Core API Call ───

async function callGemini(prompt: string, imageBase64?: string): Promise<string> {
    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
        parts.unshift({
            inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64,
            },
        });
    }

    const response = await fetch(
        `${GEMINI_API_URL}/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function parseJsonResponse<T>(text: string): T {
    // Remove markdown code block if present
    const cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
    return JSON.parse(cleaned);
}

// ─── Plant Identification (Vision) ───

export async function identifyPlant(photoBase64: string): Promise<IdentificationResult> {
    const prompt = `You are a plant identification expert in the game "Plantasia: Guardians."
A player just scanned a plant photo. Identify it and respond in this EXACT JSON format:

{
  "species": "Scientific name",
  "commonName": "Common name",
  "confidence": 0.95,
  "careLevel": "easy"
}

careLevel must be one of: "easy", "moderate", "difficult"
confidence must be between 0 and 1.
Only respond with the JSON, nothing else.`;

    const text = await callGemini(prompt, photoBase64);
    return parseJsonResponse<IdentificationResult>(text);
}

// ─── Personality Generation ───

export async function generatePersonality(species: string, commonName: string): Promise<PersonalityResult> {
    const prompt = `You are the personality generator for "Plantasia: Guardians" — a Plants vs Zombies-style garden game.

Generate a fun, distinctive personality for a ${commonName} (${species}).

Personalities are game characters — they should be memorable and funny, like PvZ characters.
Think: dramatic diva, chill surfer, anxious worrier, wise grandparent, or bubbly cheerleader.

Respond in this EXACT JSON format:
{
  "suggestedName": "A fun character name (like Gerald, Princess Fern, Captain Cactus, Zen)",
  "personality": {
    "type": "one of: dramatic, chill, anxious, wise, cheerful",
    "quirks": ["quirk1", "quirk2", "quirk3"],
    "speakingStyle": "How they talk — keep it brief, fun, game-like"
  }
}

Make the name creative and fitting for the species. Only respond with JSON.`;

    const text = await callGemini(prompt);
    return parseJsonResponse<PersonalityResult>(text);
}

// ─── In-Character Plant Chat ───

export async function chatWithPlant(
    plant: PlantCharacter,
    userMessage: string,
    chatHistory: ChatMessage[],
    gameContext: {
        activeZombies: string[];
        activeQuests: string[];
        sensorStatus: string;
        recentEvents: string[];
    }
): Promise<string> {
    const historyText = chatHistory
        .slice(-6)
        .map(m => `${m.sender === 'plant' ? plant.nickname : 'Player'}: ${m.text}`)
        .join('\n');

    const prompt = `You are ${plant.nickname}, a ${plant.species} (${plant.commonName}) in the game "Plantasia: Guardians."

YOUR PERSONALITY:
- Type: ${plant.personality.type}
- Quirks: ${plant.personality.quirks.join(', ')}
- Speaking style: ${plant.personality.speakingStyle}
- Health: ${plant.healthStatus}
- Happiness: ${plant.happiness}/100
- Level: ${plant.level}

GAME CONTEXT:
- Active zombie threats: ${gameContext.activeZombies.length > 0 ? gameContext.activeZombies.join(', ') : 'None (peaceful!)'}
- Active quests: ${gameContext.activeQuests.length > 0 ? gameContext.activeQuests.join(', ') : 'None right now'}
- Sensor: ${gameContext.sensorStatus}
- Recent events: ${gameContext.recentEvents.join(', ') || 'Nothing new'}

RECENT CHAT:
${historyText || '(First conversation!)'}

RULES:
- Stay in character AT ALL TIMES
- Reference real plant care advice naturally (don't lecture)
- Mention game events if relevant (zombies, quests, sensor data)
- Keep responses short (1-3 sentences, this is a chat game)
- Be entertaining and educational at the same time
- Use your personality quirks
- Never break character or mention being an AI

Player says: "${userMessage}"

Respond as ${plant.nickname}:`;

    return await callGemini(prompt);
}

// ─── Disease Diagnosis ───

export async function diagnosePlant(
    symptoms: string,
    plantSpecies: string,
    photoBase64?: string
): Promise<DiagnosisResult> {
    const prompt = `You are the disease diagnostic system in "Plantasia: Guardians" — a game where plant diseases are represented as zombie enemies.

A player reports symptoms for their ${plantSpecies}:
"${symptoms}"

Based on the symptoms, identify the most likely disease and map it to a zombie type.

ZOMBIE TYPES:
- drownface: Overwatering / Root rot (too much water, soggy soil)
- thirster: Dehydration / Underwatering (dry soil, wilting)
- sunscorch: Light burn / Sun damage (bleached/burned leaves)
- fungus_phil: Fungal infection (mold, powdery mildew, spots)
- the_swarm: Pest infestation (bugs, webs, sticky residue)
- neglecto: General neglect (multiple issues, unknown cause)

Respond in this EXACT JSON format:
{
  "zombieType": "drownface",
  "disease": "Root Rot",
  "confidence": 0.85,
  "severity": "moderate",
  "explanation": "One sentence explaining what's happening to the plant",
  "defeatSteps": ["Step 1", "Step 2", "Step 3"]
}

severity must be one of: "minor", "moderate", "severe", "critical"
Only respond with JSON.`;

    const text = await callGemini(prompt, photoBase64);
    return parseJsonResponse<DiagnosisResult>(text);
}

// ─── Zombie Lore Generation ───

export async function generateZombieLore(zombieType: ZombieType): Promise<string> {
    const prompt = `You are the narrator of "Plantasia: Guardians" — a fun, educational garden game (like Plants vs Zombies meets Duolingo).

Write a short, entertaining paragraph (3-4 sentences) about the zombie "${zombieType}" approaching a garden.

Style: Fun, educational, slightly dramatic but never scary. Think David Attenborough narrating a cartoon.

Zombie descriptions:
- drownface: Water zombie, causes root rot
- thirster: Drought zombie, represents underwatering
- sunscorch: Fire zombie, represents light damage
- fungus_phil: Mushroom zombie, represents fungal disease
- the_swarm: Bug swarm zombie, represents pests
- neglecto: Ghost zombie, represents general neglect

Keep it game-y, educational, and under 4 sentences.`;

    return await callGemini(prompt);
}

// ─── Daily Check-In Analysis ───

export interface CheckInAnalysisRaw {
    healthy: boolean;
    confidence: number;
    tips: string[];
    zombieType?: ZombieType;
    disease?: string;
    severity?: 'minor' | 'moderate' | 'severe' | 'critical';
    explanation?: string;
    defeatSteps?: string[];
}

export async function analyzeCheckIn(photoBase64: string, plantSpecies: string): Promise<CheckInAnalysisRaw> {
    const prompt = `You are the daily health check system in "Plantasia: Guardians" — a game where plant diseases are zombie enemies.

A player is doing their daily check-in for their ${plantSpecies}. Analyze the photo and determine if the plant looks HEALTHY or if there's a problem.

If the plant looks HEALTHY, respond with:
{
  "healthy": true,
  "confidence": 0.9,
  "tips": ["One fun care tip", "Another helpful tip"]
}

If the plant shows signs of disease/stress, respond with:
{
  "healthy": false,
  "confidence": 0.85,
  "tips": ["Emergency tip 1", "Emergency tip 2"],
  "zombieType": "one of: drownface, thirster, sunscorch, fungus_phil, the_swarm, neglecto",
  "disease": "Disease name",
  "severity": "one of: minor, moderate, severe, critical",
  "explanation": "One sentence explaining what you see",
  "defeatSteps": ["Step 1 to fix it", "Step 2", "Step 3"]
}

ZOMBIE TYPES:
- drownface: Overwatering / Root rot (yellow leaves, soggy soil, mushy stems)
- thirster: Dehydration (wilting, dry crispy edges, light pot)
- sunscorch: Light burn (white/brown patches, bleached leaves)
- fungus_phil: Fungal infection (spots, mold, powdery coating)
- the_swarm: Pests (webs, sticky residue, tiny bugs)
- neglecto: General neglect (dust, multiple issues, droopy)

Lean slightly toward "healthy" for ambiguous photos — we want the game to be encouraging!
Only respond with JSON.`;

    const text = await callGemini(prompt, photoBase64);
    return parseJsonResponse<CheckInAnalysisRaw>(text);
}
