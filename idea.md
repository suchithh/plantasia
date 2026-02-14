# Plantasia: Guardians — Vision & Spec for AI Tools

> **For:** Antigravity AI / Stitch AI / Claude Code / Any AI coding tool
> **Context:** TreeHacks 2026 hackathon (36 hours, solo hacker)
> **Inspiration:** Plants vs Zombies (the original — colorful, goofy, educational)

---

## One-Sentence Pitch

A mobile game where you scan your real houseplants, they become characters in an isometric garden, and you protect them from disease-zombies by learning about plant care and actually doing it.

---

## The Vibe

**This is NOT a dark/grim game.** Think original Plants vs Zombies:
- Bright, colorful, but still stylized
- Zombies are goofy and educational, not scary
- It's an adventure, not a horror game
- You're learning while playing
- Winning feels good, losing is funny (not punishing)

**Visual Direction:**
- Isometric garden view (like Stardew Valley, Hay Day)
- Stylized plant characters (not realistic, not chibi-cute)
- Zombies are cartoony disease mascots
- Daytime garden with nice lighting (not dark/nighttime)
- Game world you want to hang out in

**What it's NOT:**
- A traditional app with cards and lists
- Dark/moody/grim aesthetic
- Scary or stressful
- Cluttered with UI elements

---

## Core Concept

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   YOUR REAL PLANTS       →      GAME CHARACTERS                    │
│   (photos you take)             (AI-generated avatars)              │
│                                                                     │
│   PLANT DISEASES         →      ZOMBIE ENEMIES                     │
│   (root rot, pests, etc)        (educational mascots)               │
│                                                                     │
│   LEARNING + DOING       →      DEFEATING ZOMBIES                  │
│   (care for your plant)         (earn rewards)                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Where AI Slots In

There are **4 key AI integration points**. For the hackathon prototype, these can be simulated with mock data, but the UI should be designed to accommodate real AI responses.

### 1. 🌱 Plant Avatar Generation

**Trigger:** User scans a plant with the camera

**What AI Does:**
- Identifies the plant species from the photo
- Generates a stylized character avatar for that plant
- Assigns a personality type

**User Experience:**
```
[User takes photo of their monstera]
     ↓
[Loading: "Creating your plant's character..."]
     ↓
[Avatar appears: A stylized monstera character with personality]
[Name suggestion: "Gerald" | Personality: "Dramatic Diva"]
     ↓
[User confirms or edits name]
[Plant joins the garden]
```

**For Prototype:** 
- Use a set of 5-6 pre-made plant avatars
- Randomly assign based on detected plant type
- Species detection can use GPT-4V or be simulated

**UI Needs:**
- Camera view for scanning
- Loading/generation animation
- Avatar reveal moment (should feel magical)
- Name input field
- Personality badge display

---

### 2. 💬 Plant Chat & Personality

**Trigger:** User taps on a plant to interact

**What AI Does:**
- Generates conversational responses in the plant's personality
- Warns about approaching threats
- Celebrates victories
- Gives care tips in character

**Personality Types:**
| Type | How They Talk | Example |
|------|---------------|---------|
| **Dramatic** | Over-the-top, needs attention | "FINALLY you check on me! I've been PARCHED for hours!" |
| **Chill** | Laid back, no worries | "Hey. Yeah I could use some water. No rush though." |
| **Anxious** | Worried, nervous | "Um, is that a zombie? Should I be worried? I'm worried." |
| **Wise** | Philosophical, calm | "Water comes to those who wait. But also, please water me." |
| **Cheerful** | Upbeat, encouraging | "You're doing great! We make such a good team! 🌟" |

**User Experience:**
```
[User taps Gerald in the garden]
     ↓
[Chat panel slides up]
     ↓
[Gerald says: "Oh thank goodness you're here! 
 Drownface is getting closer and my roots feel squishy! 
 Maybe we should let my soil dry out a bit? 🥺"]
     ↓
[Quick action buttons: "Got it!" | "Tell me more" | "How do I help?"]
```

**For Prototype:**
- Pre-written responses for common scenarios
- Template system: `{plant_name} + {personality} + {situation} = response`
- Can simulate Claude responses with hardcoded text

**UI Needs:**
- Chat bubble interface (plant avatar on left)
- Personality-colored chat bubbles
- Quick reply buttons
- Typing indicator for AI responses

---

### 3. 📸 Disease Detection from Photos

**Trigger:** User takes a photo of a plant that looks unhealthy

**What AI Does:**
- Analyzes the photo for signs of disease/stress
- Identifies the likely problem
- Spawns the matching zombie as a "diagnosis"
- Provides educational content about the disease

**User Experience:**
```
[User notices their plant looks bad]
     ↓
[Taps "Health Check" or "Something's wrong" button]
     ↓
[Camera opens: "Show me what's wrong"]
     ↓
[User photographs yellowing leaves]
     ↓
[AI analyzes...]
     ↓
[Result screen:]
"Uh oh! I detected signs of OVERWATERING 💧

This attracts: DROWNFACE
The Root Rot Zombie

[Zombie character appears with educational info]

What's happening:
• Roots are sitting in water too long
• This causes fungal growth
• Leaves turn yellow and mushy

How to defeat Drownface:
• Let soil dry out completely
• Check drainage holes
• Water less frequently

[Button: "Start the Battle!" or "I'll fix this!"]
```

