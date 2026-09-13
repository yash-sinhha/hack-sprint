/**
 * Smart Event Experience Platform - Core Data Store
 * NexusCon 2026: Global Tech & AI Summit
 */

export const EVENT_INFO = {
  id: "nexus-2026",
  name: "NexusCon 2026",
  tagline: "Global Tech & AI Summit",
  dates: "Sept 14 - 16, 2026",
  venue: "Metropolitan Convention & Innovation Center",
  totalRegistered: 4850,
  currentCheckins: 3412,
  wifi: {
    ssid: "NexusCon-Attendee-5G",
    pass: "Innovate2026!"
  },
  emergencyHotline: "+1 (800) 555-0911",
  securityDesk: "+1 (800) 555-SAFE"
};

export const INTEREST_CATEGORIES = [
  { id: "ai", label: "AI & Machine Learning", icon: "🤖" },
  { id: "cloud", label: "Cloud & Distributed Systems", icon: "☁️" },
  { id: "frontend", label: "Frontend & Design Systems", icon: "🎨" },
  { id: "security", label: "Cybersecurity & Privacy", icon: "🛡️" },
  { id: "robotics", label: "Robotics & IoT", icon: "🦾" },
  { id: "startups", label: "Startups & Venture Capital", icon: "🚀" },
  { id: "a11y", label: "Accessibility & Inclusion", icon: "♿" },
  { id: "devops", label: "DevOps & SRE", icon: "⚡" }
];

export const VENUE_ZONES = [
  {
    id: "main-arena",
    name: "Main Keynote Arena",
    category: "stage",
    capacity: 1200,
    currentCount: 890,
    status: "moderate", // low, moderate, high, critical
    floor: "Level 1",
    accessible: true,
    features: ["Wheelchair Front Rows", "Assisted Listening Devices", "ASL Live Interpretation", "Dual Ramps"],
    description: "The primary 1,200-seat plenary hall for morning keynotes, luminary fireside chats, and global awards.",
    bounds: { x: 50, y: 50, w: 260, h: 180 },
    center: { x: 180, y: 140 },
    color: "#6366f1"
  },
  {
    id: "hall-a",
    name: "Hall A: AI & Neural Systems",
    category: "sessions",
    capacity: 550,
    currentCount: 460,
    status: "high",
    floor: "Level 1",
    accessible: true,
    features: ["Step-free Entrance", "Wide Aisles (6ft)", "Reserved Seating"],
    description: "Dedicated deep-dive stage for generative AI models, agentic workflows, and neural inference scaling.",
    bounds: { x: 350, y: 50, w: 220, h: 180 },
    center: { x: 460, y: 140 },
    color: "#8b5cf6"
  },
  {
    id: "hall-b",
    name: "Hall B: Cloud & Engineering",
    category: "sessions",
    capacity: 450,
    currentCount: 220,
    status: "low",
    floor: "Level 1",
    accessible: true,
    features: ["Direct Ramp Access", "High-Contrast Display Monitors"],
    description: "Workshops and presentations covering resilient cloud architectures, Kubernetes, and developer velocity.",
    bounds: { x: 610, y: 50, w: 220, h: 180 },
    center: { x: 720, y: 140 },
    color: "#06b6d4"
  },
  {
    id: "expo-hall",
    name: "Innovation Expo & Sponsor Pavilion",
    category: "expo",
    capacity: 1500,
    currentCount: 1390,
    status: "critical", // Overcrowded zone by default for demonstration
    floor: "Level 1",
    accessible: true,
    features: ["Rest Resting Nodes", "Wide Main Concourse", "Sensory Break Signs"],
    description: "Interactive demo floor featuring 85+ global tech partners, interactive robotics showcases, and recruiter lounges.",
    bounds: { x: 350, y: 280, w: 480, h: 220 },
    center: { x: 590, y: 390 },
    color: "#f59e0b"
  },
  {
    id: "food-court",
    name: "Culinary & Networking Garden",
    category: "dining",
    capacity: 800,
    currentCount: 520,
    status: "moderate",
    floor: "Level 1",
    accessible: true,
    features: ["Accessible Low-Counters", "Dietary Allergen Stations", "Outdoor Shaded Seating"],
    description: "Artisan dining pavilion featuring organic snacks, specialty coffee, and shaded outdoor collaborative spaces.",
    bounds: { x: 50, y: 280, w: 260, h: 220 },
    center: { x: 180, y: 390 },
    color: "#10b981"
  },
  {
    id: "registration",
    name: "Registration & Welcome Atrium",
    category: "entry",
    capacity: 400,
    currentCount: 85,
    status: "low",
    floor: "Level 1",
    accessible: true,
    features: ["Step-free Entry Gates", "Braille Badge Printing", "Assistance Ambassadors"],
    description: "Main lobby, badge check-in, information kiosk, and attendee welcome bag distribution point.",
    bounds: { x: 50, y: 550, w: 260, h: 140 },
    center: { x: 180, y: 620 },
    color: "#3b82f6"
  },
  {
    id: "first-aid",
    name: "First Aid & Medical Emergency Station",
    category: "medical",
    capacity: 40,
    currentCount: 4,
    status: "low",
    floor: "Level 1",
    accessible: true,
    features: ["Paramedic On-duty", "AED & Defibrillator", "Emergency Wheelchairs", "Triage Beds"],
    description: "Dedicated medical station staffed 24/7 with certified doctors, EMTs, and rapid response personnel.",
    bounds: { x: 350, y: 550, w: 220, h: 140 },
    center: { x: 460, y: 620 },
    color: "#ef4444"
  },
  {
    id: "quiet-lounge",
    name: "Sensory & Quiet Sanctuary",
    category: "wellness",
    capacity: 60,
    currentCount: 14,
    status: "low",
    floor: "Level 1",
    accessible: true,
    features: ["Low Sensory Lighting", "Noise-Cancelling Headphones", "Service Animal Relief Zone"],
    description: "Calm, low-stimulation environment for attendees needing decompression, quiet reflection, or medical breaks.",
    bounds: { x: 610, y: 550, w: 220, h: 140 },
    center: { x: 720, y: 620 },
    color: "#14b8a6"
  }
];

