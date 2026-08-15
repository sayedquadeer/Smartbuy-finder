document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Navigation Menu ---
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // --- FAQ Accordion ---
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all active items
      document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));
      
      // Toggle clicked item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // --- Multi-Step Product Finder Logic ---
  const finderWizard = document.getElementById('finder-wizard-container');
  if (finderWizard) {
    initProductFinder();
  }

  // --- Comparison Page Logic ---
  const compareContainer = document.getElementById('compare-page-container');
  if (compareContainer) {
    initComparisonPage();
  }
});

/* --- PRODUCT FINDER LOGIC --- */
function initProductFinder() {
  let currentStep = 1;
  const selections = {
    category: '',
    budget: '',
    useCase: '',
    priority: ''
  };

  // Check URL params for preselected category
  const urlParams = new URLSearchParams(window.location.search);
  const paramCategory = urlParams.get('category');
  if (paramCategory) {
    selections.category = paramCategory;
  }

  renderStep(currentStep, selections);

  document.getElementById('finder-wizard-container').addEventListener('click', (e) => {
    const optionBtn = e.target.closest('.option-btn');
    const actionBtn = e.target.closest('[data-action]');

    if (optionBtn) {
      const key = optionBtn.dataset.key;
      const value = optionBtn.dataset.value;
      selections[key] = value;
      renderStep(currentStep, selections);
    }

    if (actionBtn) {
      const action = actionBtn.dataset.action;
      if (action === 'next' && currentStep < 4) {
        currentStep++;
        renderStep(currentStep, selections);
      } else if (action === 'prev' && currentStep > 1) {
        currentStep--;
        renderStep(currentStep, selections);
      } else if (action === 'submit') {
        calculateAndDisplayResults(selections);
      } else if (action === 'reset') {
        currentStep = 1;
        selections.category = '';
        selections.budget = '';
        selections.useCase = '';
        selections.priority = '';
        renderStep(currentStep, selections);
      }
    }
  });
}

