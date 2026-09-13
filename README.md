# 🌐 NexusCon 2026: Smart Event Experience & Operations Platform

> **A modern, accessible, real-time web platform engineered for large-scale conferences, expos, and hackathons.**
> Solves navigation confusion, overcrowding hazards, session discovery, accessibility limitations, delayed announcements, and emergency dispatch.

---

## 🌟 Core Problems Solved

1. **Confusing Indoor Event Navigation**  
   Interactive vector SVG floor plan with pan/zoom and dynamic pathfinding graph. Find stages, booths, dining gardens, restrooms, and emergency hubs with turn-by-turn guidance.
2. **Overcrowding & Bottlenecks (Crowd Radar)**  
   Real-time occupancy monitoring per zone with automatic detour rerouting around congested areas.
3. **Limited Accessibility (A11y Suite)**  
   Step-free / wheelchair routing (prioritizing ramps and elevators, eliminating stairs), WCAG AAA high contrast mode, dynamic font scaling, and Web Speech API narrator.
4. **Session Discovery & Personalization ("For You")**  
   Multi-track agenda search, keyword filtering, 1-click personal schedule curation, and algorithmic recommendations matched against attendee interests.
5. **Emergency Support & Rapid SOS**  
   1-click high-visibility panic button, automated shortest path to nearest First Aid station, and instantaneous incident dispatch to the Organizer Command Center.
6. **Delayed Announcements**  
   Live real-time announcement ticker with urgent auditory chimes synthesized via the Web Audio API.
7. **Organizer Command Operations**  
   Dual persona switch: live event KPIs, real-time crowd surge simulator, announcement broadcasting studio, and incident resolution console.

---

## 🏗️ 3-Layer Architecture

This project follows the strict 3-Layer Architecture defined in `AGENT.md`:

```mermaid
graph TD
    subgraph Layer 1: Directive
        D1["directives/smart_event_platform.md<br/>Platform Operational SOP"]
        D2["directives/crowd_simulation.md<br/>Crowd Rerouting Logic"]
        D3["directives/emergency_protocol.md<br/>Emergency Triage Protocol"]
    end

    subgraph Layer 2: Orchestration & Core App
      APP["frontend/js/app.js<br/>Central Orchestrator & State Store"]
      MAP["frontend/js/map.js<br/>Interactive SVG Vector Map & Dijkstra Engine"]
      REC["frontend/js/recommendations.js<br/>Interest Scoring Engine"]
      CROWD["frontend/js/crowd-engine.js<br/>Crowd Density & Surge Simulator"]
      SOS["frontend/js/sos-system.js<br/>Emergency Beacon & Triage System"]
      ORG["frontend/js/organizer.js<br/>Organizer Command Center & Broadcaster"]
      A11Y["frontend/js/accessibility.js<br/>Speech Synthesis & Audio Chimes"]
    end

    subgraph Layer 3: Execution Tools
      SERV["backend/execution/serve.ps1<br/>Zero-Dependency Local HTTP Server (PowerShell)"]
    end

    Layer 1 --> Layer 2
    Layer 2 --> Layer 3
```

- **Layer 1 (Directives)**: Standard Operating Procedures in `directives/` governing routing heuristics, emergency protocols, and crowd density classifications.
- **Layer 2 (Orchestration)**: Modular ES6+ JavaScript modules managing reactive state synchronization, Dijkstra pathfinding, speech narration, and `localStorage` persistence.
- **Layer 3 (Execution)**: `backend/execution/serve.ps1`, a lightweight, native Windows PowerShell web server leveraging `[System.Net.HttpListener]` with full MIME-type handling for zero-dependency local execution.

---

## 🚀 How to Run Locally

### Method 1: Using the Local PowerShell Server

Run the deterministic execution script directly in Windows PowerShell:

```powershell
.\backend\execution\serve.ps1 -OpenBrowser
```

Or specify a custom port:

```powershell
.\backend\execution\serve.ps1 -Port 8080 -OpenBrowser
```

The server will automatically start at `http://localhost:8080/` and launch your default browser.

### Method 2: Direct Browser Execution

You can also open `index.html` directly in modern web browsers (Chrome, Edge, Brave, Firefox) or any local HTTP server of your choice:

```powershell
Start-Process "http://localhost:8080"
```

> **Note:** The core platform is self-contained. Authentication uses the two minimal Node.js dependencies listed in `package.json`.

