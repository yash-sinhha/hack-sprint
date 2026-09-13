/**
 * Smart Event Experience Platform - Organizer Command Center
 */

import { INITIAL_ANNOUNCEMENTS, EVENT_INFO, SESSIONS_DATA } from './data.js';

export class OrganizerManager {
  constructor(crowdEngine, emergencySystem, options = {}) {
    this.crowdEngine = crowdEngine;
    this.emergencySystem = emergencySystem;
    this.storageKey = "nexus_announcements";
    this.sessionsStorageKey = "nexus_sessions_state";
    this.announcements = this.loadAnnouncements();
    this.sessions = this.loadSessions();
    this.onAnnouncementPublished = options.onAnnouncementPublished || null;
    this.onSessionUpdated = options.onSessionUpdated || null;
  }

  loadAnnouncements() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load announcements from storage, loading defaults", e);
    }
    return JSON.parse(JSON.stringify(INITIAL_ANNOUNCEMENTS));
  }

  saveAnnouncements() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.announcements));
    } catch (e) {
      console.error("Failed to save announcements to storage", e);
    }
  }

  loadSessions() {
    try {
      const saved = localStorage.getItem(this.sessionsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= SESSIONS_DATA.length) return parsed;
      }
    } catch (e) {
      console.warn("Could not load sessions state, loading defaults", e);
    }
    return JSON.parse(JSON.stringify(SESSIONS_DATA));
  }

  saveSessions() {
    try {
      localStorage.setItem(this.sessionsStorageKey, JSON.stringify(this.sessions));
    } catch (e) {
      console.error("Failed to save sessions state", e);
    }
  }

  getSessions() {
    return [...this.sessions];
  }

  delaySession(sessionId, minutes = 15) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return null;

    session.status = `Delayed (+${minutes}m)`;
    session.time = `${session.time} [DELAYED +${minutes}m]`;
    this.saveSessions();

    // Automatically broadcast announcement to attendees
    this.publishAnnouncement(
      `Schedule Change: ${session.title}`,
      "alert",
      `Session "${session.title}" in ${session.stageName} has been delayed by ${minutes} minutes due to technical setup.`,
      "Stage Operations"
    );

    if (this.onSessionUpdated) {
      this.onSessionUpdated(session);
    }
    return session;
  }

  relocateSession(sessionId, newStageId, newStageName) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return null;

    const oldStage = session.stageName;
    session.stageId = newStageId;
    session.stageName = newStageName;
    session.status = "Room Relocated";
    this.saveSessions();

    // Automatically broadcast announcement to attendees
    this.publishAnnouncement(
      `Room Relocation: ${session.title}`,
      "urgent",
      `Attention: "${session.title}" has been moved from ${oldStage} to ${newStageName}. Please check the map for updated routes.`,
      "Logistics Dispatch"
    );

    if (this.onSessionUpdated) {
      this.onSessionUpdated(session);
    }
    return session;
  }

  resetSession(sessionId) {
    const original = SESSIONS_DATA.find(s => s.id === sessionId);
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session || !original) return null;

    session.time = original.time;
    session.stageId = original.stageId;
    session.stageName = original.stageName;
    session.status = original.status;
    this.saveSessions();

    if (this.onSessionUpdated) {
      this.onSessionUpdated(session);
    }
    return session;
  }

  getAnnouncements() {
    return [...this.announcements];
  }

  publishAnnouncement(title, type, message, author = "Event Operations Center") {
    const newAnn = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      type: type || "info", // urgent, alert, info
      timestamp: "Just now",
      createdAt: Date.now(),
      author: author.trim(),
      message: message.trim()
    };

    this.announcements.unshift(newAnn);
    this.saveAnnouncements();

    if (this.onAnnouncementPublished) {
      this.onAnnouncementPublished(newAnn);
    }

    return newAnn;
  }

  deleteAnnouncement(id) {
    this.announcements = this.announcements.filter(a => a.id !== id);
    this.saveAnnouncements();
  }

  getEventStats() {
    const zones = this.crowdEngine.getZones();
    const activeIncidents = this.emergencySystem.getActiveIncidents();
    const totalVenueOccupancy = zones.reduce((acc, z) => acc + z.currentCount, 0);
    const totalCapacity = zones.reduce((acc, z) => acc + z.capacity, 0);
    const congestedZones = zones.filter(z => z.status === "critical" || z.status === "high");

    return {
      registered: EVENT_INFO.totalRegistered,
      checkedIn: EVENT_INFO.currentCheckins,
      currentInside: totalVenueOccupancy,
      totalCapacity,
      overallUtilization: Math.round((totalVenueOccupancy / totalCapacity) * 100),
      congestedCount: congestedZones.length,
      activeSOSCount: activeIncidents.length,
      criticalSOSCount: activeIncidents.filter(i => i.priority === "Critical").length
    };
  }
}