**The Educational Loop:**
1. See a problem → 2. Learn what it is → 3. Learn how to fix it → 4. Fix it IRL → 5. Defeat the zombie → 6. Earn rewards

**For Prototype:**
- Support 3-4 common issues: overwatering, underwatering, sunburn, general neglect
- Can use GPT-4V for real detection or simulate with buttons ("My leaves are yellow", "Soil is dry", etc.)
- Pre-written educational content for each zombie/disease

**UI Needs:**
- Camera interface with guidance ("Show the affected leaves")
- Analysis loading animation
- Diagnosis reveal (zombie appears!)
- Educational content cards
- "How to defeat" checklist
- Battle start button

---

### 4. 🧟 Zombie Lore & Education

**What AI Does:**
- Generates educational backstory for each zombie
- Pulls real plant pathology information
- Makes learning feel like discovering game lore

**Each Zombie Has:**
| Zombie | Disease | Educational Content |
|--------|---------|---------------------|
| **Drownface** | Root Rot / Overwatering | How roots need oxygen, signs of overwatering, proper drainage |
| **Thirster** | Dehydration | How plants drink, wilting mechanics, watering schedules |
| **Sunscorch** | Light Burn | Light requirements, leaf burn, indirect vs direct sun |
| **Fungus Phil** | Fungal Infection | How fungi spread, humidity, treatment options |
| **The Swarm** | Pest Infestation | Common pests, organic treatments, prevention |
| **Neglecto** | General Neglect (Boss) | Overall plant care basics, building habits |

**Zombie Profile Screen:**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│   [Zombie Avatar: Drownface]                   │
│                                                 │
│   DROWNFACE                                    │
│   The Root Rot Zombie                          │
│   ─────────────────────────                    │
│                                                 │
│   "Born in waterlogged soil, Drownface        │
│   turns healthy roots into mush. He loves     │
│   saucers full of standing water and          │
│   pots without drainage holes."               │
│                                                 │
│   ⚔️ WEAKNESS: Dry soil, good drainage        │
│   💀 THREAT LEVEL: ★★★☆☆                       │
│   📚 PLANTS AFFECTED: All, especially         │
│      succulents and tropical plants           │
│                                                 │
│   [View Full Guide] [Battle History]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

**For Prototype:**
- Pre-written lore for 4-5 zombies
- Educational content from plant care resources
- Can enhance with Perplexity searches for real-time info

---

## Hardware Integration

**What We Have:**
- ESP32 microcontroller (Bluetooth)
- Soil moisture sensor
- Touch detection (built into ESP32)

**What Hardware Does:**
```
SENSOR READING          →    GAME EVENT
─────────────────────────────────────────
Soil > 80% moisture     →    Drownface spawns
(for extended time)

Soil < 20% moisture     →    Thirster spawns

Touch detected          →    Plant reacts happily
                             (+bonus interaction points)

Healthy soil range      →    Shield builds up
(40-60%)                     Zombies retreat
```

**In the UI:**
- Small sensor icon showing connection status
- Soil moisture displayed on plant (as a visual, not a number)
- Live updates when sensor data changes

**For Demo:**
- Real sensor on a real plant
- Judge touches plant → plant reacts in app
- Sensor shows soil moisture → affects zombie spawns
- Light sensing = simulated (manual quest completion)

---

## Quest System

Quests are how you earn coins and powerups. They're tied to real actions.

**Quest Types:**

| Quest | Real Action | Reward | Educational Tie-in |
|-------|-------------|--------|-------------------|
| "Water Gerald" | Actually water your plant, confirm in app | 50 coins | Watering best practices |
| "Sunny Day" | Put plant in sunlight for 2 hours | 30 coins | Light requirements |
| "Defeat Drownface" | Let soil dry to healthy range | 100 coins + trophy | Root rot prevention |
| "Daily Check-in" | Open app and check on plant | 10 coins | Building habits |
| "Health Photo" | Take a progress photo | 20 coins | Tracking plant health |
| "Touch Connection" | Physically interact with plant (sensor) | 15 coins | Plant-human bond |

**Zombie-Specific Quests:**
When a zombie is approaching, you get a quest to defeat it:

