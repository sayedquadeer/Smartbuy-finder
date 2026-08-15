document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Mobile Navigation Menu ---
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // --- 2. FAQ Accordion ---
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // --- 3. Update Global Comparison Badge ---
  updateCompareBadge();

  // --- 4. Page Routing & Initialization ---
  const finderContainer = document.getElementById('finder-wizard-container');
  if (finderContainer) {
    initProductFinder(finderContainer);
  }

  const compareContainer = document.getElementById('compare-page-container');
  if (compareContainer) {
    initComparisonPage(compareContainer);
  }
});

/* ==========================================
   GLOBAL COMPARISON HELPERS (localStorage)
   ========================================== */
function getCompareList() {
  try {
    return JSON.parse(localStorage.getItem('smartbuy_compare') || '[]');
  } catch (e) {
    return [];
  }
}

function updateCompareBadge() {
  const badge = document.getElementById('nav-compare-badge');
  if (badge) {
    const list = getCompareList();
    badge.textContent = list.length;
  }
}

function addToCompare(productId) {
  let compareList = getCompareList();
  
  if (compareList.includes(productId)) {
    alert("This product is already in your comparison list.");
    return;
  }
  
  if (compareList.length >= 3) {
    alert("You can compare a maximum of 3 products at a time.");
    return;
  }

  compareList.push(productId);
  localStorage.setItem('smartbuy_compare', JSON.stringify(compareList));
  updateCompareBadge();
  alert("Product added to comparison!");
}

function removeFromCompare(productId) {
  let compareList = getCompareList();
  compareList = compareList.filter(id => id !== productId);
  localStorage.setItem('smartbuy_compare', JSON.stringify(compareList));
  updateCompareBadge();
  
  const compareContainer = document.getElementById('compare-page-container');
  if (compareContainer) {
    initComparisonPage(compareContainer);
  }
}

function clearComparison() {
  localStorage.removeItem('smartbuy_compare');
  updateCompareBadge();
  const compareContainer = document.getElementById('compare-page-container');
  if (compareContainer) {
    initComparisonPage(compareContainer);
  }
}


/* ==========================================
   PRODUCT FINDER WIZARD & RENDERER
   ========================================== */
function initProductFinder(container) {
  let currentStep = 1;
  let currentSort = "best-match";

  const selections = {
    category: '',
    budget: '',
    useCase: '',
    priority: ''
  };

  // URL Parameter Handling: ?category=...
  const urlParams = new URLSearchParams(window.location.search);
  const paramCategory = urlParams.get('category');
  const validCategories = ["microphones", "webcams", "tripods", "ring-lights", "headphones"];
  
  if (paramCategory && validCategories.includes(paramCategory.toLowerCase())) {
    selections.category = paramCategory.toLowerCase();
  }

  function render() {
    renderFinderStep(container, currentStep, selections, currentSort);
  }

  // Event Delegation for Wizard Interaction
  container.addEventListener('click', (e) => {
    const optionCard = e.target.closest('.option-card');
    const actionBtn = e.target.closest('[data-action]');

    if (optionCard) {
      const key = optionCard.dataset.key;
      const value = optionCard.dataset.value;
      selections[key] = value;
      
      // Clear validation message if displayed
      const validationEl = document.getElementById('wizard-validation');
      if (validationEl) validationEl.style.display = 'none';
      
      render();
    }

    if (actionBtn) {
      const action = actionBtn.dataset.action;

      if (action === 'next') {
        const currentKey = getCurrentKey(currentStep);
        if (!selections[currentKey]) {
          showValidation("Please select an option before continuing.");
          return;
        }
        if (currentStep < 4) {
          currentStep++;
          render();
        }
      } else if (action === 'prev') {
        if (currentStep > 1) {
          currentStep--;
          render();
        }
      } else if (action === 'submit') {
        if (!selections.priority) {
          showValidation("Please select your primary priority.");
          return;
        }
        currentStep = 5; // Results screen
        render();
      } else if (action === 'reset') {
        currentStep = 1;
        selections.category = '';
        selections.budget = '';
        selections.useCase = '';
        selections.priority = '';
        render();
      }
    }
  });

  // Sort dropdown change handler
  container.addEventListener('change', (e) => {
    if (e.target.id === 'results-sort-select') {
      currentSort = e.target.value;
      render();
    }
  });

  render();
}

function getCurrentKey(step) {
  switch(step) {
    case 1: return 'category';
    case 2: return 'budget';
    case 3: return 'useCase';
    case 4: return 'priority';
    default: return '';
  }
}

function showValidation(msg) {
  const validationEl = document.getElementById('wizard-validation');
  if (validationEl) {
    validationEl.textContent = msg;
    validationEl.style.display = 'block';
  }
}

