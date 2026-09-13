/**
 * Smart Event Experience Platform - Personalized Recommendation Engine
 */

import { INTEREST_CATEGORIES } from './data.js';

export class RecommendationEngine {
  constructor(options = {}) {
    this.storageKey = "nexus_user_interests";
    this.selectedInterests = this.loadInterests();
    this.onInterestsChanged = options.onInterestsChanged || null;
  }

  loadInterests() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not parse saved interests, using defaults.", e);
    }
    // Default initial interests for first-time attendee
    return ["ai", "frontend"];
  }

  saveInterests(interests) {
    this.selectedInterests = Array.from(new Set(interests));
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.selectedInterests));
    } catch (e) {
      console.error("Failed to persist user interests to localStorage", e);
    }
    if (this.onInterestsChanged) {
      this.onInterestsChanged(this.selectedInterests);
    }
  }

  toggleInterest(interestId) {
    const next = new Set(this.selectedInterests);
    if (next.has(interestId)) {
      next.delete(interestId);
    } else {
      next.add(interestId);
    }
    this.saveInterests(Array.from(next));
  }

  getInterests() {
    return [...this.selectedInterests];
  }

  getAllCategories() {
    return [...INTEREST_CATEGORIES];
  }

  /**
   * Evaluates relevance score for a given session based on user interests
   */
  scoreSession(session, userInterests = this.selectedInterests) {
    if (!userInterests || userInterests.length === 0) {
      return { score: 0, reasons: [] };
    }

    let score = 0;
    const reasons = [];

    // Category match (+50 points)
    if (userInterests.includes(session.category)) {
      score += 50;
      const catObj = INTEREST_CATEGORIES.find(c => c.id === session.category);
      if (catObj) {
        reasons.push(`Direct track match for ${catObj.label}`);
      }
    }

    // Tag matching (+25 points each)
    if (Array.isArray(session.tags)) {
      session.tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase();
        userInterests.forEach(intId => {
          const cat = INTEREST_CATEGORIES.find(c => c.id === intId);
          if (cat && (normalizedTag.includes(intId) || cat.label.toLowerCase().includes(normalizedTag))) {
            score += 25;
            if (!reasons.some(r => r.includes(cat.label))) {
              reasons.push(`Matches keyword: "${tag}"`);
            }
          }
        });
      });
    }

    // Boost live sessions slightly for prompt attendee action
    if (session.status === "Live Now") {
      score += 15;
      reasons.push("Happening right now!");
    }

    return { score, reasons };
  }

  /**
   * Generates ranked recommendations
   */
  getRecommendations(sessions, limit = 4) {
    const scored = sessions.map(session => {
      const { score, reasons } = this.scoreSession(session, this.selectedInterests);
      return {
        ...session,
        matchScore: score,
        matchReasons: reasons
      };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    // Filter out zero score items unless all are zero
    const matched = scored.filter(s => s.matchScore > 0);
    return (matched.length > 0 ? matched : scored).slice(0, limit);
  }
}

