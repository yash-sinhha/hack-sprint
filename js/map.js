/**
 * Smart Event Experience Platform - Interactive SVG Map & Pathfinding Engine
 */

import { VENUE_ZONES, MAP_NODES, MAP_EDGES } from './data.js';

export class EventMapEngine {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.zones = [...VENUE_ZONES];
    this.nodes = [...MAP_NODES];
    this.edges = [...MAP_EDGES];

    // Pan & Zoom state
    this.viewBox = { x: 0, y: 0, w: 960, h: 720 };
    this.baseViewBox = { x: 0, y: 0, w: 960, h: 720 };
    this.zoom = 1;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };

    // Active Route State
    this.currentRoute = null;
    this.selectedOrigin = "node-reg";
    this.selectedDestination = "node-arena-entry";
    this.accessibleOnly = false;
    this.avoidCrowds = true;
    this.selectedZone = null;

    // Callbacks
    this.onZoneSelected = options.onZoneSelected || null;
    this.onRouteCalculated = options.onRouteCalculated || null;

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
    // Default initial route
    this.computeAndRenderRoute();
  }

  updateZoneData(updatedZones) {
    this.zones = [...updatedZones];
    this.render();
    if (this.currentRoute) {
      this.computeAndRenderRoute();
    }
  }

  setAccessibleRouting(enabled) {
    this.accessibleOnly = !!enabled;
    this.computeAndRenderRoute();
  }

  setAvoidCrowds(enabled) {
    this.avoidCrowds = !!enabled;
    this.computeAndRenderRoute();
  }

  setOrigin(nodeId) {
    this.selectedOrigin = nodeId;
    this.computeAndRenderRoute();
  }

  setDestination(nodeId) {
    this.selectedDestination = nodeId;
    this.computeAndRenderRoute();
  }

  resetView() {
    this.viewBox = { ...this.baseViewBox };
    this.zoom = 1;
    this.updateSvgViewBox();
  }

  zoomIn() {
    this.setZoom(this.zoom * 1.25);
  }

  zoomOut() {
    this.setZoom(this.zoom / 1.25);
  }

  setZoom(newZoom) {
    const minZoom = 0.7;
    const maxZoom = 2.5;
    const clamped = Math.max(minZoom, Math.min(maxZoom, newZoom));
    const factor = this.zoom / clamped;
    this.zoom = clamped;

    const centerX = this.viewBox.x + this.viewBox.w / 2;
    const centerY = this.viewBox.y + this.viewBox.h / 2;

    this.viewBox.w = this.baseViewBox.w / this.zoom;
    this.viewBox.h = this.baseViewBox.h / this.zoom;
    this.viewBox.x = centerX - this.viewBox.w / 2;
    this.viewBox.y = centerY - this.viewBox.h / 2;

    this.updateSvgViewBox();
  }

  updateSvgViewBox() {
    const svg = this.container.querySelector('svg');
    if (svg) {
      svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.w} ${this.viewBox.h}`);
    }
  }

  render() {
    // Generate Zone SVG blocks
    const zonesMarkup = this.zones.map(zone => {
      const isSelected = this.selectedZone === zone.id;
      const statusClass = `status-${zone.status}`;
      const occupancyPct = Math.round((zone.currentCount / zone.capacity) * 100);

      // Color mapping according to crowd level
      let crowdColor = "#10b981"; // green
      let crowdText = "Optimal";
      if (zone.status === "moderate") {
        crowdColor = "#3b82f6";
        crowdText = "Normal";
      } else if (zone.status === "high") {
        crowdColor = "#f59e0b";
        crowdText = "Busy";
      } else if (zone.status === "critical") {
        crowdColor = "#ef4444";
        crowdText = "Congested";
      }

      return `
        <g class="zone-group ${isSelected ? 'zone-selected' : ''}" data-zone-id="${zone.id}" tabindex="0" role="button" aria-label="${zone.name}, ${occupancyPct}% full, ${crowdText}">
          <rect
            x="${zone.bounds.x}"
            y="${zone.bounds.y}"
            width="${zone.bounds.w}"
            height="${zone.bounds.h}"
            rx="12"
            class="zone-rect ${zone.status}"
            fill="${zone.color}"
            fill-opacity="0.12"
            stroke="${zone.color}"
            stroke-width="${isSelected ? '3' : '1.5'}"
          />
          <!-- Zone Title & Capacity Badge -->
          <text x="${zone.bounds.x + 14}" y="${zone.bounds.y + 26}" class="zone-title" fill="#ffffff" font-weight="600" font-size="14">
            ${zone.name}
          </text>
          <text x="${zone.bounds.x + 14}" y="${zone.bounds.y + 45}" class="zone-subtitle" fill="#94a3b8" font-size="11">
            ${zone.floor} • Cap: ${zone.capacity}
          </text>

          <!-- Status Indicator Pill inside Zone -->
          <g transform="translate(${zone.bounds.x + zone.bounds.w - 95}, ${zone.bounds.y + 12})">
            <rect width="82" height="22" rx="11" fill="${crowdColor}" fill-opacity="0.2" stroke="${crowdColor}" stroke-width="1" />
            <circle cx="12" cy="11" r="4" fill="${crowdColor}" />
            <text x="22" y="15" fill="${crowdColor}" font-size="10" font-weight="bold">${occupancyPct}% ${crowdText}</text>
          </g>

          <!-- Zone Feature Icons -->
          <g transform="translate(${zone.bounds.x + 14}, ${zone.bounds.y + zone.bounds.h - 22})">
            <text fill="#cbd5e1" font-size="12">${zone.accessible ? '♿ Accessible' : ''}</text>
          </g>
        </g>
      `;
    }).join('');

    // Generate Graph Edges (Corridors)
    const edgesMarkup = this.edges.map(edge => {
      const fromNode = this.nodes.find(n => n.id === edge.from);
      const toNode = this.nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return '';

      let strokeColor = "#334155"; // standard corridor
      let strokeDash = "none";
      let strokeWidth = "3";

      if (edge.requiresStairs) {
        strokeColor = "#f43f5e"; // Stairs in red/dash
        strokeDash = "4 4";
        strokeWidth = "2.5";
      } else if (fromNode.type === "elevator" || toNode.type === "elevator" || fromNode.type === "ramp" || toNode.type === "ramp") {
        strokeColor = "#38bdf8"; // Accessible ramps/elevators in light cyan
        strokeWidth = "3.5";
      }

      return `
        <line
          x1="${fromNode.x}"
          y1="${fromNode.y}"
          x2="${toNode.x}"
          y2="${toNode.y}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDash}"
          stroke-linecap="round"
          class="corridor-line ${edge.requiresStairs ? 'corridor-stairs' : ''}"
        />
      `;
    }).join('');

    // Generate Nodes (Markers)
    const nodesMarkup = this.nodes.map(node => {
      let icon = "📍";
      let nodeColor = "#94a3b8";
      let radius = 6;

      if (node.type === "medical") {
        icon = "🚑";
        nodeColor = "#ef4444";
        radius = 10;
      } else if (node.type === "restroom") {
        icon = "🚻";
        nodeColor = "#38bdf8";
        radius = 8;
      } else if (node.type === "stage") {
        icon = "🎤";
        nodeColor = "#818cf8";
        radius = 8;
      } else if (node.type === "elevator") {
        icon = "🛗";
        nodeColor = "#06b6d4";
        radius = 9;
      } else if (node.type === "ramp") {
        icon = "♿";
        nodeColor = "#10b981";
        radius = 8;
      } else if (node.type === "stairs") {
        icon = "🪜";
        nodeColor = "#f43f5e";
        radius = 8;
      } else if (node.type === "entry") {
        icon = "🚪";
        nodeColor = "#60a5fa";
        radius = 9;
      } else if (node.type === "dining") {
        icon = "🥗";
        nodeColor = "#34d399";
        radius = 8;
      }

      return `
        <g class="map-node" data-node-id="${node.id}" transform="translate(${node.x}, ${node.y})" tabindex="0" role="button" aria-label="${node.name}">
          <circle cx="0" cy="0" r="${radius}" fill="#0f172a" stroke="${nodeColor}" stroke-width="2" class="node-circle" />
          <text x="0" y="4" text-anchor="middle" font-size="10" class="node-icon">${icon}</text>
          <text x="0" y="${radius + 14}" text-anchor="middle" font-size="9" fill="#94a3b8" class="node-label" font-weight="500">
            ${node.name}
          </text>
        </g>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="map-wrapper">
        <svg
          viewBox="${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.w} ${this.viewBox.h}"
          preserveAspectRatio="xMidYMid meet"
          class="event-svg-map"
          role="img"
          aria-label="Interactive Event Floor Plan"
        >
          <defs>
            <filter id="glow-path" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="100%" stop-color="#818cf8" />
            </linearGradient>
            <linearGradient id="detour-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#34d399" />
              <stop offset="100%" stop-color="#10b981" />
            </linearGradient>
          </defs>

          <!-- Background Floor Tile Grid -->
          <rect x="0" y="0" width="960" height="720" fill="#0b0f19" rx="16" />
          <g class="map-grid" opacity="0.1">
            ${Array.from({ length: 19 }).map((_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="720" stroke="#64748b" stroke-width="1" />`).join('')}
            ${Array.from({ length: 15 }).map((_, i) => `<line x1="0" y1="${i * 50}" x2="960" y2="${i * 50}" stroke="#64748b" stroke-width="1" />`).join('')}
          </g>

          <!-- Corridors Layer -->
          <g class="map-edges-layer">${edgesMarkup}</g>

          <!-- Zones Layer -->
          <g class="map-zones-layer">${zonesMarkup}</g>

          <!-- Calculated Active Route Layer (Rendered dynamically) -->
          <g class="map-route-layer" id="active-route-layer"></g>

          <!-- Waypoints / Nodes Layer -->
          <g class="map-nodes-layer">${nodesMarkup}</g>
        </svg>

        <!-- Floating Map Overlay Controls -->
        <div class="map-controls-panel">
          <button type="button" class="map-btn" id="btn-zoom-in" title="Zoom In" aria-label="Zoom In">➕</button>
          <button type="button" class="map-btn" id="btn-zoom-out" title="Zoom Out" aria-label="Zoom Out">➖</button>
          <button type="button" class="map-btn" id="btn-reset-view" title="Reset View" aria-label="Reset Map View">🎯</button>
        </div>

        <!-- Legend Overlay -->
        <div class="map-legend">
          <div class="legend-item"><span class="legend-chip" style="background:#10b981"></span> Optimal / Low</div>
          <div class="legend-item"><span class="legend-chip" style="background:#3b82f6"></span> Moderate</div>
          <div class="legend-item"><span class="legend-chip" style="background:#f59e0b"></span> High</div>
          <div class="legend-item"><span class="legend-chip" style="background:#ef4444"></span> Congested</div>
          <div class="legend-item"><span class="legend-chip" style="background:#38bdf8"></span> Step-Free Route</div>
          <div class="legend-item"><span class="legend-chip" style="border:1px dashed #f43f5e"></span> Stairs</div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const svg = this.container.querySelector('svg');
    if (!svg) return;

    // Zoom Controls
    this.container.querySelector('#btn-zoom-in')?.addEventListener('click', () => this.zoomIn());
    this.container.querySelector('#btn-zoom-out')?.addEventListener('click', () => this.zoomOut());
    this.container.querySelector('#btn-reset-view')?.addEventListener('click', () => this.resetView());

    // Mouse Pan & Drag
    svg.addEventListener('mousedown', (e) => {
      if (e.target.closest('.zone-group') || e.target.closest('.map-node')) return;
      this.isPanning = true;
      this.panStart = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPanning) return;
      const dx = (e.clientX - this.panStart.x) * (this.viewBox.w / 960);
      const dy = (e.clientY - this.panStart.y) * (this.viewBox.h / 720);
      this.viewBox.x -= dx;
      this.viewBox.y -= dy;
      this.panStart = { x: e.clientX, y: e.clientY };
      this.updateSvgViewBox();
    });

    window.addEventListener('mouseup', () => {
      this.isPanning = false;
    });

    // Wheel Zoom
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      this.setZoom(this.zoom * zoomFactor);
    }, { passive: false });

    // Zone Selection
    this.container.querySelectorAll('.zone-group').forEach(group => {
      group.addEventListener('click', () => {
        const zoneId = group.getAttribute('data-zone-id');
        this.selectZone(zoneId);
      });
      group.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const zoneId = group.getAttribute('data-zone-id');
          this.selectZone(zoneId);
        }
      });
    });

    // Node Selection
    this.container.querySelectorAll('.map-node').forEach(nodeGroup => {
      nodeGroup.addEventListener('click', () => {
        const nodeId = nodeGroup.getAttribute('data-node-id');
        this.selectNodeAsDestination(nodeId);
      });
    });
  }

  selectZone(zoneId) {
    this.selectedZone = zoneId;
    const zone = this.zones.find(z => z.id === zoneId);
    if (!zone) return;

    // Find the primary entry node for this zone
    const targetNode = this.nodes.find(n => n.zoneId === zoneId && (n.type === 'stage' || n.type === 'entry' || n.type === 'medical' || n.type === 'expo' || n.type === 'dining' || n.type === 'wellness')) || this.nodes.find(n => n.zoneId === zoneId);

    if (targetNode) {
      this.selectedDestination = targetNode.id;
      this.computeAndRenderRoute();
    }

    if (this.onZoneSelected) {
      this.onZoneSelected(zone);
    }
  }

  selectNodeAsDestination(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;
    this.selectedDestination = nodeId;
    if (node.zoneId) {
      this.selectedZone = node.zoneId;
    }
    this.computeAndRenderRoute();
  }

  /**
   * Dijkstra / A* Shortest Path Algorithm
   * Supports Accessible (Step-free) and Crowd Avoidance penalties
   */
  calculateRoute(startId, endId, options = {}) {
    const accessibleOnly = options.accessibleOnly ?? this.accessibleOnly;
    const avoidCrowds = options.avoidCrowds ?? this.avoidCrowds;

    if (!this.nodes.some(n => n.id === startId) || !this.nodes.some(n => n.id === endId)) {
      return null;
    }

    if (startId === endId) {
      const node = this.nodes.find(n => n.id === startId);
      return {
        path: [node],
        totalDistance: 0,
        estimatedMinutes: 0,
        turnInstructions: ["You are already at your destination."],
        isAccessible: true,
        crowdDetourUsed: false,
        congestedZonesTraversed: []
      };
    }

    // Build Adjacency Graph
    const graph = {};
    this.nodes.forEach(n => graph[n.id] = []);

    this.edges.forEach(edge => {
      // Check Accessibility: if user needs accessible route and edge requires stairs, exclude it!
      if (accessibleOnly && edge.requiresStairs) {
        return; // Disallow stairs
      }

      let cost = edge.distance;

      // If user requires accessible route, heavily incentivize elevators/ramps and penalize non-accessible edges
      if (accessibleOnly) {
        if (!edge.isAccessible) {
          cost += 500;
        }
      }

      // Check Crowd Congestion:
      // If edge resides in a zone, check that zone's status
      let edgeZoneStatus = "low";
      if (edge.zoneId) {
        const zone = this.zones.find(z => z.id === edge.zoneId);
        if (zone) edgeZoneStatus = zone.status;
      }

      if (avoidCrowds) {
        if (edgeZoneStatus === "critical") {
          cost += 450; // Heavy penalty to force routing through detour corridors!
        } else if (edgeZoneStatus === "high") {
          cost += 150;
        }
      }

      // Bidirectional graph
      graph[edge.from]?.push({ to: edge.to, cost, originalEdge: edge });
      graph[edge.to]?.push({ to: edge.from, cost, originalEdge: edge });
    });

    // Dijkstra Priority Evaluation
    const distances = {};
    const previous = {};
    const unvisited = new Set(this.nodes.map(n => n.id));

    this.nodes.forEach(n => distances[n.id] = Infinity);
    distances[startId] = 0;

    while (unvisited.size > 0) {
      // Find lowest distance node in unvisited
      let current = null;
      let lowestDist = Infinity;
      for (const id of unvisited) {
        if (distances[id] < lowestDist) {
          lowestDist = distances[id];
          current = id;
        }
      }

      if (current === null || distances[current] === Infinity) break;
      if (current === endId) break;

      unvisited.delete(current);

      const neighbors = graph[current] || [];
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor.to)) continue;
        const alt = distances[current] + neighbor.cost;
        if (alt < distances[neighbor.to]) {
          distances[neighbor.to] = alt;
          previous[neighbor.to] = { from: current, edge: neighbor.originalEdge };
        }
      }
    }

    if (distances[endId] === Infinity) {
      // No path found with current constraints (e.g. Accessible path blocked)
      return null;
    }

    // Reconstruct Path
    const pathIds = [];
    const traversedEdges = [];
    let curr = endId;
    while (curr) {
      pathIds.unshift(curr);
      if (previous[curr]) {
        traversedEdges.unshift(previous[curr].edge);
        curr = previous[curr].from;
      } else {
        break;
      }
    }

    const pathNodes = pathIds.map(id => this.nodes.find(n => n.id === id));
    
    // Calculate realistic physical distance and time
    let physicalDistance = 0;
    traversedEdges.forEach(e => physicalDistance += e.distance);
    const estimatedMinutes = Math.max(1, Math.ceil(physicalDistance / 40));

    // Check if congested zones were traversed or avoided
    const congestedTraversed = new Set();
    let crowdDetourUsed = false;

    traversedEdges.forEach(e => {
      if (e.zoneId) {
        const zone = this.zones.find(z => z.id === e.zoneId);
        if (zone && (zone.status === "critical" || zone.status === "high")) {
          congestedTraversed.add(zone.name);
        }
      }
    });

    // Check if bypass corridors were utilized
    const usesBypass = pathIds.some(id => id.includes("bypass") || id.includes("elevator") || id.includes("ramp"));
    if (avoidCrowds && usesBypass) {
      crowdDetourUsed = true;
    }

    // Generate Turn-by-Turn Guidance
    const turnInstructions = [];
    turnInstructions.push(`📍 Start at ${pathNodes[0].name}`);

    for (let i = 1; i < pathNodes.length; i++) {
      const prev = pathNodes[i - 1];
      const next = pathNodes[i];
      const edge = traversedEdges[i - 1];

      if (next.type === "elevator") {
        turnInstructions.push(`🛗 Take the ${next.name} for step-free vertical transit.`);
      } else if (next.type === "ramp") {
        turnInstructions.push(`♿ Follow the ${next.name} with gentle gradient.`);
      } else if (edge && edge.requiresStairs) {
        turnInstructions.push(`🪜 Ascend/Descend via ${next.name}. (Note: Stairs route)`);
      } else if (next.type === "stage" || next.type === "medical" || next.type === "dining") {
        turnInstructions.push(`🎯 Arrive at ${next.name}.`);
      } else if (i === pathNodes.length - 1) {
        turnInstructions.push(`🏁 Arrive at destination: ${next.name}.`);
      } else {
        turnInstructions.push(`🚶 Continue through ${next.name}.`);
      }
    }

    return {
      path: pathNodes,
      totalDistance: physicalDistance,
      estimatedMinutes,
      turnInstructions,
      isAccessible: accessibleOnly,
      crowdDetourUsed,
      congestedZonesTraversed: Array.from(congestedTraversed)
    };
  }

  computeAndRenderRoute() {
    const route = this.calculateRoute(this.selectedOrigin, this.selectedDestination, {
      accessibleOnly: this.accessibleOnly,
      avoidCrowds: this.avoidCrowds
    });

    this.currentRoute = route;
    this.renderRouteOverlay(route);

    if (this.onRouteCalculated) {
      this.onRouteCalculated(route);
    }
  }

  renderRouteOverlay(route) {
    const routeLayer = this.container.querySelector('#active-route-layer');
    if (!routeLayer) return;

    if (!route || !route.path || route.path.length < 2) {
      routeLayer.innerHTML = '';
      return;
    }

    // Build SVG Path Data (d string)
    const points = route.path.map(n => `${n.x},${n.y}`);
    const d = `M ${points.join(' L ')}`;

    const strokeGradient = route.crowdDetourUsed ? "url(#detour-gradient)" : "url(#route-gradient)";
    const originNode = route.path[0];
    const destinationNode = route.path[route.path.length - 1];

    routeLayer.innerHTML = `
      <!-- Route Shadow Glow -->
      <path
        d="${d}"
        fill="none"
        stroke="${route.crowdDetourUsed ? '#10b981' : '#38bdf8'}"
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.25"
      />

      <!-- Main Animated Dash Route -->
      <path
        d="${d}"
        fill="none"
        stroke="${strokeGradient}"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-dasharray="10 6"
        class="animated-route-line"
      />

      <!-- Origin Beacon Marker -->
      <g transform="translate(${originNode.x}, ${originNode.y})">
        <circle r="14" fill="#38bdf8" opacity="0.3" class="pulse-ring" />
        <circle r="7" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
        <text y="-14" text-anchor="middle" font-size="11" fill="#38bdf8" font-weight="bold">START</text>
      </g>

      <!-- Destination Target Beacon -->
      <g transform="translate(${destinationNode.x}, ${destinationNode.y})">
        <circle r="18" fill="#f43f5e" opacity="0.35" class="pulse-ring" />
        <circle r="9" fill="#f43f5e" stroke="#ffffff" stroke-width="2.5" />
        <text y="-16" text-anchor="middle" font-size="12" fill="#f43f5e" font-weight="bold">GOAL</text>
      </g>
    `;
  }
}

