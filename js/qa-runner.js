/**
 * Smart Event Experience Platform - Automated End-to-End QA Test Runner
 */

export async function runAllQATests() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
    errors: []
  };

  function assert(name, condition, details = "") {
    results.total++;
    if (condition) {
      results.passed++;
      results.tests.push({ name, status: "PASS", details });
      console.log(`%c[PASS] ${name}`, "color: #10b981; font-weight: bold;", details);
    } else {
      results.failed++;
      results.tests.push({ name, status: "FAIL", details });
      console.error(`[FAIL] ${name}`, details);
    }
  }

  console.log("%c=======================================================", "color: #6366f1;");
  console.log("%c STARTING COMPLETE END-TO-END QA TEST SUITE", "color: #6366f1; font-weight: bold;");
  console.log("%c=======================================================", "color: #6366f1;");

  const app = window.app;
  if (!app) {
    assert("App Initialization", false, "window.app is not defined");
    return results;
  }

  try {
    // -------------------------------------------------------------
    // TEST GROUP 1: Core Layout & Attendee Dashboard
    // -------------------------------------------------------------
    assert("App Instance Available", !!app, "SmartEventApp initialized properly");
    assert("Header SOS Button Exists", !!document.getElementById("btn-global-sos"));
    assert("Persona Switcher Button Exists", !!document.getElementById("persona-switch-btn"));
    assert("Live Announcements Bar Rendered", !!document.getElementById("live-announcements-banner"));
    assert("Home Pulse Stats Rendered", document.getElementById("home-pulse-stats").children.length >= 3);
    assert("Next Highlight Session Rendered", !!document.querySelector("#home-next-session .featured-session-card"));

    // -------------------------------------------------------------
    // TEST GROUP 2: Attendee Navigation Tabs
    // -------------------------------------------------------------
    const tabs = ["home", "map", "schedule", "foryou", "crowd", "a11y", "emergency"];
    for (const tab of tabs) {
      app.switchTab(tab);
      const activeView = document.getElementById(`view-${tab}`);
      const btn = document.getElementById(`tab-btn-${tab}`);
      assert(`Tab Switch -> ${tab}`, activeView && activeView.classList.contains("active-view") && btn.classList.contains("active"));
    }

    // -------------------------------------------------------------
    // TEST GROUP 3: Interactive Venue Map & SVG Engine
    // -------------------------------------------------------------
    app.switchTab("map");
    const svgMap = document.querySelector(".event-svg-map");
    assert("SVG Map Rendered", !!svgMap, "SVG element present in DOM");
    const zonesRendered = document.querySelectorAll(".zone-group");
    assert("Venue Zones Rendered (8 Zones)", zonesRendered.length === 8, `Found ${zonesRendered.length} zones`);
    const nodesRendered = document.querySelectorAll(".map-node");
    assert("Map Nodes Rendered", nodesRendered.length >= 20, `Found ${nodesRendered.length} waypoints`);

    // Test Zoom & Pan Controls
    const initialZoom = app.mapEngine.zoom;
    app.mapEngine.zoomIn();
    assert("Map Zoom In", app.mapEngine.zoom > initialZoom, `Zoom updated to ${app.mapEngine.zoom}`);
    app.mapEngine.resetView();
    assert("Map Reset View", app.mapEngine.zoom === 1, "Zoom reset to 1");

    // -------------------------------------------------------------
    // TEST GROUP 4: Route Calculation & Pathfinding
    // -------------------------------------------------------------
    // Standard Route: Registration to Arena
    app.mapEngine.setOrigin("node-reg");
    app.mapEngine.setDestination("node-arena-entry");
    let route = app.mapEngine.currentRoute;
    assert("Standard Route Calculated", route && route.path.length >= 2 && route.totalDistance > 0, `Distance: ${route?.totalDistance}m, Time: ~${route?.estimatedMinutes}m`);
    assert("Turn-by-Turn Instructions Generated", route.turnInstructions.length >= 2, `Steps: ${route.turnInstructions.length}`);

    // -------------------------------------------------------------
    // TEST GROUP 5: Accessible (Step-Free) Routing
    // -------------------------------------------------------------
    // Test routing between South Cross and North Cross
    // Without step-free: Uses stairs (node-stairs-center)
    app.mapEngine.setOrigin("node-cross-south");
    app.mapEngine.setDestination("node-cross-north");
    app.mapEngine.setAccessibleRouting(false);
    let standardRoute = app.mapEngine.currentRoute;
    const usesStairs = standardRoute.path.some(n => n.id === "node-stairs-center");
    assert("Standard Route Chooses Direct Stairs Shortcut", usesStairs, "Path traverses node-stairs-center");

    // With step-free: MUST avoid stairs and use Elevator/Ramp
    app.mapEngine.setAccessibleRouting(true);
    let accessibleRoute = app.mapEngine.currentRoute;
    const avoidsStairs = !accessibleRoute.path.some(n => n.id === "node-stairs-center");
    const usesElevatorOrRamp = accessibleRoute.path.some(n => n.id === "node-elevator-west" || n.id === "node-ramp-north");
    assert("Accessible Route Excludes Stairs & Uses Elevator/Ramp", avoidsStairs && usesElevatorOrRamp, "Step-free routing correctly avoids stairs");

    // -------------------------------------------------------------
    // TEST GROUP 6: Dynamic Crowd Detour Routing
    // -------------------------------------------------------------
    // Route from South Cross to Hall B
    app.mapEngine.setOrigin("node-cross-south");
    app.mapEngine.setDestination("node-hallb-entry");
    app.mapEngine.setAvoidCrowds(true);
    // Expo Hall is Critical (92%+)
    let detourRoute = app.mapEngine.currentRoute;
    const avoidsExpoCenter = !detourRoute.path.some(n => n.id === "node-expo-center");
    assert("Crowd Detour Bypasses Congested Expo Hall", avoidsExpoCenter || detourRoute.crowdDetourUsed, "Smart routing successfully detected congestion");

    // -------------------------------------------------------------
    // TEST GROUP 7: Session Discovery, Search & Bookmarking
    // -------------------------------------------------------------
    app.switchTab("schedule");
    const searchInput = document.getElementById("input-session-search");
    searchInput.value = "Kubernetes";
    searchInput.dispatchEvent(new Event("input"));
    const filteredCards = document.querySelectorAll("#sessions-catalog-list .session-card");
    assert("Session Search by Keyword", filteredCards.length === 1 && filteredCards[0].textContent.includes("Kubernetes"), "Search accurately found target session");

    // Reset search
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));

    // Filter by category: 'ai'
    const aiPill = document.querySelector('.category-pill[data-category="ai"]');
    aiPill?.click();
    const aiCards = document.querySelectorAll("#sessions-catalog-list .session-card");
    assert("Session Category Filter ('ai')", aiCards.length >= 2, `Found ${aiCards.length} AI track sessions`);

    // Reset category filter
    document.querySelector('.category-pill[data-category="all"]')?.click();

    // Toggle Bookmarking
    const testSessId = "sess-4";
    const initialBookmarked = app.bookmarkedSessions.includes(testSessId);
    app.toggleBookmark(testSessId);
    assert("Toggle Add Bookmark", app.bookmarkedSessions.includes(testSessId) !== initialBookmarked);
    // Verify LocalStorage
    const savedBookmarks = JSON.parse(localStorage.getItem("nexus_user_schedule") || "[]");
    assert("Bookmarks Persisted in LocalStorage", savedBookmarks.includes(testSessId) === app.bookmarkedSessions.includes(testSessId));

    // Filter "My Schedule Only"
    const myScheduleBtn = document.getElementById("filter-my-schedule-btn");
    myScheduleBtn.click();
    const mySchedCards = document.querySelectorAll("#sessions-catalog-list .session-card");
    assert("Filter My Schedule Only", mySchedCards.length === app.bookmarkedSessions.length);
    myScheduleBtn.click(); // Reset filter

    // -------------------------------------------------------------
    // TEST GROUP 8: Personalized Recommendations ("For You")
    // -------------------------------------------------------------
    app.switchTab("foryou");
    const initialRecs = app.recommender.getRecommendations(app.organizer.getSessions(), 4);
    const topInitialTitle = initialRecs[0].title;

    // Change interests to Robotics & Security
    app.recommender.saveInterests(["robotics", "security"]);
    const updatedRecs = app.recommender.getRecommendations(app.organizer.getSessions(), 4);
    const topUpdated = updatedRecs[0];
    assert("Personalized Recommendations Recalculated on Interest Change", topUpdated.category === "robotics" || topUpdated.category === "security", `New top recommendation: ${topUpdated.title} (${topUpdated.category})`);
    assert("Match Rationale Badges Displayed", topUpdated.matchReasons.length > 0, topUpdated.matchReasons.join(", "));

    // Restore interests
    app.recommender.saveInterests(["ai", "frontend"]);

    // -------------------------------------------------------------
    // TEST GROUP 9: Accessibility Suite Controls
    // -------------------------------------------------------------
    app.switchTab("a11y");
    // High Contrast Toggle
    const contrastActive = app.a11y.toggleHighContrast();
    assert("High Contrast Mode Enabled", document.documentElement.classList.contains("high-contrast"));
    app.a11y.toggleHighContrast(); // disable
    assert("High Contrast Mode Disabled", !document.documentElement.classList.contains("high-contrast"));

    // Typography Scaling
    app.a11y.setFontSize("large");
    assert("Typography Scaling (Large)", document.documentElement.classList.contains("font-large"));
    app.a11y.setFontSize("normal");

    // Speech Narrator Call Check
    assert("Speech Narrator Configured", typeof app.a11y.speak === "function");
    assert("Audio Synthesizer Configured", typeof app.a11y.playChime === "function");

    // -------------------------------------------------------------
    // TEST GROUP 10: Emergency SOS Workflow
    // -------------------------------------------------------------
    app.switchTab("emergency");
    assert("Nearest First Aid Station Displayed", !!document.querySelector("#first-aid-quick-card .first-aid-card-content"));
    assert("Direct Hotline Links Accessible", document.querySelectorAll(".btn-call-emergency").length >= 3);

    // Open SOS Modal & Submit Incident
    app.openSOSModal();
    const modal = document.getElementById("modal-sos");
    assert("SOS Modal Opened", modal.classList.contains("modal-open"));

    // Set fields and dispatch
    const incidentTypeSelect = document.getElementById("sos-type-select");
    const locationSelect = document.getElementById("sos-location-select");
    if (incidentTypeSelect) incidentTypeSelect.value = "Medical Assistance";
    if (locationSelect) locationSelect.value = "hall-a";

    app.submitSOSReport();
    const confirmedSection = document.getElementById("sos-confirmed-section");
    assert("SOS Confirmation View Displayed", confirmedSection && confirmedSection.style.display !== "none");
    assert("Incident Reference Code Assigned", confirmedSection.textContent.includes("SOS-"));
    app.closeSOSModal();

    // -------------------------------------------------------------
    // TEST GROUP 11: Organizer Command Mode & Operations
    // -------------------------------------------------------------
    app.togglePersona(); // Switch to Organizer Mode
    assert("Persona Switched to Organizer", app.currentPersona === "organizer");
    assert("Organizer Experience Container Visible", !document.getElementById("organizer-experience").classList.contains("hidden"));
    assert("Attendee Experience Container Hidden", document.getElementById("attendee-experience").classList.contains("hidden"));

    // Verify Organizer Stats
    const statsCards = document.querySelectorAll("#org-stats-cards .stat-card");
    assert("Organizer Operations KPI Cards Rendered (4 Cards)", statsCards.length === 4);

    // Test Crowd Surge Simulator
    const targetZoneId = "hall-a";
    app.crowdEngine.triggerSurge(targetZoneId);
    const surgedZone = app.crowdEngine.getZone(targetZoneId);
    assert("Organizer Crowd Surge Triggered", surgedZone.status === "critical" && surgedZone.currentCount >= Math.round(surgedZone.capacity * 0.95));

    // Test Announcement Broadcasting
    const testTitle = "QA Urgent Evacuation Test";
    const testMsg = "Please disregard, automated test alert.";
    app.organizer.publishAnnouncement(testTitle, "urgent", testMsg);
    const latestAnn = app.organizer.getAnnouncements()[0];
    assert("Organizer Broadcast Published", latestAnn.title === testTitle && latestAnn.type === "urgent");

    // Switch to Attendee Mode to verify real-time sync
    app.togglePersona();
    const marquee = document.getElementById("announcement-marquee");
    assert("Attendee View Immediately Receives Organizer Announcement", marquee.textContent.includes(testTitle));

    // Switch back to Organizer to test incident resolution
    app.togglePersona();

    // Test SOS Incident Queue
    const activeIncidents = app.emergencySystem.getIncidents();
    const reportedIncident = activeIncidents.find(i => i.details.includes("emergency panic dispatch") || i.id.startsWith("SOS-"));
    assert("Attendee SOS Appears in Organizer Incident Console", !!reportedIncident);

    if (reportedIncident) {
      // Test Dispatch
      app.emergencySystem.updateStatus(reportedIncident.id, "Responders En Route");
      assert("Incident Status Updated to 'Responders En Route'", reportedIncident.status === "Responders En Route");

      // Test Resolve
      app.emergencySystem.updateStatus(reportedIncident.id, "Resolved");
      assert("Incident Status Updated to 'Resolved'", reportedIncident.status === "Resolved");
    }

    // Test Session Delay & Relocation
    const sessionToDelay = app.organizer.getSessions()[0];
    app.organizer.delaySession(sessionToDelay.id, 15);
    const delayedSession = app.organizer.getSessions().find(s => s.id === sessionToDelay.id);
    assert("Session Delayed by 15m", delayedSession.status.includes("Delayed (+15m)"));

    app.organizer.relocateSession(sessionToDelay.id, "hall-b", "Hall B: Cloud & Engineering");
    const relocatedSession = app.organizer.getSessions().find(s => s.id === sessionToDelay.id);
    assert("Session Relocated to Hall B", relocatedSession.stageId === "hall-b");

    // Reset session
    app.organizer.resetSession(sessionToDelay.id);

    // Switch back to Attendee Mode as default
    app.togglePersona();

    // -------------------------------------------------------------
    // TEST GROUP 12: Responsiveness & Layout
    // -------------------------------------------------------------
    const bodyWidth = document.body.clientWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    assert("No Horizontal Layout Overflow", bodyScrollWidth <= bodyWidth + 20, `Scroll: ${bodyScrollWidth}px, Client: ${bodyWidth}px`);

    console.log("%c=======================================================", "color: #10b981;");
    console.log(`%c QA TEST SUITE COMPLETED: ${results.passed}/${results.total} TESTS PASSED`, "color: #10b981; font-weight: bold; font-size: 14px;");
    console.log("%c=======================================================", "color: #10b981;");

  } catch (err) {
    results.errors.push(err.toString());
    console.error("QA Test Suite Runtime Error:", err);
  }

  window.__QA_RESULTS__ = results;
  return results;
}

window.runAllQATests = runAllQATests;

// Auto-run if ?qa=true or ?test=true in query string
if (window.location.search.includes("qa=true") || window.location.search.includes("test=true")) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(runAllQATests, 300);
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      setTimeout(runAllQATests, 300);
    });
  }
}