### Method 3: Run with Authentication

The sign-in and sign-up controls require the Node.js backend and a MongoDB Atlas database. Use Node.js 22.5 or newer.

From the project root, run:

```powershell
npm install
node backend/execution/auth_server.js
```

Create a `.env` file from `.env.example` and set `MONGODB_URI` to your MongoDB Atlas connection string. The optional `MONGODB_DB` and `AUTH_PORT` values default to `smart_event_experience` and `3000`. Open `http://localhost:3000/` after starting the server. Passwords are stored as salted `scrypt` hashes, never as plain text; login sessions use an HttpOnly cookie.

### Method 4: Deploy to Netlify

This repository includes a Netlify Function at `backend/netlify/functions/auth.js` and API routing in `netlify.toml`. Deployed clients use same-origin `/api/auth/*` requests because Netlify cannot run the local `AUTH_PORT` server.

Add these variables in Netlify site settings:

```text
MONGODB_URI=mongodb+srv://...
MONGODB_DB=smart_event_experience
SESSION_SECRET=<long-random-secret>
```

Keep the Atlas password and `SESSION_SECRET` out of committed files. After saving the variables, trigger a new deploy. MongoDB Atlas network access must allow connections from the deployment environment.

---

## 🎯 Step-by-Step Hackathon Demo Script

Follow this demo sequence to showcase all major user journeys:

### 👤 Attendee Experience Walkthrough

1. **Dashboard Overview**:
   - Open `http://localhost:8080/`.
   - Observe the **Live Announcement Ticker** at the top and the real-time event stats (Active Attendees, Venue Flow Status).
   - View the **Live Now** featured keynote session with a quick "Navigate to Stage" button.
2. **Search & Discovery**:
   - Click the **📅 Schedule & Discovery** tab.
   - Type `"AI"` or `"Kubernetes"` in the search input to observe instant filtering.
   - Filter by track chips (e.g., `🤖 AI & ML`, `♿ Accessibility`).
   - Click **`+ Add to Schedule`** on any session to bookmark it. Click **`★ My Bookmarked Schedule Only`** to filter down to your personal itinerary.
3. **Personalized Recommendations ("For You")**:
   - Click the **💡 For You** tab.
   - Click **`⚙️ Customize My Interests`** and select/unselect tags (e.g. _Robotics & IoT_, _Cybersecurity_).
   - Click **Save Preferences** and watch the recommendation cards instantly recalculate match scores and display clear rationales (e.g., _"Direct track match for Robotics"_).
4. **Interactive SVG Navigation & Route Calculation**:
   - Click the **🧭 Interactive Map & Navigation** tab.
   - Observe the 8 distinct zones (Keynote Arena, Hall A, Hall B, Innovation Expo, Food Garden, First Aid, Quiet Lounge, Registration).
   - Select Origin: `Registration Welcome Desk` and Destination: `Keynote Arena Main Doors`.
   - The animated glowing dashed route displays the shortest path with walking time (~2 mins, 100m).
5. **Step-Free / Accessible Routing in Action**:
   - Notice the central stairway node (`Stairs (Non-accessible)`).
   - Check the **`♿ Step-Free / Accessible Route`** box.
   - Watch the path recalculate: the route dynamically diverts away from stairs and travels through the **West ADA Glass Elevator** and **North ADA Ramp**!
   - Click **`🔊 Read Turn-by-Turn Directions`** to hear the Web Speech API narrate step-by-step audio instructions!
6. **Smart Crowd Congestion Detour**:
   - Notice the **Innovation & Sponsor Expo** is highlighted in Red (`Critical / Overcrowded`).
   - Choose Destination: `Hall B Main Entrance`.
   - With **`🛡️ Smart Detour`** enabled, the algorithm avoids the congested Expo Hall and routes you smoothly along the **East Outer Concourse** detour.
7. **Emergency SOS Beacon Flow**:
   - Click the prominent red **`🚨 SOS / EMERGENCY`** button in the top header.
   - Select _Medical Assistance_, select your current zone, and click **`DISPATCH EMERGENCY RESPONDERS NOW`**.
   - An urgent alert tone chimes, an emergency reference code (e.g., `#SOS-429`) is assigned, and you are shown the step-free route to the nearest 24/7 First Aid station!

---

### ⚡ Organizer Command Experience Walkthrough