// Graph Nodes for SVG Indoor Pathfinding
export const MAP_NODES = [
  // Major Zone Center/Entrance Nodes
  { id: "node-reg", name: "Registration Welcome Desk", zoneId: "registration", x: 180, y: 620, isAccessible: true, type: "entry" },
  { id: "node-reg-exit", name: "Main Building South Entrance", zoneId: "registration", x: 180, y: 670, isAccessible: true, type: "exit" },
  
  { id: "node-atrium-south", name: "Central South Walkway", zoneId: null, x: 310, y: 620, isAccessible: true, type: "junction" },
  { id: "node-firstaid", name: "First Aid Station Desk", zoneId: "first-aid", x: 460, y: 620, isAccessible: true, type: "medical" },
  { id: "node-quiet", name: "Quiet Sensory Lounge", zoneId: "quiet-lounge", x: 720, y: 620, isAccessible: true, type: "wellness" },

  // Central Corridor Junctions
  { id: "node-cross-south", name: "Concourse South Crossway", zoneId: null, x: 310, y: 520, isAccessible: true, type: "junction" },
  { id: "node-food", name: "Culinary Garden Entrance", zoneId: "food-court", x: 180, y: 390, isAccessible: true, type: "dining" },
  { id: "node-food-patio", name: "Outdoor Dining Patio", zoneId: "food-court", x: 70, y: 390, isAccessible: true, type: "dining" },

  // Expo Hall Walkways (The central congested zone)
  { id: "node-expo-west", name: "Expo West Gate", zoneId: "expo-hall", x: 370, y: 390, isAccessible: true, type: "expo" },
  { id: "node-expo-center", name: "Expo Main Floor Arena", zoneId: "expo-hall", x: 590, y: 390, isAccessible: true, type: "expo" },
  { id: "node-expo-east", name: "Expo East Gate", zoneId: "expo-hall", x: 810, y: 390, isAccessible: true, type: "expo" },

  // Alternate Bypass Walkways (Detour routes avoiding Expo Hall)
  { id: "node-west-bypass-mid", name: "West Corridor (Bypass Route)", zoneId: null, x: 310, y: 390, isAccessible: true, type: "junction" },
  { id: "node-east-bypass-mid", name: "East Outer Concourse", zoneId: null, x: 860, y: 390, isAccessible: true, type: "junction" },
  { id: "node-east-bypass-north", name: "East North Junction", zoneId: null, x: 860, y: 250, isAccessible: true, type: "junction" },
  { id: "node-east-bypass-south", name: "East South Junction", zoneId: null, x: 860, y: 520, isAccessible: true, type: "junction" },

  // North Concourse Junctions
  { id: "node-cross-north", name: "Grand North Concourse", zoneId: null, x: 310, y: 250, isAccessible: true, type: "junction" },
  { id: "node-hall-a-junction", name: "Hall A Access Plaza", zoneId: null, x: 460, y: 250, isAccessible: true, type: "junction" },
  { id: "node-hall-b-junction", name: "Hall B Access Plaza", zoneId: null, x: 720, y: 250, isAccessible: true, type: "junction" },

  // Stage Entrances
  { id: "node-arena-entry", name: "Keynote Arena Main Doors", zoneId: "main-arena", x: 180, y: 210, isAccessible: true, type: "stage" },
  { id: "node-arena-stage", name: "Keynote Stage & Podium", zoneId: "main-arena", x: 180, y: 100, isAccessible: true, type: "stage" },

  { id: "node-halla-entry", name: "Hall A Main Entrance", zoneId: "hall-a", x: 460, y: 210, isAccessible: true, type: "stage" },
  { id: "node-hallb-entry", name: "Hall B Main Entrance", zoneId: "hall-b", x: 720, y: 210, isAccessible: true, type: "stage" },

  // Accessibility / Vertical Transit Points
  { id: "node-stairs-center", name: "Central Atrium Grand Stairs", zoneId: null, x: 330, y: 320, isAccessible: false, type: "stairs" },
  { id: "node-elevator-west", name: "West ADA Glass Elevator", zoneId: null, x: 290, y: 320, isAccessible: true, type: "elevator" },
  { id: "node-ramp-north", name: "North Gentle ADA Ramp (1:12)", zoneId: null, x: 310, y: 230, isAccessible: true, type: "ramp" },

  // Key Amenities
  { id: "node-restroom-north", name: "North Accessible Restrooms", zoneId: null, x: 100, y: 250, isAccessible: true, type: "restroom" },
  { id: "node-restroom-south", name: "South Accessible Restrooms", zoneId: null, x: 100, y: 520, isAccessible: true, type: "restroom" },
  { id: "node-water-station", name: "Hydration & Bottle Fill Station", zoneId: null, x: 580, y: 250, isAccessible: true, type: "amenity" }
];