function renderFinderStep(container, step, selections, currentSort) {
  // Render Step 5: Recommended Results
  if (step === 5) {
    renderFinderResults(container, selections, currentSort);
    return;
  }

  const stepTitles = [
    "What product category are you looking for?",
    "What is your target budget range?",
    "What will be your primary use case?",
    "What feature or trait matters most to you?"
  ];

  const stepOptions = {
    1: [
      { label: "Microphones", value: "microphones", icon: "🎤" },
      { label: "Webcams", value: "webcams", icon: "📷" },
      { label: "Tripods", value: "tripods", icon: "📱" },
      { label: "Ring Lights", value: "ring-lights", icon: "💡" },
      { label: "Headphones", value: "headphones", icon: "🎧" }
    ],
    2: [
      { label: "Under ₹1,000", value: "under-1000", icon: "🏷️" },
      { label: "₹1,000 – ₹3,000", value: "1000-3000", icon: "💳" },
      { label: "₹3,000 – ₹5,000", value: "3000-5000", icon: "💰" },
      { label: "₹5,000 – ₹10,000", value: "5000-10000", icon: "💎" },
      { label: "₹10,000+", value: "10000+", icon: "⭐" }
    ],
    3: [
      { label: "YouTube Videos", value: "youtube", icon: "📹" },
      { label: "Gaming & Streaming", value: "gaming", icon: "🎮" },
      { label: "Online Classes", value: "online-classes", icon: "🎓" },
      { label: "Podcasting", value: "podcasting", icon: "🎙️" },
      { label: "Content Creation", value: "content-creation", icon: "🎨" }
    ],
    4: [
      { label: "Best Price", value: "price", icon: "🏷️" },
      { label: "High Build Quality", value: "quality", icon: "🛡️" },
      { label: "Ease of Use", value: "ease-of-use", icon: "⚡" },
      { label: "Portability", value: "portability", icon: "🎒" },
      { label: "Rich Features", value: "features", icon: "⚙️" }
    ]
  };

  const currentKey = getCurrentKey(step);
  const options = stepOptions[step] || [];
  const progressPercent = (step / 4) * 100;

  container.innerHTML = `
    <div class="finder-wizard">
      <div class="progress-container">
        <div style="display:flex; justify-between:space-between; font-size:0.875rem; color:var(--text-muted);">
          <span>Step ${step} of 4</span>
          <span>${progressPercent}% Completed</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <h2 style="font-size: 1.35rem; text-align: center; margin-bottom: 0.5rem;">${stepTitles[step - 1]}</h2>

      <div class="option-grid">
        ${options.map(opt => `
          <div class="option-card ${selections[currentKey] === opt.value ? 'selected' : ''}"
               data-key="${currentKey}" data-value="${opt.value}" role="button" tabindex="0">
            <span class="icon">${opt.icon}</span>
            <span>${opt.label}</span>
          </div>
        `).join('')}
      </div>

      <div id="wizard-validation" class="validation-msg"></div>

      <div class="wizard-actions">
        ${step > 1 
          ? `<button class="btn btn-secondary" data-action="prev">&larr; Back</button>` 
          : `<div></div>`
        }
        ${step < 4 
          ? `<button class="btn btn-primary" data-action="next">Continue &rarr;</button>` 
          : `<button class="btn btn-primary" data-action="submit">Find My Products ✨</button>`
        }
      </div>
    </div>
  `;
}

