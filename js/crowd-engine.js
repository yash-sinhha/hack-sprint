/**
 * Smart Event Experience Platform - Crowd Coordination & Simulation Engine
 */

import { VENUE_ZONES } from './data.js';

export class CrowdEngine {
  constructor(options = {}) {
    this.zones = JSON.parse(JSON.stringify(VENUE_ZONES));
    this.onCrowdUpdated = options.onCrowdUpdated || null;
    this.autoSimulation = false;
    this.timer = null;
  }

  getZones() {
    return [...this.zones];
  }

  getZone(zoneId) {
    return this.zones.find(z => z.id === zoneId);
  }

  calculateStatus(currentCount, capacity) {
    const ratio = currentCount / capacity;
    if (ratio >= 0.90) return "critical";
    if (ratio >= 0.75) return "high";
    if (ratio >= 0.50) return "moderate";
    return "low";
  }

  setZoneCount(zoneId, newCount) {
    const zone = this.zones.find(z => z.id === zoneId);
    if (!zone) return;

    zone.currentCount = Math.max(0, Math.min(Math.round(zone.capacity * 1.25), Math.round(newCount)));
    zone.status = this.calculateStatus(zone.currentCount, zone.capacity);

    this.notifyUpdate(zone);
  }

  triggerSurge(zoneId) {
    const zone = this.zones.find(z => z.id === zoneId);
    if (!zone) return;

    // Push to 96% capacity
    zone.currentCount = Math.round(zone.capacity * 0.96);
    zone.status = "critical";
    this.notifyUpdate(zone);
  }

  resetZone(zoneId) {
    const defaultZone = VENUE_ZONES.find(z => z.id === zoneId);
    const zone = this.zones.find(z => z.id === zoneId);
    if (!zone || !defaultZone) return;

    zone.currentCount = defaultZone.currentCount;
    zone.status = defaultZone.status;
    this.notifyUpdate(zone);
  }

  notifyUpdate(changedZone) {
    if (this.onCrowdUpdated) {
      this.onCrowdUpdated(this.zones, changedZone);
    }
  }

  startAutoSimulation(intervalSeconds = 15) {
    if (this.timer) clearInterval(this.timer);
    this.autoSimulation = true;
    this.timer = setInterval(() => {
      // Pick a random zone and adjust count by small random delta
      const randomIdx = Math.floor(Math.random() * this.zones.length);
      const zone = this.zones[randomIdx];
      const delta = Math.floor((Math.random() - 0.5) * (zone.capacity * 0.06));
      this.setZoneCount(zone.id, zone.currentCount + delta);
    }, intervalSeconds * 1000);
  }

  stopAutoSimulation() {
    this.autoSimulation = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  toggleAutoSimulation() {
    if (this.autoSimulation) {
      this.stopAutoSimulation();
    } else {
      this.startAutoSimulation();
    }
    return this.autoSimulation;
  }
}