// Graph Edges with Distance, Accessibility Flags, and Zone Association
export const MAP_EDGES = [
  // Registration and South Corridor
  { from: "node-reg-exit", to: "node-reg", distance: 15, isAccessible: true, requiresStairs: false, zoneId: "registration" },
  { from: "node-reg", to: "node-atrium-south", distance: 30, isAccessible: true, requiresStairs: false, zoneId: "registration" },
  { from: "node-atrium-south", to: "node-firstaid", distance: 35, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-firstaid", to: "node-quiet", distance: 55, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-quiet", to: "node-east-bypass-south", distance: 35, isAccessible: true, requiresStairs: false, zoneId: null },

  { from: "node-atrium-south", to: "node-cross-south", distance: 25, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-cross-south", to: "node-restroom-south", distance: 45, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-cross-south", to: "node-food", distance: 40, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-food", to: "node-food-patio", distance: 25, isAccessible: true, requiresStairs: false, zoneId: "food-court" },

  // Vertical transition paths around middle junction
  // STAIRS OPTION (Non-accessible shortcut)
  { from: "node-cross-south", to: "node-stairs-center", distance: 15, isAccessible: false, requiresStairs: true, zoneId: null },
  { from: "node-stairs-center", to: "node-cross-north", distance: 15, isAccessible: false, requiresStairs: true, zoneId: null },

  // ACCESSIBLE ELEVATOR & RAMP OPTION (Accessible step-free path)
  { from: "node-cross-south", to: "node-elevator-west", distance: 18, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-elevator-west", to: "node-ramp-north", distance: 22, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-ramp-north", to: "node-cross-north", distance: 10, isAccessible: true, requiresStairs: false, zoneId: null },

  // West Bypass (Step-free corridor)
  { from: "node-cross-south", to: "node-west-bypass-mid", distance: 30, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-west-bypass-mid", to: "node-cross-north", distance: 30, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-food", to: "node-west-bypass-mid", distance: 30, isAccessible: true, requiresStairs: false, zoneId: null },

  // EXPO HALL THOROUGHFARE (Passes directly through the congested Expo Hall)
  { from: "node-cross-south", to: "node-expo-west", distance: 25, isAccessible: true, requiresStairs: false, zoneId: "expo-hall" },
  { from: "node-expo-west", to: "node-expo-center", distance: 50, isAccessible: true, requiresStairs: false, zoneId: "expo-hall" },
  { from: "node-expo-center", to: "node-expo-east", distance: 50, isAccessible: true, requiresStairs: false, zoneId: "expo-hall" },
  { from: "node-expo-center", to: "node-water-station", distance: 35, isAccessible: true, requiresStairs: false, zoneId: "expo-hall" },
  { from: "node-expo-east", to: "node-east-bypass-mid", distance: 20, isAccessible: true, requiresStairs: false, zoneId: "expo-hall" },

  // EAST BYPASS CORRIDOR (The clean detour around crowded Expo Hall)
  { from: "node-east-bypass-south", to: "node-east-bypass-mid", distance: 40, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-east-bypass-mid", to: "node-east-bypass-north", distance: 40, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-east-bypass-north", to: "node-hall-b-junction", distance: 35, isAccessible: true, requiresStairs: false, zoneId: null },

  // North Concourse & Stage Entries
  { from: "node-cross-north", to: "node-arena-entry", distance: 30, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-arena-entry", to: "node-arena-stage", distance: 25, isAccessible: true, requiresStairs: false, zoneId: "main-arena" },
  { from: "node-cross-north", to: "node-restroom-north", distance: 45, isAccessible: true, requiresStairs: false, zoneId: null },

  { from: "node-cross-north", to: "node-hall-a-junction", distance: 35, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-hall-a-junction", to: "node-halla-entry", distance: 15, isAccessible: true, requiresStairs: false, zoneId: "hall-a" },

  { from: "node-hall-a-junction", to: "node-water-station", distance: 28, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-water-station", to: "node-hall-b-junction", distance: 32, isAccessible: true, requiresStairs: false, zoneId: null },
  { from: "node-hall-b-junction", to: "node-hallb-entry", distance: 15, isAccessible: true, requiresStairs: false, zoneId: "hall-b" }
];

export const SESSIONS_DATA = [
  {
    id: "sess-1",
    title: "Opening Keynote: The Frontier of Multi-Agent Systems",
    speaker: "Dr. Elena Vance",
    speakerRole: "Chief Scientist & VP of AI",
    speakerCompany: "DeepMind Horizon",
    time: "09:00 AM - 10:15 AM",
    date: "Day 1 (Today)",
    stageId: "main-arena",
    stageName: "Main Keynote Arena",
    category: "ai",
    tags: ["AI & Machine Learning", "Autonomous Agents", "Future Tech"],
    capacity: 1200,
    registeredCount: 1140,
    status: "Live Now",
    description: "Explore the architectural breakthroughs turning probabilistic language models into coordinated, goal-driven autonomous systems."
  },
  {
    id: "sess-2",
    title: "Architecting Ultra-Resilient Kubernetes at Global Scale",
    speaker: "Marcus Sterling",
    speakerRole: "Staff Infrastructure Architect",
    speakerCompany: "CloudScale Infra",
    time: "10:30 AM - 11:30 AM",
    date: "Day 1 (Today)",
    stageId: "hall-b",
    stageName: "Hall B: Cloud & Engineering",
    category: "cloud",
    tags: ["Cloud & Distributed Systems", "DevOps & SRE", "Kubernetes"],
    capacity: 450,
    registeredCount: 390,
    status: "Upcoming",
    description: "Battle-tested disaster recovery strategies, multi-region failover automation, and real-time observability across 40+ clusters."
  },
  {
    id: "sess-3",
    title: "Zero-Latency UI: WebAssembly & Next-Gen Design Tokens",
    speaker: "Aria Takahashi",
    speakerRole: "Lead Design Systems Engineer",
    speakerCompany: "PixelForge Studio",
    time: "11:00 AM - 12:00 PM",
    date: "Day 1 (Today)",
    stageId: "hall-a",
    stageName: "Hall A: AI & Neural Systems",
    category: "frontend",
    tags: ["Frontend & Design Systems", "WebAssembly", "Performance"],
    capacity: 550,
    registeredCount: 480,
    status: "Upcoming",
    description: "How to combine modern web primitives, CSS container queries, and WASM rendering pipelines to achieve smooth 120fps desktop-class web applications."
  },
  {
    id: "sess-4",
    title: "Zero-Trust Security for Autonomous Agent Ecosystems",
    speaker: "Darius Thorne",
    speakerRole: "Head of Threat Intelligence",
    speakerCompany: "CyberShield Labs",
    time: "01:00 PM - 02:00 PM",
    date: "Day 1 (Today)",
    stageId: "hall-a",
    stageName: "Hall A: AI & Neural Systems",
    category: "security",
    tags: ["Cybersecurity & Privacy", "AI & Machine Learning", "Zero Trust"],
    capacity: 550,
    registeredCount: 510,
    status: "Upcoming",
    description: "Defending against prompt injections, sandboxing autonomous agent executions, and cryptographic attribution in real-time."
  },
  {
    id: "sess-5",
    title: "Inclusive by Design: Engineering Accessible Digital Worlds",
    speaker: "Sarah Jenkins & Carlos Ruiz",
    speakerRole: "Accessibility Champions",
    speakerCompany: "A11y Guild Global",
    time: "02:15 PM - 03:15 PM",
    date: "Day 1 (Today)",
    stageId: "main-arena",
    stageName: "Main Keynote Arena",
    category: "a11y",
    tags: ["Accessibility & Inclusion", "Frontend & Design Systems", "WCAG"],
    capacity: 1200,
    registeredCount: 650,
    status: "Upcoming",
    description: "Comprehensive blueprint for implementing WCAG AAA standards, screen-reader heuristics, and cognitive neurodivergent accommodations in product design."
  },
  {
    id: "sess-6",
    title: "Autonomous Robotics: Sensor Fusion & Spatial Intelligence",
    speaker: "Prof. Kenneth Zhao",
    speakerRole: "Director of Robotics Laboratory",
    speakerCompany: "RoboVanguard Institute",
    time: "02:30 PM - 03:30 PM",
    date: "Day 1 (Today)",
    stageId: "hall-b",
    stageName: "Hall B: Cloud & Engineering",
    category: "robotics",
    tags: ["Robotics & IoT", "AI & Machine Learning", "Sensors"],
    capacity: 450,
    registeredCount: 410,
    status: "Upcoming",
    description: "Integrating LiDAR, event cameras, and neural radiance fields (NeRFs) for real-time indoor robot localization and path obstacle evasion."
  },
  {
    id: "sess-7",
    title: "From Hacker to Founder: Seed to Series A Playbook",
    speaker: "Maya Lin",
    speakerRole: "General Partner",
    speakerCompany: "Nexus Ventures",
    time: "03:45 PM - 04:45 PM",
    date: "Day 1 (Today)",
    stageId: "main-arena",
    stageName: "Main Keynote Arena",
    category: "startups",
    tags: ["Startups & Venture Capital", "Tech Careers & Startups"],
    capacity: 1200,
    registeredCount: 920,
    status: "Upcoming",
    description: "Raw insights into early venture funding, finding your initial 10 design partners, avoiding common cap table pitfalls, and pitching technical vision."
  },
  {
    id: "sess-8",
    title: "Live Autonomous Robot Demo & Drone Mesh Flight",
    speaker: "RoboTech Showcase Team",
    speakerRole: "Field Engineers",
    speakerCompany: "AeroDynamics Co.",
    time: "04:30 PM - 05:15 PM",
    date: "Day 1 (Today)",
    stageId: "expo-hall",
    stageName: "Innovation Expo & Sponsor Pavilion",
    category: "robotics",
    tags: ["Robotics & IoT", "Live Demo"],
    capacity: 1500,
    registeredCount: 1400,
    status: "Upcoming",
    description: "Spectacular live exhibition of 12 synchronized quadcopters and bipedal quadruped robots navigating dynamic crowd obstacles in real-time."
  },
  {
    id: "sess-9",
    title: "Building Production-Grade AI Agents with Multi-Tool Reasoning",
    speaker: "Dr. Aris Thorne",
    speakerRole: "Principal AI Research Scientist",
    speakerCompany: "Nexus Intelligent Labs",
    time: "01:30 PM - 02:30 PM",
    date: "Day 1 (Today)",
    stageId: "hall-a",
    stageName: "Hall A: AI & Neural Systems",
    category: "ai",
    tags: ["AI & Machine Learning", "Autonomous Agents", "Generative AI"],
    capacity: 550,
    registeredCount: 520,
    status: "Upcoming",
    description: "Hands-on architectural guide to orchestrating multi-agent systems, context budgeting, and high-fidelity tool calling in enterprise environments."
  },
  {
    id: "sess-10",
    title: "Accessible AI: Multimodal Interfaces for Neurodiverse Users",
    speaker: "Maya Patel & Liam O'Connor",
    speakerRole: "Human-AI Interaction Leads",
    speakerCompany: "InclusiveAI Collective",
    time: "03:00 PM - 04:00 PM",
    date: "Day 1 (Today)",
    stageId: "hall-a",
    stageName: "Hall A: AI & Neural Systems",
    category: "ai",
    tags: ["AI & Machine Learning", "Accessibility & Inclusion", "Multimodal"],
    capacity: 550,
    registeredCount: 490,
    status: "Upcoming",
    description: "Designing cognitive accommodations, real-time auditory scene descriptions, and adaptive UI layouts powered by on-device multimodal models."
  }
];

export const AMENITIES_DATA = [
  {
    id: "amenity-aid",
    name: "Central First Aid & Emergency Hub",
    category: "Emergency & Health",
    location: "Level 1, South Hallway (Adjacent to Quiet Lounge)",
    nodeId: "node-firstaid",
    icon: "🚑",
    accessible: true,
    hours: "24 Hours Live",
    contact: "Ext 911 / Direct +1-800-555-0911"
  },
  {
    id: "amenity-restroom-n",
    name: "North Accessible Restrooms",
    category: "Restroom",
    location: "Level 1, Left of Keynote Arena",
    nodeId: "node-restroom-north",
    icon: "🚻",
    accessible: true,
    features: ["Wheelchair Roll-in", "Braille Signage", "Emergency Pull Cord"]
  },
  {
    id: "amenity-restroom-s",
    name: "South Accessible Restrooms",
    category: "Restroom",
    location: "Level 1, Next to Food Court",
    nodeId: "node-restroom-south",
    icon: "🚻",
    accessible: true,
    features: ["All-Gender Family Unit", "Changing Stations", "Step-free"]
  },
  {
    id: "amenity-quiet",
    name: "Sensory & Quiet Recovery Lounge",
    category: "Accessibility & Wellness",
    location: "Level 1, South-East Wing",
    nodeId: "node-quiet",
    icon: "🧘",
    accessible: true,
    features: ["Noise cancelling headsets", "Weighted blankets", "Dimmed dimmable lighting"]
  },
  {
    id: "amenity-elevator",
    name: "West ADA Glass Elevator",
    category: "Mobility",
    location: "West Concourse Junction",
    nodeId: "node-elevator-west",
    icon: "🛗",
    accessible: true,
    features: ["Audio Floor Announcer", "Low-Profile Tactile Buttons"]
  },
  {
    id: "amenity-water",
    name: "Chilled Water & Hydration Station",
    category: "Refreshment",
    location: "Central Concourse by Hall A",
    nodeId: "node-water-station",
    icon: "💧",
    accessible: true,
    features: ["Hands-free sensor refill", "Accessible height dispenser"]
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    title: "Crowd Advisory: Innovation Expo Peak Congestion",
    type: "alert", // urgent, alert, info
    timestamp: "10 minutes ago",
    author: "Event Operations Center",
    message: "Innovation Expo is currently experiencing heavy foot traffic (92% capacity). If traveling to Hall B, please use the East Outer Concourse detour."
  },
  {
    id: "ann-2",
    title: "Opening Keynote Overflow Available in Hall B",
    type: "info",
    timestamp: "25 minutes ago",
    author: "Stage Coordination",
    message: "Main Keynote Arena is approaching seating limits. High-definition simulcast is now live in Hall B with full AV amplification."
  },
  {
    id: "ann-3",
    title: "Complimentary Lunch & Dietary Stations Open",
    type: "info",
    timestamp: "45 minutes ago",
    author: "Hospitality Team",
    message: "Culinary Garden is now serving artisan bowls. Allergen-free, vegan, and halal options clearly marked at Station 3 & 4."
  }
];

export const INITIAL_INCIDENTS = [
  {
    id: "inc-101",
    type: "Medical Assistance",
    location: "Hall A, Row 14",
    zoneId: "hall-a",
    timestamp: "6 mins ago",
    status: "Responders En Route", // Pending Dispatch, Responders En Route, Resolved
    details: "Attendee reported severe dizziness and requested water/medical checkup.",
    priority: "High"
  },
  {
    id: "inc-102",
    type: "Mobility Escort Request",
    location: "South Registration Entrance",
    zoneId: "registration",
    timestamp: "18 mins ago",
    status: "Resolved",
    details: "Requested wheelchair guide from registration gate to Keynote Arena Row 1.",
    priority: "Medium"
  }
];

