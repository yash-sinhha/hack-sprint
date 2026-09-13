/**
 * Smart Event Experience Platform - Emergency & SOS Support System
 */

import { INITIAL_INCIDENTS, EVENT_INFO, VENUE_ZONES } from './data.js';

export class EmergencySystem {
  constructor(options = {}) {
    this.storageKey = "nexus_event_incidents";
    this.incidents = this.loadIncidents();
    this.onIncidentCreated = options.onIncidentCreated || null;
    this.onIncidentUpdated = options.onIncidentUpdated || null;
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
        if (event.key !== this.storageKey) return;
        this.incidents = this.loadIncidents();
        this.onIncidentUpdated?.(this.incidents[0] || null);
      });
    }
  }

  loadIncidents() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error loading saved incidents, loading defaults", e);
    }
    return JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
  }

  saveIncidents() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.incidents));
    } catch (e) {
      console.error("Failed to save incidents to localStorage", e);
    }
  }

  getIncidents() {
    return [...this.incidents];
  }

  getActiveIncidents() {
    return this.incidents.filter(inc => inc.status !== "Resolved");
  }

  getEmergencyContacts() {
    return [
      { name: "Venue Medical Director", role: "Primary Paramedic Unit", phone: EVENT_INFO.emergencyHotline, available: "24/7" },
      { name: "Event Security Command", role: "Loss Prevention & Crowd Safety", phone: EVENT_INFO.securityDesk, available: "24/7" },
      { name: "Accessibility Coordinator", role: "Mobility Escort & ADA Support", phone: "+1 (800) 555-A11Y", available: "08:00 - 20:00" },
      { name: "Local Metro Emergency (911)", role: "Police / Fire / Ambulance", phone: "911", available: "Immediate" }
    ];
  }

  getNearestFirstAid(userZoneId = null) {
    const firstAidZone = VENUE_ZONES.find(z => z.id === "first-aid");
    return {
      zone: firstAidZone,
      targetNodeId: "node-firstaid",
      room: "South Hallway, Suite 104",
      floor: "Level 1",
      staff: "Dr. Rachel Sterling, MD & Paramedic Team Alpha",
      phone: EVENT_INFO.emergencyHotline
    };
  }

  /**
   * Dispatches a new attendee emergency incident
   */
  reportSOS(type, zoneId, details = "") {
    const zone = VENUE_ZONES.find(z => z.id === zoneId) || VENUE_ZONES[0];
    const incidentCode = `SOS-${Math.floor(100 + Math.random() * 900)}`;

    const newIncident = {
      id: incidentCode,
      type: type || "General Emergency",
      location: `${zone.name} (${zone.floor})`,
      zoneId: zone.id,
      timestamp: "Just now",
      createdAt: Date.now(),
      status: "Pending Dispatch",
      details: details || "Attendee pressed emergency panic dispatch.",
      priority: type.toLowerCase().includes("medical") ? "Critical" : "High",
      assignedResponder: "Team Alpha (En route in 2m)"
    };

    this.incidents.unshift(newIncident);
    this.saveIncidents();

    if (this.onIncidentCreated) {
      this.onIncidentCreated(newIncident);
    }

    return newIncident;
  }

  updateStatus(incidentId, status) {
    const incident = this.incidents.find(inc => inc.id === incidentId);
    if (!incident) return false;

    incident.status = status;
    incident.updatedAt = Date.now();
    if (status === "Resolved") {
      incident.resolvedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    this.saveIncidents();

    if (this.onIncidentUpdated) {
      this.onIncidentUpdated(incident);
    }

    return true;
  }
}