function renderFinderResults(container, selections, sortCriteria) {
  const products = window.PRODUCTS_DATA || [];
  const results = window.FilterEngine 
    ? window.FilterEngine.getRecommendations(products, selections, sortCriteria)
    : [];

  container.innerHTML = `
    <div style="max-width: 1000px; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <h2 style="font-size:1.75rem;">Your Recommended Products</h2>
          <p style="color:var(--text-muted); font-size:0.95rem;">Tailored recommendations based on your preferences</p>
        </div>
        <div style="display:flex; gap:1rem; align-items:center;">
          <label for="results-sort-select" style="font-size:0.9rem; font-weight:600; color:var(--text-main);">Sort By:</label>
          <select id="results-sort-select" class="btn btn-secondary btn-sm" style="padding:0.4rem 0.6rem;">
            <option value="best-match" ${sortCriteria === 'best-match' ? 'selected' : ''}>Best Match</option>
            <option value="budget-first" ${sortCriteria === 'budget-first' ? 'selected' : ''}>Budget First</option>
            <option value="feature-match" ${sortCriteria === 'feature-match' ? 'selected' : ''}>Feature Count</option>
          </select>
          <button class="btn btn-outline btn-sm" data-action="reset">Start Over</button>
        </div>
      </div>

      <div class="grid-3">
        ${results.map(p => `
          <div class="card product-card">
            <div>
              <div class="product-card-header">
                <span class="badge badge-match">${p.recommendationBadge}</span>
                <span class="badge badge-demo">${p.badge}</span>
              </div>
              <span class="product-category">${p.category}</span>
              <h3 class="product-title">${p.name}</h3>
              <p class="product-desc">${p.description}</p>
              
              <div class="match-score-tag">
                🎯 ${p.matchScore}% Match
              </div>
              <div class="match-disclaimer">SmartBuy Finder demo match score</div>

              <ul class="product-features">
                ${p.features.map(f => `<li>${f}</li>`).join('')}
              </ul>

              <div class="pros-cons-container">
                <ul class="pros-list">
                  ${p.pros.map(pro => `<li>${pro}</li>`).join('')}
                </ul>
                <ul class="cons-list">
                  ${p.cons.map(con => `<li>${con}</li>`).join('')}
                </ul>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:1rem;">
              <button class="btn btn-secondary btn-sm" onclick="addToCompare('${p.id}')" style="width:100%;">
                + Add to Compare
              </button>
              <a href="${p.retailerUrl}" class="btn btn-outline btn-sm" style="width:100%; text-align:center;">
                View Retailer
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}


/* ==========================================
   COMPARISON PAGE RENDERER
   ========================================== */
function initComparisonPage(container) {
  const compareList = getCompareList();
  const allProducts = window.PRODUCTS_DATA || [];
  const selectedProducts = allProducts.filter(p => compareList.includes(p.id));

  if (selectedProducts.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding: 4rem 2rem;">
        <div style="font-size:3rem; margin-bottom:1rem;">⚖️</div>
        <h2>No Products Selected Yet</h2>
        <p style="color:var(--text-muted); margin-bottom:1.5rem; max-width:450px; margin-left:auto; margin-right:auto;">
          You have not added any items to your comparison list. Use the Product Finder to discover options and compare features side-by-side.
        </p>
        <a href="product-finder.html" class="btn btn-primary">Find Products to Compare</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
      <a href="product-finder.html" class="btn btn-secondary btn-sm">&larr; Back to Product Finder</a>
      <div style="display:flex; gap:0.75rem; align-items:center;">
        <span style="font-size:0.9rem; color:var(--text-muted);">${selectedProducts.length} of 3 selected</span>
        <button class="btn btn-outline btn-sm" onclick="clearComparison()">Clear Comparison</button>
      </div>
    </div>

    <div class="comparison-wrapper">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Product Info</th>
            ${selectedProducts.map(p => `
              <td>
                <span class="badge badge-demo" style="margin-bottom:0.4rem;">${p.badge}</span>
                <h3 style="font-size:1.1rem; margin-bottom:0.25rem;">${p.name}</h3>
                <button onclick="removeFromCompare('${p.id}')" class="btn btn-sm" style="background:none; border:none; color:#dc2626; padding:0; cursor:pointer; font-size:0.8rem;">
                  ✕ Remove
                </button>
              </td>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Category</th>
            ${selectedProducts.map(p => `<td><strong style="text-transform:uppercase; font-size:0.85rem;">${p.category}</strong></td>`).join('')}
          </tr>
          <tr>
            <th>Budget Range</th>
            ${selectedProducts.map(p => `<td>₹${p.budget}</td>`).join('')}
          </tr>
          <tr>
            <th>Description</th>
            ${selectedProducts.map(p => `<td>${p.description}</td>`).join('')}
          </tr>
          <tr>
            <th>Key Features</th>
            ${selectedProducts.map(p => `
              <td>
                <ul class="product-features">
                  ${p.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
              </td>
            `).join('')}
          </tr>
          <tr>
            <th>Pros</th>
            ${selectedProducts.map(p => `
              <td>
                <ul class="pros-list" style="font-size:0.875rem;">
                  ${p.pros.map(pro => `<li>${pro}</li>`).join('')}
                </ul>
              </td>
            `).join('')}
          </tr>
          <tr>
            <th>Cons</th>
            ${selectedProducts.map(p => `
              <td>
                <ul class="cons-list" style="font-size:0.875rem;">
                  ${p.cons.map(con => `<li>${con}</li>`).join('')}
                </ul>
              </td>
            `).join('')}
          </tr>
          <tr>
            <th>Retailer Link</th>
            ${selectedProducts.map(p => `
              <td>
                <a href="${p.retailerUrl}" class="btn btn-outline btn-sm" style="width:100%; text-align:center;">
                  View Retailer
                </a>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;
                                                }