```
┌─────────────────────────────────────────────────┐
│  🧟 ACTIVE THREAT                               │
│                                                 │
│  Drownface is approaching Gerald!              │
│  Time remaining: 18 hours                      │
│                                                 │
│  ─────────────────────────────                 │
│                                                 │
│  QUEST: Defeat Drownface                       │
│                                                 │
│  □ Let soil dry below 60% moisture            │
│  □ Check drainage holes                        │
│  □ Learn about root rot (tap to read)         │
│                                                 │
│  REWARD: 100 coins + Drownface Trophy          │
│                                                 │
│  [View Drownface Guide]                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

**UI Needs:**
- Quest list (accessible from garden)
- Active quest banner when threat exists
- Progress indicators
- Reward celebration animation
- Trophy collection for defeated zombies

---

## The Main Screen: Your Garden

When you open the app, you see your garden immediately. No splash screen, no onboarding modal.

**What's In the Garden:**
- Your plants as characters, standing in their spots
- Approaching zombies (if any) visible at the edges
- Ground/grass/pots as the environment
- Maybe a small fence or garden border

**What's NOT Cluttered:**
- Minimal floating UI (coins in corner, that's it)
- No bottom navigation bar
- No cards or lists
- Information is accessed by tapping things

**Interactions:**
- Tap plant → Plant detail/chat panel slides up
- Tap zombie → Zombie info panel
- Tap "+" or empty spot → Add new plant
- Swipe/pan to see more of garden (if many plants)

**Visual States for Plants:**
- **Healthy:** Bright, happy, maybe slight idle animation
- **Threatened:** Slight worry expression, threat indicator
- **In Battle:** Defensive pose, battle effects
- **Damaged:** Wilted, bandaged, sad
- **Dead:** Grayscale, angel wings (moves to memorial area)

**Visual States for Zombies:**
- **Approaching:** Walking toward plant from edge
- **Arrived:** Next to plant, battle begins
- **Defeated:** Poof/retreat animation
- **Victory (if plant loses):** Celebration (goofy, not mean)

---

## Color Palette

**NOT dark. Colorful but stylized.**

```
Background/Garden:
- Grass: #90C67C (fresh green)
- Soil: #8B6F47 (warm brown)  
- Sky/BG: #87CEEB (light blue) or #F0F7DA (soft green-white)

Plants (healthy):
- Primary: #4ADE80 (vibrant green)
- Accent: #22C55E (deeper green)

Zombies/Threats:
- Drownface: #60A5FA (blue, water-themed)
- Thirster: #F59E0B (orange/amber, dry)
- Sunscorch: #EF4444 (red, burn)
- General zombie: #A855F7 (purple)

UI Elements:
- Coins: #FBBF24 (gold)
- Hearts/Health: #F87171 (coral red)
- Buttons: #3B82F6 (friendly blue)
- Text: #1F2937 (dark gray, not black)

Danger States:
- Warning: #FB923C (orange)
- Critical: #EF4444 (red)
- But even these should feel "game-y" not alarming
```

---

## Screen Flow

```
                    ┌──────────────┐
                    │   GARDEN     │ ← Main screen, always start here
                    │   (home)     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  TAP PLANT   │   │   TAP "+"    │   │  TAP ZOMBIE  │
│              │   │              │   │              │
│ Plant Detail │   │ Scan Plant   │   │ Zombie Info  │
│ + Chat       │   │ (Camera)     │   │ + Education  │
│ + Quests     │   │              │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
        │                  │
        ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ Health Check │   │ Avatar Gen   │
│ (Camera)     │   │ + Naming     │
│              │   │              │
│ Disease      │   │ Add to       │
│ Detection    │   │ Garden       │
└──────────────┘   └──────────────┘
```

---

## What Success Looks Like

When a judge walks by and sees your demo:

1. **First glance:** "Oh, this is a game with plants" (not "this is another plant app")
2. **Second look:** "Wait, those are their REAL plants?"
3. **The hook:** "And the zombies are actual diseases? That's clever"
4. **The hardware:** "The sensor triggers game events? Cool!"
5. **The learning:** "So you actually learn plant care by playing?"
6. **The polish:** "This looks really good for a hackathon project"

**Demo Flow (3 minutes):**
1. Show garden with plants
2. Show zombie approaching
3. Explain: "This is Drownface. He appears because the soil is too wet."
4. Show educational content about root rot
5. Show real sensor on real plant
6. Touch the plant → plant reacts
7. "When I let the soil dry out, Drownface is defeated"
8. Victory animation + reward

---

## Implementation Notes

**For the hackathon prototype:**

1. **Start with the garden view** — This is the hero screen
2. **Hardcode 2-3 plants** — Don't need full onboarding working
3. **Hardcode 1-2 zombies** — Drownface and Thirster are enough
4. **Simulate AI responses** — Pre-written text is fine
5. **Real sensor connection** — This is the "wow" factor, prioritize it
6. **Educational content** — Pre-write for each zombie type

**What Can Be Simulated:**
- AI avatar generation (use pre-made avatars)
- AI chat responses (use templates)
- Disease detection (use manual buttons)
- Light sensing (manual quest completion)

**What Should Be Real:**
- Bluetooth sensor connection
- Soil moisture reading
- Zombie spawn based on moisture
- Touch detection on plant

---

## Final Reminder

**Tone:** Educational adventure, not survival horror
**Aesthetic:** Colorful and game-y, not dark and grim
**Zombies:** Goofy mascots that teach you, not scary monsters
**Goal:** Make plant care fun and help people learn

Think "Duolingo but for plants" meets "Plants vs Zombies garden aesthetic."