/**
 * BRIEFING INTEGRATION MODULE
 * Auto-injects briefing buttons and handlers into index.html and workouts.html
 * Usage: Add <script type="module" src="./briefing-integration.js"></script> after app.js
 */

// Utils is available globally from app.js
const Utils = window.Utils || {
  getCurrentWeek: () => {
    const weekKey = localStorage.getItem('currentWeek');
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
// WORKOUTS.HTML INTEGRATION
// ========================================

async function integrateWorkoutsPage() {
  console.log('📄 Integrating briefing button into workouts.html modal...');
  
  try {
    // Wait for modal start button
    await waitForElement('#modal-start-btn');
    
    const startBtn = document.getElementById('modal-start-btn');
    const modal = document.getElementById('details-modal');
    
    // Check if briefing button already exists
    if (document.getElementById('modal-briefing-btn')) {
      console.log('⚠️ Modal briefing button already exists');
      return;
    }
    
    // Create briefing button
    const briefingBtn = document.createElement('button');
    briefingBtn.id = 'modal-briefing-btn';
    briefingBtn.className = 'flex-1 py-4 bg-gradient-to-r from-[var(--cyan)]/20 to-purple-500/20 border-2 border-[var(--cyan)]/40 text-[var(--cyan)] font-black font-hud text-sm uppercase rounded-xl shadow-[0_0_20px_rgba(0,234,255,0.2)] touch-pop hover:border-[var(--cyan)] transition-all flex items-center justify-center gap-2';
    briefingBtn.innerHTML = `
      <i data-lucide="file-text" class="w-5 h-5"></i>
      <span>BRIEFING</span>
    `;
    
    // Add CSS for hover effect
    const style = document.createElement('style');
    style.textContent = `
      #modal-briefing-btn:hover {
        background: linear-gradient(135deg, rgba(0, 217, 255, 0.3), rgba(168, 85, 247, 0.3));
        border-color: rgba(0, 217, 255, 0.6);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 217, 255, 0.4);
      }
      
      #modal-briefing-btn:active {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
    
    // Wrap buttons in flex container
    const btnContainer = startBtn.parentNode;
    if (!btnContainer.classList.contains('flex')) {
      btnContainer.className = 'flex gap-3 mt-6';
    }
    
    // Update start button to flex-1
    startBtn.className = startBtn.className.replace('w-full', 'flex-1');
    startBtn.innerHTML = `
      <i data-lucide="zap" class="w-5 h-5 inline-block mr-1"></i>
      START
    `;
    
    // Insert briefing button before start button
    btnContainer.insertBefore(briefingBtn, startBtn);
    
    // Add event listener
    briefingBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Get week from Utils
      let weekNum = 1;
      try {
        weekNum = Utils.getCurrentWeek();
      } catch (e) {
        weekNum = 1;
      }
      
      // Get day from GLOBAL variable
      const dayKey = window.CURRENT_BRIEFING_DAY || 'dimanche';
      
      console.log(`📋 BRIEFING CLICKED!`);
      console.log(`   Week: ${weekNum}`);
      console.log(`   Day: ${dayKey}`);
      console.log(`   Global day: ${window.CURRENT_BRIEFING_DAY}`);
      
      // Vibration feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      // Close modal
      modal.classList.remove('open');
      
      // FORCE redirect
      const url = `briefing.html?week=${weekNum}&day=${dayKey}`;
      console.log(`   Redirecting to: ${url}`);
      
      setTimeout(() => {
        window.location.href = url;
      }, 100);
    });
    
    // Re-init Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    console.log('✅ Modal briefing button added');
    console.log('✨ Workouts.html integration complete');
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
    // NUCLEAR OPTION: Wait for page load, then OVERRIDE EVERYTHING
    
    setTimeout(() => {
      console.log('🔥 NUCLEAR INTEGRATION START');
      
      // Step 1: Integrate modal button
      integrateWorkoutsPage();
      
      // Step 2: OVERRIDE all scan buttons
      setTimeout(() => {
        const scanButtons = document.querySelectorAll('.scan-btn');
        console.log(`🔍 Found ${scanButtons.length} scan buttons - OVERRIDING ALL`);
        
        // Store current day globally
        window.CURRENT_BRIEFING_DAY = 'dimanche';
        
        scanButtons.forEach((btn, index) => {
          const day = btn.dataset.day;
          if (!day) return;
          
          console.log(`🎯 Overriding scan button ${index + 1}: ${day}`);
          
          // Clone to remove ALL listeners
          const newBtn = btn.cloneNode(true);
          btn.parentNode.replaceChild(newBtn, btn);
          
          // Add NEW listener
          newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Store day globally
            window.CURRENT_BRIEFING_DAY = day;
            console.log(`💾 Stored global day: ${day}`);
            
            // Call modal function
            if (typeof openDetails === 'function') {
              openDetails(day);
            } else {
              console.error('❌ openDetails function not found!');
            }
          }, true); // Capture phase
        });
        
        console.log('✅ All scan buttons overridden');
      }, 500);
      
    }, 1500); // Wait 1.5s for page to fully load
    
    // Also listen for modal opens
    waitForElement('#details-modal').then((modal) => {
      const observer = new MutationObserver(() => {
        if (modal.classList.contains('open')) {
          setTimeout(() => {
            if (!document.getElementById('modal-briefing-btn')) {
              integrateWorkoutsPage();
            }
          }, 100);
        }
      });
      
      observer.observe(modal, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
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

// Start integration when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export default {
  integrateIndexPage,
  integrateWorkoutsPage
};
