/**
 * Smart Event Experience Platform - Core Application Orchestrator
 */

import { EVENT_INFO, SESSIONS_DATA, AMENITIES_DATA, VENUE_ZONES, MAP_NODES } from './data.js';
import { EventMapEngine } from './map.js';
import { RecommendationEngine } from './recommendations.js';
import { CrowdEngine } from './crowd-engine.js';
import { EmergencySystem } from './sos-system.js';
import { OrganizerManager } from './organizer.js';
import { AccessibilityManager } from './accessibility.js';
import { AuthManager } from './auth.js';

/* --------------------------------------------------------------------------
   Shared SVG icon strings (Feather / Heroicons style, no emoji)
   -------------------------------------------------------------------------- */
const ICONS = {
  alert: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  alertLg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  megaphone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
  info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  navigate: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
  user: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  mapPin: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  bookmark: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  bookmarkFilled: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  target: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  phone: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l1.26-1.26a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  ambulance: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M17 7h2.4a2 2 0 0 1 1.6.8L23 11v5h-6V7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M7 11h2m-1-1v2"/></svg>`,
  activity: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  zap: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  refresh: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  move: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
  liveDot: `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#ef4444;flex-shrink:0;" aria-hidden="true"></span>`,
  shieldCheck: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  wheelchair: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M19 13v-2a7 7 0 0 0-14 0v2"/><path d="M12 11v10"/><path d="M8 18l4-4 4 4"/></svg>`,
  firstAid: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  dispatch: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
};

class SmartEventApp {
  constructor() {
    this.currentPersona = localStorage.getItem("nexus_persona") || "attendee";
    this.currentTab = "home";
    this.bookmarkedSessions = this.loadBookmarkedSessions();
    this.auth = new AuthManager({ onStateChanged: (user) => this.renderAuthState(user) });

    // Initialize Subsystems
    this.a11y = new AccessibilityManager();
    this.crowdEngine = new CrowdEngine({
      onCrowdUpdated: (zones, changedZone) => this.handleCrowdUpdated(zones, changedZone)
    });
    this.emergencySystem = new EmergencySystem({
      onIncidentCreated: (inc) => this.handleIncidentCreated(inc),
      onIncidentUpdated: (inc) => this.handleIncidentUpdated(inc)
    });
    this.organizer = new OrganizerManager(this.crowdEngine, this.emergencySystem, {
      onAnnouncementPublished: (ann) => this.handleAnnouncementPublished(ann),
      onSessionUpdated: (sess) => this.handleSessionUpdated(sess)
    });
    this.recommender = new RecommendationEngine({
      onInterestsChanged: () => this.renderPersonalizedRecommendations()
    });

    this.mapEngine = null;

    // Search and filter state
    this.sessionSearchQuery = "";
    this.selectedCategory = "all";
    this.filterMyScheduleOnly = false;

    this.init();
  }

  loadBookmarkedSessions() {
    try {
      const saved = localStorage.getItem("nexus_user_schedule");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load bookmarks", e);
    }
    return ["sess-1", "sess-3"]; // default initial bookmarks
  }

  saveBookmarkedSessions() {
    try {
      localStorage.setItem("nexus_user_schedule", JSON.stringify(this.bookmarkedSessions));
    } catch (e) {
      console.error("Failed to save bookmarks", e);
    }
  }

  init() {
    this.renderHeader();
    this.setupPersonaView();
    this.bindGlobalEvents();
    this.renderAnnouncementsBanner();

    // Initialize interactive SVG map
    this.mapEngine = new EventMapEngine("map-render-target", {
      onZoneSelected: (zone) => this.handleMapZoneSelected(zone),
      onRouteCalculated: (route) => this.handleMapRouteCalculated(route)
    });

    // Populate UI views
    this.populateNavigationSelectors();
    this.renderSessionsList();
    this.renderPersonalizedRecommendations();
    this.renderCrowdRadar();
    this.renderAccessibilityHub();
    this.renderEmergencyCenter();
    this.renderOrganizerDashboard();
    this.renderHomeOverview();
  }

  /* ==========================================================================
     PERSONA & HEADER MANAGEMENT
     ========================================================================== */

  renderHeader() {
    const personaToggle = document.getElementById("persona-switch-btn");
    if (personaToggle) {
      personaToggle.textContent = this.currentPersona === "attendee"
        ? "Switch to Organizer Mode"
        : "Switch to Attendee Mode";
      personaToggle.className = `btn-persona ${this.currentPersona === "organizer" ? "active-organizer" : ""}`;
    }
    this.renderAuthState(this.auth.user);
  }

  renderAuthState(user) {
    const landing = document.getElementById("public-landing");
    const appHeader = document.getElementById("app-header");
    const announcements = document.getElementById("live-announcements-banner");
    const attendeeExperience = document.getElementById("attendee-experience");
    const organizerExperience = document.getElementById("organizer-experience");
    [appHeader, announcements, attendeeExperience, organizerExperience].forEach((element) => {
      element?.classList.toggle("hidden", !user);
    });
    landing?.classList.toggle("hidden", !!user);

    const authButton = document.getElementById("btn-auth");
    if (authButton) {
      authButton.textContent = user ? `Sign Out (${user.name})` : "Sign In";
      authButton.setAttribute("aria-label", user ? `Sign out ${user.name}` : "Sign in");
    }
    const modal = document.getElementById("modal-auth");
    if (!modal) return;
    if (user) {
      modal.classList.remove("modal-open", "auth-required");
      modal.removeAttribute("data-required");
    } else {
      modal.classList.remove("modal-open", "auth-required");
      modal.dataset.required = "false";
    }
  }

  openAuthModal(mode = "signin", required = false) {
    const modal = document.getElementById("modal-auth");
    const form = document.getElementById("auth-form");
    const nameGroup = document.getElementById("auth-name-group");
    const title = document.getElementById("auth-modal-title");
    const subtitle = document.getElementById("auth-modal-subtitle");
    const submit = document.getElementById("auth-submit");
    const toggle = document.getElementById("btn-toggle-auth-mode");
    if (!modal || !form || !nameGroup || !title || !subtitle || !submit || !toggle) return;

    const isSignUp = mode === "signup";
    modal.dataset.mode = mode;
    modal.dataset.required = required ? "true" : "false";
    modal.classList.toggle("auth-required", required);
    form.reset();
    document.getElementById("auth-feedback").textContent = "";
    nameGroup.style.display = isSignUp ? "block" : "none";
    document.getElementById("auth-name").required = isSignUp;
    document.getElementById("auth-password").autocomplete = isSignUp ? "new-password" : "current-password";
    title.textContent = isSignUp ? "Create Account" : "Sign In";
    subtitle.textContent = isSignUp ? "Create your NexusCon attendee account." : "Access your NexusCon experience.";
    submit.textContent = isSignUp ? "Create Account" : "Sign In";
    toggle.textContent = isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up";
    modal.classList.add("modal-open");
  }

