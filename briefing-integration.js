/**
 * BRIEFING INTEGRATION MODULE
 * Auto-injects briefing buttons and handlers into index.html and workouts.html
 * Usage: Add <script type="module" src="./briefing-integration.js"></script> after app.js
 */

import { Utils } from './app.js';

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
    
    // Find all scan buttons (eye buttons)
    const scanButtons = document.querySelectorAll('.scan-btn');
    console.log(`Found ${scanButtons.length} workout cards`);
    
    scanButtons.forEach((scanBtn, index) => {
      const day = scanBtn.dataset.day;
      
      // Remove ALL existing event listeners by cloning
      const newScanBtn = scanBtn.cloneNode(true);
      scanBtn.parentNode.replaceChild(newScanBtn, scanBtn);
      
      // Add NEW click handler that opens briefing instead of modal
      newScanBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const currentWeek = Utils.getCurrentWeek();
        
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
        
        console.log(`📋 Opening briefing from eye button: Week ${currentWeek}, Day ${day}`);
        
        // Redirect to briefing
        window.location.href = `briefing.html?week=${currentWeek}&day=${day}`;
        
        return false;
      }, true);
      
      console.log(`✅ Redirected eye button for ${day} to briefing.html`);
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
    // Same as index.html - Eye buttons open briefing DIRECTLY
    // CRITICAL: Override buttons BEFORE original listeners attach!
    
    // Try IMMEDIATELY
    setTimeout(() => {
      overrideWorkoutsScanButtons();
    }, 100);
    
    // Try again after 500ms
    setTimeout(() => {
      overrideWorkoutsScanButtons();
    }, 500);
    
    // Final try after 1000ms
    setTimeout(() => {
      overrideWorkoutsScanButtons();
    }, 1000);
  }
}

// Extract to separate function to avoid duplication
function overrideWorkoutsScanButtons() {
  const scanButtons = document.querySelectorAll('.scan-btn');
  if (scanButtons.length === 0) return;
  
  console.log(`🔥 OVERRIDING ${scanButtons.length} workouts scan buttons`);
  
  scanButtons.forEach((btn, index) => {
    const day = btn.dataset.day;
    if (!day) return;
    
    // Check if already overridden
    if (btn.dataset.briefingOverride === 'true') {
      return;
    }
    
    console.log(`🎯 Overriding scan button ${index + 1}: ${day}`);
    
    // Clone to remove ALL listeners
    const newBtn = btn.cloneNode(true);
    newBtn.dataset.briefingOverride = 'true'; // Mark as overridden
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Add NEW listener that opens BRIEFING directly
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const currentWeek = Utils.getCurrentWeek();
      
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      console.log(`📋 FORCE OPEN briefing: Week ${currentWeek}, Day ${day}`);
      
      // IMMEDIATE redirect
      window.location.href = `briefing.html?week=${currentWeek}&day=${day}`;
      
      return false;
    }, true); // Capture phase
  });
  
  console.log('✅ Workouts scan buttons overridden');
}
}

// Start integration when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export default {
  integrateIndexPage
};
