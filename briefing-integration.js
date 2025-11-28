/**
 * BRIEFING INTEGRATION MODULE
 * Auto-injects briefing buttons and handlers into index.html and workouts.html
 * Usage: Add <script src="./briefing-integration.js"></script> after app.js
 */

// Utils is available globally from app.js
const Utils = window.Utils || {
  getCurrentWeek: () => {
    const weekKey = localStorage.getItem('currentWeek') || localStorage.getItem('hybrid_current_week');
    return weekKey ? parseInt(weekKey) : 1;
  }
};

console.log('🚀 Briefing Integration Module loaded');

// ========================================
// UTILITY FUNCTIONS
// ========================================

function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found after ${timeout}ms`));
    }, timeout);
  });
}

// ========================================
// INDEX.HTML INTEGRATION
// ========================================

async function integrateIndexPage() {
  console.log('📄 Integrating briefing buttons into index.html...');
  
  try {
    // Wait for workout cards to be rendered
    await waitForElement('.scan-btn');
    
    // Find all workout cards (parents of scan buttons)
    const cards = document.querySelectorAll('.workout-card');
    console.log(`Found ${cards.length} workout cards`);
    
    // DISABLE card onclick entirely
    cards.forEach(card => {
      card.onclick = null;
      card.style.cursor = 'default';
    });
    
    // Find all scan buttons (eye buttons)
    const scanButtons = document.querySelectorAll('.scan-btn');
    
    scanButtons.forEach((scanBtn, index) => {
      const day = scanBtn.dataset.day;
      
      // Remove ALL existing event listeners by cloning
      const newScanBtn = scanBtn.cloneNode(true);
      scanBtn.parentNode.replaceChild(newScanBtn, scanBtn);
      
      // Make clickable
      newScanBtn.style.cursor = 'pointer';
      newScanBtn.style.pointerEvents = 'auto';
      
      // Add NEW click handler that opens briefing
      newScanBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const currentWeek = Utils.getCurrentWeek();
        
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
        
        console.log(`📋 Opening briefing: Week ${currentWeek}, Day ${day}`);
        
        // Redirect to briefing
        window.location.href = `briefing.html?week=${currentWeek}&day=${day}`;
        
        return false;
      }, true);
      
      console.log(`✅ Redirected eye button for ${day}`);
    });
    
    // Re-init Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    console.log('✨ Index.html integration complete');
  } catch (error) {
    console.error('❌ Error integrating index.html:', error);
  }
}

// ========================================
// WORKOUTS.HTML INTEGRATION
// ========================================

async function integrateWorkoutsPage() {
  console.log('🔥 OVERRIDING WORKOUTS SCAN BUTTONS');
  
  try {
    await waitForElement('.scan-btn');
    
    const scanButtons = document.querySelectorAll('.scan-btn');
    console.log(`🔍 Found ${scanButtons.length} scan buttons`);
    
    scanButtons.forEach((btn, index) => {
      const day = btn.dataset.day;
      if (!day) return;
      
      console.log(`🎯 Overriding scan button ${index + 1}: ${day}`);
      
      // Clone to remove ALL listeners
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Add NEW listener - OPEN BRIEFING DIRECTLY
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const currentWeek = Utils.getCurrentWeek();
        
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
        
        console.log(`📋 Opening briefing DIRECT: Week ${currentWeek}, Day ${day}`);
        
        // Redirect to briefing DIRECTLY - NO MODAL
        window.location.href = `briefing.html?week=${currentWeek}&day=${day}`;
        
        return false;
      }, true);
    });
    
    console.log('✅ All workouts scan buttons overridden');
    
  } catch (error) {
    console.error('❌ Error integrating workouts.html:', error);
  }
}

// ========================================
// AUTO-DETECT PAGE AND INTEGRATE
// ========================================

function init() {
  const path = window.location.pathname;
  console.log(`🔍 Current page: ${path}`);
  
  // Detect which page we're on
  if (path.includes('index.html') || path === '/' || path === '' || path.endsWith('/')) {
    // Index page - wait for cards to be rendered
    setTimeout(() => {
      integrateIndexPage();
    }, 1500); // Wait for workout cards to be dynamically created
  } 
  else if (path.includes('workouts.html')) {
    // Workouts page - override scan buttons
    setTimeout(() => {
      integrateWorkoutsPage();
    }, 1500);
  }
}

// Start integration when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Make functions available globally (optional)
window.briefingIntegration = {
  integrateIndexPage,
  integrateWorkoutsPage
};
