# Directive: Smart Event Experience Platform

## Objective

Provide an all-in-one, accessible, real-time web platform for large-scale conferences, expos, and hackathons that solves navigation confusion, overcrowding, session discovery, accessibility limitations, and emergency coordination for both attendees and organizers.

## System Architecture (3 Layers)

- **Layer 1: Directive (SOPs in `directives/`)**
  - Defines the core operational rules, data flows, and triage workflows.
- **Layer 2: Orchestration (JavaScript Event Bus & Reactive State)**
  - Manages dual-persona switching (Attendee vs. Organizer).
  - Coordinates real-time state synchronization via custom events and `localStorage`.
  - Routes pathfinding, personalization scoring, and crowd rerouting.
- **Layer 3: Execution (Deterministic Tools in `execution/`)**
  - `execution/serve.ps1`: Native Windows PowerShell HTTP server utilizing `[System.Net.HttpListener]` with MIME-type resolution for zero-dependency local hosting.

## User Personas & Flows

### 1. Attendee Persona

- **Home Dashboard**: Live event pulse, active notifications, quick stats, highlighted sessions, next upcoming bookmarked session.
- **Interactive Map & Navigation**: Interactive SVG floor plan with pan, zoom, location selection, turn-by-turn routing, and accessible (step-free) toggle.
- **Schedule Discovery**: Comprehensive search and filtering by category, stage, and time window; 1-click "Add to My Schedule".
- **Personalized Recommendations ("For You")**: Interest profile selection, relevance scoring algorithm, match justification.
- **Crowd Radar**: Real-time zone density indicators (Low, Moderate, High, Critical) with automatic alternate route prompts.
- **Emergency & SOS**: Always-visible high-visibility SOS trigger, quick incident dispatch, automatic calculation of route to nearest First Aid station.
- **Accessibility Suite**: High-contrast mode, text scaling, speech narrator (Web Speech API), step-free route preference, and accessible amenities locator.

### 2. Organizer Persona

- **Operations Dashboard**: Real-time KPI cards (attendees present, capacity utilization, active alerts, pending SOS calls).
- **Crowd Management Studio**: Manual override and surge simulation per zone with immediate attendee alert propagation.
- **Broadcast Studio**: Urgent and standard announcement drafting with instantaneous attendee notification banner.
- **Incident Management Console**: Live queue of attendee distress calls with responder dispatch and resolution lifecycle.
- **Session Operations**: Real-time room status updates and schedule adjustments.

## State Management Rules

1. All user preferences (interests, theme, accessibility settings, bookmarked sessions) must persist across browser sessions via `localStorage`.
2. All operational changes made by the Organizer (announcements, crowd overrides, incident statuses) must be immediately reflected in Attendee Mode without requiring full page refresh.
3. Fallbacks and defaults must be provided for all mock endpoints and offline usage.