function renderStep(step, selections) {
  const container = document.getElementById('finder-wizard-container');
  
  const stepTitles = [
    "What product category are you looking for?",
    "What is your target budget range?",
    "What will be your main use case?",
    "What feature matters most to you?"
  ];

  const categories = [
    { label: "🎤 Microphones", value: "microphones" },
    { label: "📷 Webcams", value: "webcams" },
    { label: "📱 Tripods", value: "tripods" },
    { label: "💡 Ring Lights", value: "ring-lights" },
    { label: "🎧 Headphones", value: "headphones" }
  ];

  const budgets = [
    { label: "Under ₹1,000", value: "under-1000" },
    { label: "₹1,000 – ₹3,000", value: "1000-3000" },
    { label: "₹3,000 – ₹5,000", value: "3000-5000" },
    { label: "₹5,000 – ₹10,000", value: "5000-10000" },
    { label: "₹10,000+", value: "10000+" }
  ];

  const useCases = [
    { label: "YouTube Videos", value: "youtube" },
    { label: "Gaming & Live Streams", value: "gaming" },
    { label: "Online Classes & Work", value: "online-classes" },
    { label: "Podcasting", value: "podcasting" },
    { label: "Content Creation", value: "content-creation" }
  ];

  const priorities = [
    { label: "Best Price", value: "price" },
    { label: "High Build Quality", value: "quality" },
    { label: "Ease of Use", value: "ease-of-use" },
    { label: "Portability", value: "portability" },
    { label: "Rich Features", value: "features" }
  ];

  let currentOptions = [];
  let currentKey = "";
  if (step === 1) { currentOptions = categories; currentKey = "category"; }
  else if (step === 2) { currentOptions = budgets; currentKey = "budget"; }
  else if (step === 3) { currentOptions = useCases; currentKey = "useCase"; }
  else if (step === 4) { currentOptions = priorities; currentKey = "priority"; }

  const isValid = !!selections[currentKey];

  container.innerHTML = `
    <div class="finder-wizard">
      <div class="step-indicator">
        <div class="step-dot ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}">1</div>
        <div class="step-dot ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}">2</div>
        <div class="step-dot ${step >= 3 ? (step === 3 ? 'active' : 'completed') : ''}">3</div>
        <div class="step-dot ${step >= 4 ? (step === 4 ? 'active' : 'completed') : ''}">4</div>
      </div>

      <h2 style="font-size: 1.35rem; text-align: center; margin-bottom: 0.5rem;">Step ${step} of 4</h2>
      <p style="text-align: center; color: var(--text-muted); margin-bottom: 1.5rem;">${stepTitles[step - 1]}</p>

      <div class="option-grid">
        ${currentOptions.map(opt => `
          <button type="button" class="option-btn ${selections[currentKey] === opt.value ? 'selected' : ''}" 
                  data-key="${currentKey}" data-value="${opt.value}">
            ${opt.label}
          </button>
        `).join('')}
      </div>

      <div class="wizard-actions">
        ${step > 1 ? '<button class="btn btn-secondary" data-action="prev">&larr; Back</button>' : '<div></div>'}
        ${step < 4 
          ? `<button class="btn btn-primary" data-action="next" ${!isValid ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>Next &rarr;</button>`
          : `<button class="btn btn-primary" data-action="submit" ${!isValid ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>Show Results</button>`
        }
      </div>
    </div>
  `;
}

function calculateAndDisplayResults(selections) {
  const container = document.getElementById('finder-wizard-container');
  const products = window.PRODUCTS_DATA || [];

  // Simple scoring mechanism
  const scored = products.map(p => {
    let score = 0;
    if (p.category === selections.category) score += 4;
    if (p.budgets.includes(selections.budget)) score += 3;
    if (p.useCases.includes(selections.useCase)) score += 2;
    if (p.priorities.includes(selections.priority)) score += 1;
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, 3);

  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <div style="display:flex; justify-between; align-items:center; margin-bottom: 1.5rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <h2>Your Top Product Matches</h2>
          <p style="color:var(--text-muted);">Based on your selections</p>
        </div>
        <button class="btn btn-outline" data-action="reset">Start Over</button>
      </div>

      <div class="grid-3">
        ${results.map((item, idx) => {
          const p = item.product;
          const matchLabel = idx === 0 ? "Best Match" : (idx === 1 ? "Alternative" : "Budget Choice");
          return `
            <div class="card product-card">
              <div>
                <div class="product-card-header">
                  <span class="badge badge-match">${matchLabel}</span>
                  <span class="badge badge-demo">${p.badge}</span>
                </div>
                <span class="product-category">${p.category}</span>
                <h3 class="product-title">${p.name}</h3>
                <p class="product-desc">${p.description}</p>
                <ul class="product-features">
                  ${p.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
              </div>
              <div>
                <button class="btn btn-secondary btn-sm" onclick="addToCompare('${p.id}')" style="width:100%;">Compare Product</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* --- COMPARISON PAGE LOGIC --- */
function addToCompare(productId) {
  let compareList = JSON.parse(localStorage.getItem('smartbuy_compare') || '[]');
  if (!compareList.includes(productId)) {
    if (compareList.length >= 3) {
      compareList.shift(); // keep max 3 items
    }
    compareList.push(productId);
    localStorage.setItem('smartbuy_compare', JSON.stringify(compareList));
  }
  window.location.href = 'compare.html';
}

function initComparisonPage() {
  const container = document.getElementById('compare-page-container');
  let compareList = JSON.parse(localStorage.getItem('smartbuy_compare') || '[]');

  // Fill up defaults if empty
  if (compareList.length === 0 && window.PRODUCTS_DATA.length >= 2) {
    compareList = [window.PRODUCTS_DATA[0].id, window.PRODUCTS_DATA[1].id];
  }

  const selectedProducts = window.PRODUCTS_DATA.filter(p => compareList.includes(p.id));

  if (selectedProducts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem 0;">
        <p style="color:var(--text-muted); margin-bottom:1rem;">No products selected for comparison yet.</p>
        <a href="product-finder.html" class="btn btn-primary">Find Products to Compare</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
      <p style="color:var(--text-muted);">Comparing ${selectedProducts.length} of 3 items</p>
      <button class="btn btn-outline btn-sm" id="clear-compare-btn">Clear Comparison</button>
    </div>

    <div class="comparison-wrapper">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Product Details</th>
            ${selectedProducts.map(p => `
              <td>
                <h3 style="font-size:1.1rem; margin-bottom:0.25rem;">${p.name}</h3>
                <span class="badge badge-demo">${p.badge}</span>
                <button onclick="removeCompareItem('${p.id}')" style="background:none; border:none; color:#ef4444; font-size:0.8rem; cursor:pointer; display:block; margin-top:0.5rem;">Remove</button>
              </td>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Category</th>
            ${selectedProducts.map(p => `<td>${p.category.toUpperCase()}</td>`).join('')}
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
            ${selectedProducts.map(p => `<td style="color:#16a34a; font-size:0.9rem;">${p.pros}</td>`).join('')}
          </tr>
          <tr>
            <th>Cons</th>
            ${selectedProducts.map(p => `<td style="color:#dc2626; font-size:0.9rem;">${p.cons}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('clear-compare-btn')?.addEventListener('click', () => {
    localStorage.removeItem('smartbuy_compare');
    initComparisonPage();
  });
}

function removeCompareItem(id) {
  let compareList = JSON.parse(localStorage.getItem('smartbuy_compare') || '[]');
  compareList = compareList.filter(item => item !== id);
  localStorage.setItem('smartbuy_compare', JSON.stringify(compareList));
  initComparisonPage();
}

