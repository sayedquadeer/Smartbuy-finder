/**
 * SmartBuy Finder - Filter & Scoring Engine (Stage 2)
 */

window.FilterEngine = {
  /**
   * Calculate matching score (0 to 100) for a product based on user selections.
   */
  calculateScore: function(product, selections) {
    let score = 0;

    // 1. Category Match (40 Points Max)
    if (selections.category && product.category === selections.category) {
      score += 40;
    }

    // 2. Budget Match (25 Points Max)
    if (selections.budget && product.budget === selections.budget) {
      score += 25;
    }

    // 3. Use-case Match (20 Points Max)
    if (selections.useCase && Array.isArray(product.useCases) && product.useCases.includes(selections.useCase)) {
      score += 20;
    }

    // 4. Priority Match (15 Points Max)
    if (selections.priority && Array.isArray(product.priorities) && product.priorities.includes(selections.priority)) {
      score += 15;
    }

    return score;
  },

  /**
   * Filter, score, and rank dataset products.
   */
  getRecommendations: function(products, selections, sortBy = "best-match") {
    if (!Array.isArray(products)) return [];

    // Filter by category first if specified
    let filtered = products;
    if (selections.category) {
      filtered = products.filter(p => p.category === selections.category);
    }

    // Score all items
    let scoredList = filtered.map(product => {
      const matchScore = this.calculateScore(product, selections);
      return {
        ...product,
        matchScore: matchScore
      };
    });

    // Sort based on criteria
    if (sortBy === "budget-first") {
      const budgetOrder = {
        "under-1000": 1,
        "1000-3000": 2,
        "3000-5000": 3,
        "5000-10000": 4,
        "10000+": 5
      };
      scoredList.sort((a, b) => (budgetOrder[a.budget] || 99) - (budgetOrder[b.budget] || 99));
    } else if (sortBy === "feature-match") {
      scoredList.sort((a, b) => b.features.length - a.features.length);
    } else {
      // Default: Best Match
      scoredList.sort((a, b) => b.matchScore - a.matchScore);
    }

    // Label top 3 distinct choices
    const topResults = scoredList.slice(0, 3);
    const badges = ["Best Match", "Best Alternative", "Budget Choice"];
    
    return topResults.map((item, index) => {
      return {
        ...item,
        recommendationBadge: badges[index] || "Recommended"
      };
    });
  }
};