1. **Switch to Organizer View**:
   - In the top header, click **`Switch to Organizer Mode ⚡`**.
   - The view smoothly transitions to the **Organizer Operations Command Center**.
2. **Operations KPIs**:
   - Review live metrics: Total Checked-in (3,412), Inside Venue Now, Congested Zones count, and Active SOS incidents.
3. **Live Crowd Density & Surge Simulator**:
   - Locate the **Venue Zone** table.
   - Click **`⚡ Surge (96%)`** on _Hall A_.
   - The zone occupancy instantly jumps to 96% (`CRITICAL`), triggering an immediate congestion advisory.
4. **Broadcast Live Announcement**:
   - In the **Broadcast Studio**, enter:
     - Title: `Keynote Overflow Stream Live`
     - Priority: `Operational Advisory (Amber)`
     - Message: `Hall A is at capacity. Overflow stream is now broadcasting in Hall B.`
   - Click **`📢 Broadcast to Attendees Now`**.
5. **Real-Time Synchronized Verification**:
   - Click **`← Return to Attendee Experience`**.
   - Observe that the live announcement banner at the top immediately displays the new bulletin, and the crowd radar reflects the surge!
6. **Incident Management & Resolution**:
   - Return to Organizer Mode and scroll to the **Emergency & SOS Incident Console**.
   - View the distress call submitted earlier by the attendee.
   - Click **`Dispatch Team 🚑`** (status changes to _Responders En Route_).
   - Click **`Resolve ✓`** (marks the incident closed and logs resolution time).

---

## ♿ Accessibility Compliance

- **WCAG AAA High-Contrast Mode**: Dedicated stark contrast theme accessible via the Accessibility Hub.
- **Dynamic Font Scaling**: Normal, Large (+15%), and Extra Large (+30%).
- **Step-Free Indoor Navigation**: Dijkstra graph search strictly avoids stairs and prioritizes elevators and ramps.
- **Screen Reader Announcements**: `aria-live="polite"` live region communicates all status updates, alerts, and routing directions.
- **Text-to-Speech Guidance**: Powered by the native Web Speech API.
- **Synthesized Audio Alerts**: Utilizes the Web Audio API to produce chime tones without relying on external media files.

---

## 📁 Repository Structure

```
HACK-SPRINT/
├── frontend/
│   ├── index.html                # Main semantic, accessible single-page application
│   ├── landing.html              # Standalone product landing page
│   ├── css/
│   │   └── styles.css            # Design system, glassmorphism, high-contrast, responsive layout
│   └── js/
│       ├── app.js               # Application coordinator, router, and event bus
│       ├── data.js              # Venue zones, graph waypoints/edges, sessions, amenities
│       ├── map.js               # Interactive SVG vector map & Dijkstra pathfinding engine
│       ├── recommendations.js   # Interest-based scoring and recommendation algorithm
│       ├── crowd-engine.js      # Zone crowd monitoring & surge simulator
│       ├── sos-system.js         # Emergency SOS triage and first-aid locator
│       ├── organizer.js          # Organizer dashboard, KPI metrics, broadcast studio
│       ├── accessibility.js      # Speech narrator, sound synthesizer, contrast manager
│       └── auth.js               # Sign-up and sign-in API client
├── directives/
│   ├── smart_event_platform.md  # Layer 1: Platform SOP
│   ├── crowd_simulation.md      # Layer 1: Crowd heuristics & detour routing SOP
│   ├── emergency_protocol.md    # Layer 1: Emergency & SOS response SOP
│   └── README.md
├── backend/
│   ├── execution/
│   │   ├── serve.ps1            # Layer 3: Local zero-dependency PowerShell HTTP server
│   │   ├── auth_server.js       # MongoDB authentication API and static file server
│   │   └── README.md
│   └── netlify/functions/
│       └── auth.js              # Serverless MongoDB authentication function
├── .env.example                 # Environment configuration template
├── package.json                  # Minimal authentication dependencies
├── .gitignore                   # Ignores temp files, credentials, and virtual environments
├── AGENT.md                     # 3-Layer Architecture rules
├── AGENTS.md                    # Mirror of AGENT.md
├── CLAUDE.md                    # Mirror of AGENT.md
├── GEMINI.md                    # Mirror of AGENT.md
└── README.md                    # Project documentation & demo guide
```

---

## 👥 Hackathon Team & Credits

Built for the Hackathon Sprint • Designed for maximum attendee safety, engagement, and accessibility.
