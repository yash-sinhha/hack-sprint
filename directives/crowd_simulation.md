# Directive: Crowd Coordination & Path Rerouting

## Objective

Detect and manage event venue congestion to prevent bottlenecking, overcrowding hazards, and delays.

## Zone Density Classifications

- **Low (0% - 49% capacity)**: Normal movement speed. Default paths recommended.
- **Moderate (50% - 74% capacity)**: Normal traffic flow. Standard advisory indicator.
- **High (75% - 89% capacity)**: Slow traffic. System prompts warning when routing through this zone.
- **Critical (90% - 100%+ capacity)**: Severe congestion. System automatically flags zone as a high-cost obstacle in the pathfinding graph and calculates an alternate detour route.

## Dynamic Rerouting Engine

1. The routing graph consists of waypoints (nodes) and corridors (edges).
2. Each edge passing through or adjacent to a zone inherits an edge weight:
   - Base weight = physical distance in meters.
   - High zone penalty multiplier = 2.5x base distance.
   - Critical zone penalty multiplier = 10.0x base distance (effectively forcing A\* to find open detours).
3. If an attendee selects a destination that forces traversal through a Critical zone, the engine displays:
   - A congestion warning badge.
   - The estimated delay (e.g., "+6 mins due to congestion").
   - A toggle: **"Use Recommended Detour"** showing the clearer path in a distinct color.

## Simulation Mechanics

- For hackathon demonstrations, the platform supports both an automated tick (subtle random drift every 15 seconds) and an **Instant Surge Trigger** in the Organizer Dashboard so judges can immediately observe real-time rerouting in action.