  async submitAuth(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const mode = document.getElementById("modal-auth").dataset.mode || "signin";
    const feedback = document.getElementById("auth-feedback");
    const submit = document.getElementById("auth-submit");
    const name = document.getElementById("auth-name").value.trim();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;

    feedback.textContent = "";
    submit.disabled = true;
    try {
      const user = mode === "signup"
        ? await this.auth.signUp(name, email, password)
        : await this.auth.signIn(email, password);
      document.getElementById("modal-auth").classList.remove("modal-open");
      this.renderAuthState(user);
      this.a11y.announceToScreenReader(`${mode === "signup" ? "Account created" : "Signed in"} for ${user.name}.`);
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  }

  setupPersonaView() {
    const attendeeContainer = document.getElementById("attendee-experience");
    const organizerContainer = document.getElementById("organizer-experience");

    if (this.currentPersona === "organizer") {
      attendeeContainer.classList.add("hidden");
      organizerContainer.classList.remove("hidden");
      this.renderOrganizerDashboard();
      this.a11y.announceToScreenReader("Switched to Organizer Command Mode");
    } else {
      organizerContainer.classList.add("hidden");
      attendeeContainer.classList.remove("hidden");
      this.a11y.announceToScreenReader("Switched to Attendee Experience Mode");
    }
    this.renderHeader();
  }

  togglePersona() {
    this.currentPersona = this.currentPersona === "attendee" ? "organizer" : "attendee";
    localStorage.setItem("nexus_persona", this.currentPersona);
    this.setupPersonaView();
  }

  /* ==========================================================================
     TAB ROUTING (ATTENDEE)
     ========================================================================== */

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      const target = btn.getAttribute("data-tab");
      btn.classList.toggle("active", target === tabId);
      btn.setAttribute("aria-selected", target === tabId ? "true" : "false");
    });

    document.querySelectorAll(".tab-view").forEach(view => {
      view.classList.toggle("active-view", view.id === `view-${tabId}`);
    });

    this.a11y.announceToScreenReader(`Viewing ${tabId} tab`);

    if (tabId === "map" && this.mapEngine) {
      setTimeout(() => this.mapEngine.resetView(), 50);
    }
  }

  /* ==========================================================================
     GLOBAL ANNOUNCEMENTS
     ========================================================================== */

  renderAnnouncementsBanner() {
    const banner = document.getElementById("live-announcements-banner");
    const marquee = document.getElementById("announcement-marquee");
    if (!banner || !marquee) return;

    const announcements = this.organizer.getAnnouncements();
    if (!announcements || announcements.length === 0) {
      banner.style.display = "none";
      return;
    }

    banner.style.display = "flex";
    const latest = announcements[0];

    let badgeClass = "badge-info";
    let iconHtml = ICONS.info;
    if (latest.type === "urgent") {
      badgeClass = "badge-urgent";
      iconHtml = ICONS.alert;
    } else if (latest.type === "alert") {
      badgeClass = "badge-alert";
      iconHtml = ICONS.alert;
    } else {
      iconHtml = ICONS.megaphone;
    }

    marquee.innerHTML = `
      <span class="announcement-pill ${badgeClass}" style="display:inline-flex;align-items:center;gap:0.3rem;">${iconHtml} ${latest.type.toUpperCase()}</span>
      <span class="announcement-title"><strong>${latest.title}:</strong> ${latest.message}</span>
      <span class="announcement-meta">(${latest.timestamp} &bull; ${latest.author})</span>
    `;
  }

  handleAnnouncementPublished(ann) {
    this.renderAnnouncementsBanner();
    this.renderHomeOverview();
    this.renderOrganizerDashboard();
    this.a11y.playChime(ann.type === "urgent" ? "urgent" : ann.type === "alert" ? "alert" : "info");
    this.a11y.announceToScreenReader(`New announcement: ${ann.title}. ${ann.message}`);
  }

  handleSessionUpdated(sess) {
    this.renderSessionsList();
    this.renderPersonalizedRecommendations();
    this.renderHomeOverview();
    this.renderOrganizerDashboard();
    this.a11y.playChime("alert");
    this.a11y.announceToScreenReader(`Schedule update: ${sess.title} is now ${sess.status}`);
  }

  /* ==========================================================================
     HOME OVERVIEW TAB
     ========================================================================== */

  renderHomeOverview() {
    const pulseStats = document.getElementById("home-pulse-stats");
    if (pulseStats) {
      const zones = this.crowdEngine.getZones();
      const crowded = zones.filter(z => z.status === "critical" || z.status === "high");
      pulseStats.innerHTML = `
        <div class="stat-card">
          <span class="stat-label">Active Attendees</span>
          <span class="stat-value">${EVENT_INFO.currentCheckins.toLocaleString()}</span>
          <span class="stat-sub">Across 8 venue zones</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Venue Flow Status</span>
          <span class="stat-value ${crowded.length > 0 ? 'text-amber' : 'text-emerald'}">
            ${crowded.length > 0 ? `${crowded.length} Busy Zones` : 'All Zones Optimal'}
          </span>
          <span class="stat-sub">${crowded.length > 0 ? 'Detours recommended' : 'Smooth movement'}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">My Bookmarked Sessions</span>
          <span class="stat-value text-indigo">${this.bookmarkedSessions.length}</span>
          <span class="stat-sub">Personal itinerary</span>
        </div>
      `;
    }

    // Next Session Card
    const nextSessionTarget = document.getElementById("home-next-session");
    if (nextSessionTarget) {
      const liveSession = this.organizer.getSessions().find(s => s.status === "Live Now") || this.organizer.getSessions()[0];
      const isBookmarked = this.bookmarkedSessions.includes(liveSession.id);
      nextSessionTarget.innerHTML = `
        <div class="featured-session-card">
          <div class="featured-header">
            <span class="status-chip live-pulse" style="display:inline-flex;align-items:center;gap:0.35rem;">${ICONS.liveDot} LIVE NOW</span>
            <span class="session-category-tag">${liveSession.category.toUpperCase()}</span>
          </div>
          <h3 class="featured-title">${liveSession.title}</h3>
          <p class="featured-speaker">${ICONS.user} ${liveSession.speaker} (${liveSession.speakerRole}, ${liveSession.speakerCompany})</p>
          <p class="featured-location">${ICONS.mapPin} <strong>${liveSession.stageName}</strong> &bull; ${liveSession.time}</p>
          <div class="featured-actions">
            <button class="btn btn-primary btn-sm" id="btn-home-nav-stage" data-zone-id="${liveSession.stageId}" style="gap:0.35rem;">
              ${ICONS.navigate} Navigate to Stage
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-home-toggle-bookmark" data-sess-id="${liveSession.id}" style="gap:0.35rem;">
              ${isBookmarked ? `${ICONS.checkCircle} In My Schedule` : `${ICONS.bookmark} Add to Schedule`}
            </button>
          </div>
        </div>
      `;

      nextSessionTarget.querySelector("#btn-home-nav-stage")?.addEventListener("click", () => {
        this.navigateToZone(liveSession.stageId);
      });

      nextSessionTarget.querySelector("#btn-home-toggle-bookmark")?.addEventListener("click", () => {
        this.toggleBookmark(liveSession.id);
        this.renderHomeOverview();
      });
    }

    // Recent announcements in Home
    const homeAnnList = document.getElementById("home-announcements-list");
    if (homeAnnList) {
      const announcements = this.organizer.getAnnouncements().slice(0, 3);
      homeAnnList.innerHTML = announcements.map(a => `
        <div class="announcement-item ${a.type}">
          <div class="ann-item-header">
            <span class="badge-${a.type}">${a.type.toUpperCase()}</span>
            <span class="ann-time">${a.timestamp}</span>
          </div>
          <h4 class="ann-item-title">${a.title}</h4>
          <p class="ann-item-body">${a.message}</p>
        </div>
      `).join("");
    }
  }

  /* ==========================================================================
     MAP & ROUTING CONTROLS
     ========================================================================== */

  populateNavigationSelectors() {
    const originSelect = document.getElementById("select-route-origin");
    const destSelect = document.getElementById("select-route-destination");
    if (!originSelect || !destSelect) return;

    originSelect.innerHTML = MAP_NODES.map(n => `
      <option value="${n.id}" ${n.id === "node-reg" ? "selected" : ""}>
        ${n.name}
      </option>
    `).join("");

    destSelect.innerHTML = MAP_NODES.map(n => `
      <option value="${n.id}" ${n.id === "node-arena-entry" ? "selected" : ""}>
        ${n.name}
      </option>
    `).join("");

    originSelect.addEventListener("change", (e) => {
      this.mapEngine.setOrigin(e.target.value);
    });

    destSelect.addEventListener("change", (e) => {
      this.mapEngine.setDestination(e.target.value);
    });

    // Accessible Toggle
    const a11yToggle = document.getElementById("chk-accessible-route");
    a11yToggle?.addEventListener("change", (e) => {
      this.mapEngine.setAccessibleRouting(e.target.checked);
      this.a11y.announceToScreenReader(`Accessible step-free routing ${e.target.checked ? 'enabled' : 'disabled'}`);
    });

    // Crowd Detour Toggle
    const detourToggle = document.getElementById("chk-avoid-crowds");
    detourToggle?.addEventListener("change", (e) => {
      this.mapEngine.setAvoidCrowds(e.target.checked);
      this.a11y.announceToScreenReader(`Crowd avoidance ${e.target.checked ? 'enabled' : 'disabled'}`);
    });

    // Speak Directions Button
    const speakBtn = document.getElementById("btn-speak-route");
    speakBtn?.addEventListener("click", () => {
      if (this.mapEngine.currentRoute && this.mapEngine.currentRoute.turnInstructions) {
        const textToSpeak = this.mapEngine.currentRoute.turnInstructions.join(". ");
        this.a11y.speak(textToSpeak);
      }
    });
  }

  navigateToZone(zoneId) {
    this.switchTab("map");
    const destSelect = document.getElementById("select-route-destination");
    const targetNode = MAP_NODES.find(n => n.zoneId === zoneId && (n.type === 'stage' || n.type === 'entry' || n.type === 'medical' || n.type === 'expo' || n.type === 'dining' || n.type === 'wellness')) || MAP_NODES.find(n => n.zoneId === zoneId);

    if (targetNode) {
      if (destSelect) destSelect.value = targetNode.id;
      this.mapEngine.setDestination(targetNode.id);
    }
  }

  handleMapZoneSelected(zone) {
    const detailsContainer = document.getElementById("map-zone-details");
    if (!detailsContainer) return;

    const occupancyPct = Math.round((zone.currentCount / zone.capacity) * 100);
    detailsContainer.innerHTML = `
      <div class="zone-details-card">
        <div class="zone-card-header">
          <h4>${zone.name}</h4>
          <span class="status-chip status-${zone.status}">${occupancyPct}% Full (${zone.status.toUpperCase()})</span>
        </div>
        <p class="zone-desc">${zone.description}</p>
        <div class="zone-meta-grid">
          <div><strong>Floor:</strong> ${zone.floor}</div>
          <div><strong>Occupancy:</strong> ${zone.currentCount} / ${zone.capacity}</div>
          <div><strong>Accessibility:</strong> ${zone.accessible ? 'Fully Accessible' : 'Standard'}</div>
        </div>
        <div class="zone-features-list">
          ${zone.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
        </div>
        <div class="zone-actions">
          <button class="btn btn-primary btn-sm" id="btn-set-as-dest" data-zone-id="${zone.id}" style="gap:0.35rem;">
            ${ICONS.navigate} Set as Route Destination
          </button>
        </div>
      </div>
    `;

    detailsContainer.querySelector("#btn-set-as-dest")?.addEventListener("click", () => {
      this.navigateToZone(zone.id);
    });
  }

  handleMapRouteCalculated(route) {
    const directionsList = document.getElementById("route-turn-instructions");
    const summaryCard = document.getElementById("route-summary-card");
    if (!directionsList || !summaryCard) return;

    if (!route || !route.path || route.path.length === 0) {
      summaryCard.innerHTML = `<p class="text-muted">No valid path found with selected constraints.</p>`;
      directionsList.innerHTML = '';
      return;
    }

    let alertHtml = '';
    if (route.crowdDetourUsed) {
      alertHtml = `
        <div class="route-alert alert-success">
          ${ICONS.shieldCheck} <div><strong>Smart Crowd Detour Active:</strong> Congested areas bypassed for faster, safer movement.</div>
        </div>
      `;
    } else if (route.congestedZonesTraversed.length > 0) {
      alertHtml = `
        <div class="route-alert alert-warning">
          ${ICONS.alert} <div><strong>Route traverses congested area:</strong> ${route.congestedZonesTraversed.join(', ')}. Expect walking delays.</div>
        </div>
      `;
    }

    summaryCard.innerHTML = `
      <div class="route-summary-header">
        <div>
          <span class="summary-time">${ICONS.clock} ~${route.estimatedMinutes} min walk</span>
          <span class="summary-dist">(${route.totalDistance} meters)</span>
        </div>
        <div>
          ${route.isAccessible ? `<span class="status-chip chip-accessible">${ICONS.wheelchair} Step-Free</span>` : '<span class="status-chip">Standard</span>'}
        </div>
      </div>
      ${alertHtml}
    `;

    directionsList.innerHTML = route.turnInstructions.map(step => `
      <li class="turn-step-item">
        <span class="step-bullet"></span>
        <span class="step-text">${step}</span>
      </li>
    `).join('');
  }

  /* ==========================================================================
     SCHEDULE & DISCOVERY TAB
     ========================================================================== */

  renderSessionsList() {
    const target = document.getElementById("sessions-catalog-list");
    if (!target) return;

    // Filter sessions
    const filtered = this.organizer.getSessions().filter(sess => {
      // Category filter
      if (this.selectedCategory !== "all" && sess.category !== this.selectedCategory) {
        return false;
      }
      // My Schedule filter
      if (this.filterMyScheduleOnly && !this.bookmarkedSessions.includes(sess.id)) {
        return false;
      }
      // Text search
      if (this.sessionSearchQuery) {
        const query = this.sessionSearchQuery.toLowerCase();
        const matchesTitle = sess.title.toLowerCase().includes(query);
        const matchesSpeaker = sess.speaker.toLowerCase().includes(query);
        const matchesTag = sess.tags.some(t => t.toLowerCase().includes(query));
        const matchesLocation = sess.stageName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSpeaker && !matchesTag && !matchesLocation) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      target.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${ICONS.search}</div>
          <h3>No sessions found</h3>
          <p>Try clearing your search query or changing category filters.</p>
          <button class="btn btn-secondary btn-sm" id="btn-clear-session-filters">Reset Filters</button>
        </div>
      `;
      target.querySelector("#btn-clear-session-filters")?.addEventListener("click", () => {
        this.sessionSearchQuery = "";
        this.selectedCategory = "all";
        this.filterMyScheduleOnly = false;
        document.getElementById("input-session-search").value = "";
        document.getElementById("filter-my-schedule-btn")?.classList.remove("active");
        this.updateCategoryPills();
        this.renderSessionsList();
      });
      return;
    }

    target.innerHTML = filtered.map(sess => {
      const isBookmarked = this.bookmarkedSessions.includes(sess.id);
      return `
        <div class="session-card ${sess.status === 'Live Now' ? 'session-live' : ''}" data-sess-id="${sess.id}">
          <div class="session-card-header">
            <div class="session-tags">
              <span class="session-tag-category">${sess.category.toUpperCase()}</span>
              ${sess.status === 'Live Now' ? `<span class="status-chip live-pulse" style="display:inline-flex;align-items:center;gap:0.35rem;">${ICONS.liveDot} LIVE</span>` : ''}
              ${isBookmarked ? `<span class="status-chip chip-bookmarked" style="display:inline-flex;align-items:center;gap:0.3rem;">${ICONS.bookmarkFilled} Saved</span>` : ''}
            </div>
            <div class="session-time-pill">${ICONS.clock} ${sess.time}</div>
          </div>
          <h3 class="session-title">${sess.title}</h3>
          <p class="session-speaker">${ICONS.user} ${sess.speaker} &bull; <em>${sess.speakerCompany}</em></p>
          <p class="session-location">${ICONS.mapPin} ${sess.stageName}</p>
          <p class="session-abstract">${sess.description}</p>
          <div class="session-card-actions">
            <button class="btn btn-sm ${isBookmarked ? 'btn-secondary' : 'btn-primary'} btn-toggle-bookmark" data-sess-id="${sess.id}" style="gap:0.35rem;">
              ${isBookmarked ? `${ICONS.checkCircle} In My Schedule` : `${ICONS.bookmark} Add to Schedule`}
            </button>
            <button class="btn btn-sm btn-outline btn-route-stage" data-zone-id="${sess.stageId}" style="gap:0.35rem;">
              ${ICONS.navigate} Show on Map
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind card action buttons
    target.querySelectorAll(".btn-toggle-bookmark").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const sessId = btn.getAttribute("data-sess-id");
        this.toggleBookmark(sessId);
      });
    });

    target.querySelectorAll(".btn-route-stage").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const zoneId = btn.getAttribute("data-zone-id");
        this.navigateToZone(zoneId);
      });
    });
  }

  toggleBookmark(sessionId) {
    if (this.bookmarkedSessions.includes(sessionId)) {
      this.bookmarkedSessions = this.bookmarkedSessions.filter(id => id !== sessionId);
      this.a11y.announceToScreenReader("Session removed from My Schedule");
    } else {
      this.bookmarkedSessions.push(sessionId);
      this.a11y.announceToScreenReader("Session added to My Schedule");
    }
    this.saveBookmarkedSessions();
    this.renderSessionsList();
    this.renderPersonalizedRecommendations();
    this.renderHomeOverview();
  }

  updateCategoryPills() {
    document.querySelectorAll(".category-pill").forEach(pill => {
      const cat = pill.getAttribute("data-category");
      pill.classList.toggle("active", cat === this.selectedCategory);
    });
  }

  /* ==========================================================================
     PERSONALIZED RECOMMENDATIONS TAB ("FOR YOU")
     ========================================================================== */

  renderPersonalizedRecommendations() {
    const target = document.getElementById("recommendations-grid");
    const activeInterestsTarget = document.getElementById("active-interests-chips");
    if (!target) return;

    const userInterests = this.recommender.getInterests();
    const allCategories = this.recommender.getAllCategories();

    // Render active interest chips (strip emoji from label if present)
    if (activeInterestsTarget) {
      activeInterestsTarget.innerHTML = userInterests.map(id => {
        const cat = allCategories.find(c => c.id === id);
        return cat ? `<span class="interest-chip">${cat.label}</span>` : '';
      }).join('');
    }

    const recommendations = this.recommender.getRecommendations(this.organizer.getSessions(), 4);

    target.innerHTML = recommendations.map(sess => {
      const isBookmarked = this.bookmarkedSessions.includes(sess.id);
      return `
        <div class="rec-card">
          <div class="rec-match-header">
            <span class="rec-score-pill">${ICONS.target} ${sess.matchScore}% Match</span>
            <span class="session-category-tag">${sess.category.toUpperCase()}</span>
          </div>
          <div class="rec-reasons">
            ${sess.matchReasons.map(r => `<span class="rec-reason-badge">${ICONS.check} ${r}</span>`).join('')}
          </div>
          <h3 class="rec-title">${sess.title}</h3>
          <p class="rec-speaker">${ICONS.user} ${sess.speaker} (${sess.speakerCompany})</p>
          <p class="rec-time">${ICONS.clock} ${sess.time} &bull; ${ICONS.mapPin} ${sess.stageName}</p>
          <div class="rec-actions">
            <button class="btn btn-primary btn-sm btn-rec-bookmark" data-sess-id="${sess.id}" style="gap:0.35rem;">
              ${isBookmarked ? `${ICONS.checkCircle} In My Schedule` : `${ICONS.bookmark} Add to Schedule`}
            </button>
            <button class="btn btn-outline btn-sm btn-rec-map" data-zone-id="${sess.stageId}" style="gap:0.35rem;">
              ${ICONS.navigate} Route to Stage
            </button>
          </div>
        </div>
      `;
    }).join('');

    target.querySelectorAll(".btn-rec-bookmark").forEach(btn => {
      btn.addEventListener("click", () => {
        this.toggleBookmark(btn.getAttribute("data-sess-id"));
      });
    });

    target.querySelectorAll(".btn-rec-map").forEach(btn => {
      btn.addEventListener("click", () => {
        this.navigateToZone(btn.getAttribute("data-zone-id"));
      });
    });
  }

  /* ==========================================================================
     CROWD RADAR TAB
     ========================================================================== */

  renderCrowdRadar() {
    const target = document.getElementById("crowd-radar-grid");
    if (!target) return;

    const zones = this.crowdEngine.getZones();

    target.innerHTML = zones.map(zone => {
      const pct = Math.round((zone.currentCount / zone.capacity) * 100);
      let barColor = "#10b981";
      if (zone.status === "moderate") barColor = "#3b82f6";
      else if (zone.status === "high") barColor = "#f59e0b";
      else if (zone.status === "critical") barColor = "#ef4444";

      let advisoryIcon = ICONS.checkCircle;
      let advisoryText = "Normal capacity. Steady traffic flow.";
      if (zone.status === "critical") {
        advisoryIcon = ICONS.alertLg;
        advisoryText = "Overcrowded. Alternate bypass corridors advised.";
      } else if (zone.status === "high") {
        advisoryIcon = ICONS.alert;
        advisoryText = "High density. Moderate delays expected.";
      }

      return `
        <div class="crowd-card crowd-status-${zone.status}">
          <div class="crowd-card-header">
            <h4>${zone.name}</h4>
            <span class="status-chip status-${zone.status}">${zone.status.toUpperCase()}</span>
          </div>
          <div class="crowd-meter-container">
            <div class="crowd-meter-bar" style="width: ${Math.min(100, pct)}%; background: ${barColor}"></div>
          </div>
          <div class="crowd-stats-row">
            <span><strong>${zone.currentCount}</strong> / ${zone.capacity} Attendees</span>
            <span class="crowd-pct font-bold">${pct}%</span>
          </div>
          <p class="crowd-advisory">${advisoryIcon} ${advisoryText}</p>
          <div class="crowd-actions">
            <button class="btn btn-outline btn-sm btn-crowd-map" data-zone-id="${zone.id}" style="gap:0.35rem;">
              ${ICONS.navigate} View on Map
            </button>
          </div>
        </div>
      `;
    }).join('');

    target.querySelectorAll(".btn-crowd-map").forEach(btn => {
      btn.addEventListener("click", () => {
        this.navigateToZone(btn.getAttribute("data-zone-id"));
      });
    });
  }

  handleCrowdUpdated(zones, changedZone) {
    if (this.mapEngine) {
      this.mapEngine.updateZoneData(zones);
    }
    this.renderCrowdRadar();
    this.renderHomeOverview();
    this.renderOrganizerDashboard();

    if (changedZone && changedZone.status === "critical") {
      this.a11y.playChime("alert");
      this.a11y.announceToScreenReader(`Crowd Alert: ${changedZone.name} has reached critical congestion`);
    }
  }

  /* ==========================================================================
     ACCESSIBILITY HUB TAB
     ========================================================================== */

  renderAccessibilityHub() {
    const amenitiesTarget = document.getElementById("a11y-amenities-list");
    if (amenitiesTarget) {
      amenitiesTarget.innerHTML = AMENITIES_DATA.map(a => `
        <div class="amenity-card">
          <div class="amenity-icon-wrap" aria-hidden="true">${ICONS.wheelchair}</div>
          <div class="amenity-info">
            <h4 class="amenity-title">${a.name}</h4>
            <p class="amenity-category">${a.category} &bull; ${a.location}</p>
            ${a.features ? `<div class="amenity-features">${a.features.map(f => `<span class="feature-badge">${f}</span>`).join('')}</div>` : ''}
          </div>
          <button class="btn btn-outline btn-sm btn-amenity-route" data-node-id="${a.nodeId}" style="gap:0.35rem;">
            ${ICONS.navigate} Route
          </button>
        </div>
      `).join('');

      amenitiesTarget.querySelectorAll(".btn-amenity-route").forEach(btn => {
        btn.addEventListener("click", () => {
          this.switchTab("map");
          const destSelect = document.getElementById("select-route-destination");
          const nodeId = btn.getAttribute("data-node-id");
          if (destSelect) destSelect.value = nodeId;
          this.mapEngine.setDestination(nodeId);
          // Auto enable accessible routing
          const a11yToggle = document.getElementById("chk-accessible-route");
          if (a11yToggle) {
            a11yToggle.checked = true;
            this.mapEngine.setAccessibleRouting(true);
          }
        });
      });
    }

    // Bind accessibility preference controls
    const contrastBtn = document.getElementById("btn-toggle-contrast");
    contrastBtn?.addEventListener("click", () => {
      const active = this.a11y.toggleHighContrast();
      contrastBtn.classList.toggle("active", active);
    });

    document.querySelectorAll(".btn-font-scale").forEach(btn => {
      btn.addEventListener("click", () => {
        const size = btn.getAttribute("data-size");
        this.a11y.setFontSize(size);
        document.querySelectorAll(".btn-font-scale").forEach(b => b.classList.toggle("active", b === btn));
      });
    });

    const speechBtn = document.getElementById("btn-toggle-speech");
    speechBtn?.addEventListener("click", () => {
      const enabled = this.a11y.toggleSpeech();
      speechBtn.classList.toggle("active", enabled);
    });
  }

  /* ==========================================================================
     EMERGENCY & SOS CENTER TAB
     ========================================================================== */

  renderEmergencyCenter() {
    const contactsTarget = document.getElementById("emergency-contacts-list");
    if (contactsTarget) {
      const contacts = this.emergencySystem.getEmergencyContacts();
      contactsTarget.innerHTML = contacts.map(c => `
        <div class="emergency-contact-card">
          <div class="contact-header">
            <h4>${c.name}</h4>
            <span class="status-chip chip-accessible">${c.available}</span>
          </div>
          <p class="contact-role">${c.role}</p>
          <a href="tel:${c.phone}" class="btn btn-outline btn-sm btn-call-emergency">
            ${ICONS.phone} Call ${c.phone}
          </a>
        </div>
      `).join('');
    }

    const firstAidInfo = this.emergencySystem.getNearestFirstAid();
    const firstAidCard = document.getElementById("first-aid-quick-card");
    if (firstAidCard) {
      firstAidCard.innerHTML = `
        <div class="first-aid-card-content">
          <div class="first-aid-header">
            <h3 style="display:flex;align-items:center;gap:0.5rem;">${ICONS.firstAid} Nearest First Aid &amp; Triage Station</h3>
            <span class="status-chip status-optimal">Staffed 24/7</span>
          </div>
          <p style="margin:0.4rem 0;font-size:0.875rem;"><strong>Location:</strong> ${firstAidInfo.room} (${firstAidInfo.floor})</p>
          <p style="font-size:0.875rem;"><strong>Medical Lead:</strong> ${firstAidInfo.staff}</p>
          <div class="first-aid-actions">
            <button class="btn btn-danger btn-sm" id="btn-emergency-route-firstaid" style="gap:0.4rem;">
              ${ICONS.navigate} Step-Free Route to First Aid
            </button>
            <a href="tel:${firstAidInfo.phone}" class="btn btn-outline btn-sm" style="gap:0.4rem;">
              ${ICONS.phone} Direct Medical Hotline
            </a>
          </div>
        </div>
      `;

      firstAidCard.querySelector("#btn-emergency-route-firstaid")?.addEventListener("click", () => {
        this.switchTab("map");
        const destSelect = document.getElementById("select-route-destination");
        if (destSelect) destSelect.value = firstAidInfo.targetNodeId;
        this.mapEngine.setDestination(firstAidInfo.targetNodeId);
        const a11yToggle = document.getElementById("chk-accessible-route");
        if (a11yToggle) {
          a11yToggle.checked = true;
          this.mapEngine.setAccessibleRouting(true);
        }
      });
    }
  }

  openSOSModal() {
    const modal = document.getElementById("modal-sos");
    if (!modal) return;

    // Populate zone selector
    const zoneSelect = document.getElementById("sos-location-select");
    if (zoneSelect) {
      zoneSelect.innerHTML = VENUE_ZONES.map(z => `
        <option value="${z.id}">${z.name} (${z.floor})</option>
      `).join('');
    }

    // Reset dispatched status view
    document.getElementById("sos-form-section").style.display = "block";
    document.getElementById("sos-confirmed-section").style.display = "none";

    modal.classList.add("modal-open");
    this.a11y.playChime("alert");
    this.a11y.announceToScreenReader("Emergency SOS dialog opened.");
  }

  closeSOSModal() {
    const modal = document.getElementById("modal-sos");
    if (modal) modal.classList.remove("modal-open");
  }

  submitSOSReport() {
    const typeSelect = document.getElementById("sos-type-select");
    const zoneSelect = document.getElementById("sos-location-select");
    const notesInput = document.getElementById("sos-notes-input");

    const type = typeSelect ? typeSelect.value : "Medical Assistance";
    const zoneId = zoneSelect ? zoneSelect.value : "registration";
    const notes = notesInput ? notesInput.value : "";

    const incident = this.emergencySystem.reportSOS(type, zoneId, notes);

    // Switch to confirmation view
    document.getElementById("sos-form-section").style.display = "none";
    const confirmedSection = document.getElementById("sos-confirmed-section");
    confirmedSection.style.display = "block";

    confirmedSection.innerHTML = `
      <div class="sos-success-card">
        <div class="sos-success-icon" style="color:#ef4444;">${ICONS.alertLg.replace('width="20" height="20"','width="56" height="56"')}</div>
        <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:0.25rem;">Emergency Responders Dispatched</h2>
        <div class="incident-code-pill">Ref Code: <strong>#${incident.id}</strong></div>
        <p class="sos-success-msg">
          Emergency response team has received your beacon at <strong>${incident.location}</strong>.
          Estimated on-scene arrival is <strong>2 minutes</strong>.
        </p>
        <div class="sos-guidance-box">
          <strong>While waiting:</strong>
          <ul>
            <li>Remain calm and stay where you are if safe.</li>
            <li>If medical assistance is needed, keep the person comfortable.</li>
            <li>Wave or signal when you hear/see the response team.</li>
          </ul>
        </div>
        <div class="sos-actions-row">
          <button class="btn btn-primary" id="btn-sos-view-route" style="gap:0.4rem;">
            ${ICONS.navigate} Show Route to First Aid
          </button>
          <button class="btn btn-secondary" id="btn-sos-close">
            Done / Dismiss
          </button>
        </div>
      </div>
    `;

    confirmedSection.querySelector("#btn-sos-view-route")?.addEventListener("click", () => {
      this.closeSOSModal();
      this.switchTab("map");
      const destSelect = document.getElementById("select-route-destination");
      if (destSelect) destSelect.value = "node-firstaid";
      this.mapEngine.setDestination("node-firstaid");
      const a11yToggle = document.getElementById("chk-accessible-route");
      if (a11yToggle) {
        a11yToggle.checked = true;
        this.mapEngine.setAccessibleRouting(true);
      }
    });

    confirmedSection.querySelector("#btn-sos-close")?.addEventListener("click", () => {
      this.closeSOSModal();
    });

    this.a11y.playChime("sos");
    this.a11y.announceToScreenReader(`Emergency alert dispatched. Reference code ${incident.id}. Responders en route.`);
  }

  handleIncidentCreated(incident) {
    this.renderOrganizerDashboard();
  }

  handleIncidentUpdated(incident) {
    this.renderOrganizerDashboard();
  }

  /* ==========================================================================
     ORGANIZER DASHBOARD
     ========================================================================== */

  renderOrganizerDashboard() {
    const stats = this.organizer.getEventStats();

    // Stats row
    const statsContainer = document.getElementById("org-stats-cards");
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-card">
          <span class="stat-label">Total Checked-In</span>
          <span class="stat-value">${stats.checkedIn.toLocaleString()}</span>
          <span class="stat-sub">of ${stats.registered.toLocaleString()} registered</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Inside Venue Now</span>
          <span class="stat-value text-indigo">${stats.currentInside.toLocaleString()}</span>
          <span class="stat-sub">${stats.overallUtilization}% Venue Capacity</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Congested Zones</span>
          <span class="stat-value ${stats.congestedCount > 0 ? 'text-amber' : 'text-emerald'}">
            ${stats.congestedCount}
          </span>
          <span class="stat-sub">Requiring crowd diversion</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Active SOS Incidents</span>
          <span class="stat-value ${stats.activeSOSCount > 0 ? 'text-rose' : 'text-emerald'}">
            ${stats.activeSOSCount}
          </span>
          <span class="stat-sub">${stats.criticalSOSCount} Critical Priority</span>
        </div>
      `;
    }

    // Zone crowd controls table
    const crowdControlsTarget = document.getElementById("org-zone-crowd-tbody");
    if (crowdControlsTarget) {
      const zones = this.crowdEngine.getZones();
      crowdControlsTarget.innerHTML = zones.map(z => {
        const pct = Math.round((z.currentCount / z.capacity) * 100);
        return `
          <tr class="zone-row-${z.status}">
            <td><strong>${z.name}</strong></td>
            <td>${z.capacity}</td>
            <td>
              <div class="org-count-control">
                <input type="range" min="0" max="${Math.round(z.capacity * 1.1)}" value="${z.currentCount}" class="range-crowd-slider" data-zone-id="${z.id}" />
                <span class="occupancy-val">${z.currentCount} (${pct}%)</span>
              </div>
            </td>
            <td>
              <span class="status-chip status-${z.status}">${z.status.toUpperCase()}</span>
            </td>
            <td>
              <button class="btn btn-sm btn-danger btn-org-surge" data-zone-id="${z.id}" title="Simulate immediate surge to 96% capacity" style="gap:0.3rem;">
                ${ICONS.zap} Surge (96%)
              </button>
              <button class="btn btn-sm btn-outline btn-org-reset" data-zone-id="${z.id}" title="Reset to standard count" style="gap:0.3rem;">
                ${ICONS.refresh} Reset
              </button>
            </td>
          </tr>
        `;
      }).join('');

      crowdControlsTarget.querySelectorAll(".range-crowd-slider").forEach(slider => {
        slider.addEventListener("input", (e) => {
          const zoneId = e.target.getAttribute("data-zone-id");
          this.crowdEngine.setZoneCount(zoneId, parseInt(e.target.value, 10));
        });
      });

      crowdControlsTarget.querySelectorAll(".btn-org-surge").forEach(btn => {
        btn.addEventListener("click", () => {
          const zoneId = btn.getAttribute("data-zone-id");
          this.crowdEngine.triggerSurge(zoneId);
        });
      });

      crowdControlsTarget.querySelectorAll(".btn-org-reset").forEach(btn => {
        btn.addEventListener("click", () => {
          const zoneId = btn.getAttribute("data-zone-id");
          this.crowdEngine.resetZone(zoneId);
        });
      });
    }

    // Incidents Table
    const incidentsTarget = document.getElementById("org-incidents-tbody");
    if (incidentsTarget) {
      const incidents = this.emergencySystem.getIncidents();
      if (incidents.length === 0) {
        incidentsTarget.innerHTML = `<tr><td colspan="6" class="text-center" style="color:var(--text-muted);padding:1.25rem;">No active or historical incidents.</td></tr>`;
      } else {
        incidentsTarget.innerHTML = incidents.map(inc => {
          const isResolved = inc.status === "Resolved";
          return `
            <tr class="${inc.priority === 'Critical' ? 'row-critical' : ''}">
              <td><strong>#${inc.id}</strong></td>
              <td>${inc.type}</td>
              <td style="display:flex;align-items:center;gap:0.35rem;">${ICONS.mapPin} ${inc.location}</td>
              <td>
                <span class="status-chip ${isResolved ? 'status-optimal' : 'status-critical'}">
                  ${inc.status}
                </span>
              </td>
              <td>${inc.timestamp}</td>
              <td>
                ${!isResolved ? `
                  <button class="btn btn-sm btn-primary btn-org-dispatch" data-inc-id="${inc.id}" style="gap:0.3rem;">
                    ${ICONS.dispatch} Dispatch Team
                  </button>
                  <button class="btn btn-sm btn-secondary btn-org-resolve" data-inc-id="${inc.id}" style="gap:0.3rem;">
                    ${ICONS.check} Resolve
                  </button>
                ` : `
                  <span class="text-muted" style="font-size:0.8rem;">${ICONS.checkCircle} Resolved ${inc.resolvedAt || ''}</span>
                `}
              </td>
            </tr>
          `;
        }).join('');

        incidentsTarget.querySelectorAll(".btn-org-dispatch").forEach(btn => {
          btn.addEventListener("click", () => {
            const incId = btn.getAttribute("data-inc-id");
            this.emergencySystem.updateStatus(incId, "Responders En Route");
            this.a11y.playChime("alert");
            this.a11y.announceToScreenReader(`Responders dispatched for incident ${incId}`);
          });
        });

        incidentsTarget.querySelectorAll(".btn-org-resolve").forEach(btn => {
          btn.addEventListener("click", () => {
            const incId = btn.getAttribute("data-inc-id");
            this.emergencySystem.updateStatus(incId, "Resolved");
            this.a11y.playChime("info");
            this.a11y.announceToScreenReader(`Incident ${incId} marked resolved`);
          });
        });
      }
    }

    // Schedule & Session Operations Table
    const sessionsTarget = document.getElementById("org-sessions-tbody");
    if (sessionsTarget) {
      const sessions = this.organizer.getSessions();
      sessionsTarget.innerHTML = sessions.map(s => {
        const isDelayed = s.status && s.status.includes("Delayed");
        const isRelocated = s.status && s.status.includes("Relocated");
        return `
          <tr>
            <td><strong>${s.title}</strong><br><small style="color:var(--text-muted);display:flex;align-items:center;gap:0.3rem;margin-top:0.2rem;">${ICONS.user} ${s.speaker}</small></td>
            <td style="display:flex;align-items:center;gap:0.35rem;padding-top:1rem;">${ICONS.mapPin} ${s.stageName}</td>
            <td style="white-space:nowrap;">${s.time}</td>
            <td>
              <span class="status-chip ${isDelayed ? 'status-critical' : isRelocated ? 'status-high' : 'status-optimal'}">
                ${s.status || 'On Time'}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                <button class="btn btn-sm btn-outline btn-org-delay" data-sess-id="${s.id}" title="Delay by 15 minutes" style="gap:0.3rem;">
                  ${ICONS.clock} Delay (+15m)
                </button>
                <button class="btn btn-sm btn-outline btn-org-relocate" data-sess-id="${s.id}" title="Relocate to another hall" style="gap:0.3rem;">
                  ${ICONS.move} Move Stage
                </button>
                <button class="btn btn-sm btn-secondary btn-org-reset-sess" data-sess-id="${s.id}" title="Reset session time/stage" style="gap:0.3rem;">
                  ${ICONS.refresh} Reset
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      sessionsTarget.querySelectorAll(".btn-org-delay").forEach(btn => {
        btn.addEventListener("click", () => {
          const sessId = btn.getAttribute("data-sess-id");
          this.organizer.delaySession(sessId, 15);
        });
      });

      sessionsTarget.querySelectorAll(".btn-org-relocate").forEach(btn => {
        btn.addEventListener("click", () => {
          const sessId = btn.getAttribute("data-sess-id");
          const s = this.organizer.getSessions().find(x => x.id === sessId);
          if (!s) return;
          const newStage = s.stageId === "main-arena" ? { id: "hall-b", name: "Hall B: Cloud & Engineering" } : { id: "main-arena", name: "Main Keynote Arena" };
          this.organizer.relocateSession(sessId, newStage.id, newStage.name);
        });
      });

      sessionsTarget.querySelectorAll(".btn-org-reset-sess").forEach(btn => {
        btn.addEventListener("click", () => {
          const sessId = btn.getAttribute("data-sess-id");
          this.organizer.resetSession(sessId);
        });
      });
    }
  }

  /* ==========================================================================
     GLOBAL EVENT BINDINGS
     ========================================================================== */

  bindGlobalEvents() {
    document.getElementById("btn-auth")?.addEventListener("click", () => {
      if (this.auth.user) {
        this.auth.signOut();
        return;
      }
      this.openAuthModal();
    });

    ["btn-landing-login", "btn-landing-hero-login"].forEach((id) => {
      document.getElementById(id)?.addEventListener("click", () => this.openAuthModal("signin"));
    });

    document.getElementById("auth-form")?.addEventListener("submit", (event) => this.submitAuth(event));
    document.getElementById("btn-close-auth-modal")?.addEventListener("click", () => {
      const modal = document.getElementById("modal-auth");
      if (modal?.dataset.required !== "true") modal?.classList.remove("modal-open");
    });
    document.getElementById("btn-toggle-auth-mode")?.addEventListener("click", () => {
      const modal = document.getElementById("modal-auth");
      this.openAuthModal(modal?.dataset.mode === "signup" ? "signin" : "signup");
    });

    // Persona Switch
    document.getElementById("persona-switch-btn")?.addEventListener("click", () => {
      this.togglePersona();
    });

    // Attendee Navigation Tabs
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });

    // SOS Emergency Button
    document.getElementById("btn-global-sos")?.addEventListener("click", () => {
      this.openSOSModal();
    });

    document.getElementById("btn-close-sos-modal")?.addEventListener("click", () => {
      this.closeSOSModal();
    });

    document.getElementById("btn-submit-sos")?.addEventListener("click", () => {
      this.submitSOSReport();
    });

    // Category Filter Pills (Schedule)
    document.querySelectorAll(".category-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        this.selectedCategory = pill.getAttribute("data-category");
        this.updateCategoryPills();
        this.renderSessionsList();
      });
    });

    // Search input (Schedule)
    const searchInput = document.getElementById("input-session-search");
    searchInput?.addEventListener("input", (e) => {
      this.sessionSearchQuery = e.target.value.trim();
      this.renderSessionsList();
    });

    // Filter My Schedule Only toggle
    const myScheduleBtn = document.getElementById("filter-my-schedule-btn");
    myScheduleBtn?.addEventListener("click", () => {
      this.filterMyScheduleOnly = !this.filterMyScheduleOnly;
      myScheduleBtn.classList.toggle("active", this.filterMyScheduleOnly);
      this.renderSessionsList();
    });

    // Interest Onboarding Modal
    const editInterestsBtn = document.getElementById("btn-edit-interests");
    const interestModal = document.getElementById("modal-interests");
    editInterestsBtn?.addEventListener("click", () => {
      if (!interestModal) return;
      // Populate interests checkbox list
      const container = document.getElementById("interests-picker-list");
      const currentInterests = this.recommender.getInterests();
      container.innerHTML = this.recommender.getAllCategories().map(cat => {
        const isChecked = currentInterests.includes(cat.id);
        return `
          <label class="interest-checkbox-item ${isChecked ? 'checked' : ''}">
            <input type="checkbox" value="${cat.id}" ${isChecked ? 'checked' : ''} />
            <span class="interest-checkbox-label">${cat.label}</span>
          </label>
        `;
      }).join('');

      interestModal.classList.add("modal-open");
    });

    document.getElementById("btn-save-interests")?.addEventListener("click", () => {
      const checkedInputs = document.querySelectorAll("#interests-picker-list input:checked");
      const selected = Array.from(checkedInputs).map(inp => inp.value);
      this.recommender.saveInterests(selected);
      interestModal?.classList.remove("modal-open");
      this.a11y.announceToScreenReader("Interest profile updated. Recommendations refreshed.");
    });

    document.getElementById("btn-close-interests-modal")?.addEventListener("click", () => {
      interestModal?.classList.remove("modal-open");
    });

    // Organizer Broadcast Form
    const broadcastForm = document.getElementById("form-org-broadcast");
    broadcastForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("input-broadcast-title").value;
      const type = document.getElementById("select-broadcast-type").value;
      const message = document.getElementById("input-broadcast-message").value;

      if (!title || !message) return;

      this.organizer.publishAnnouncement(title, type, message);
      broadcastForm.reset();

      // Show confirmation toast
      const toast = document.getElementById("broadcast-success-toast");
      if (toast) {
        toast.style.display = "block";
        setTimeout(() => toast.style.display = "none", 4000);
      }
    });
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SmartEventApp();
});
