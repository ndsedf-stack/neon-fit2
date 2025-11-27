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

function addBriefingButton(parentElement, day, position = 'before') {
  const briefingBtn = document.createElement('button');
  briefingBtn.className = 'briefing-btn w-10 h-10 rounded-full bg-black/30 border border-[var(--cyan)]/40 flex items-center justify-center backdrop-blur-md hover:bg-[var(--cyan)] hover:text-black transition-colors shadow-lg touch-pop';
  briefingBtn.dataset.day = day;
  briefingBtn.innerHTML = '<i data-lucide="file-text" class="w-5 h-5 pointer-events-none"></i>';
  
  // Add event listener
  briefingBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentWeek = Utils.getCurrentWeek();
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    console.log(`📋 Opening briefing: Week ${currentWeek}, Day ${day}`);
    window.location.href = `briefing.html?week=${currentWeek}&day=${day}`;
  });
  
  // Insert button
  if (position === 'before') {
    parentElement.parentNode.insertBefore(briefingBtn, parentElement);
  } else {
    parentElement.parentNode.insertBefore(briefingBtn, parentElement.nextSibling);
  }
  
  // Re-init Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  return briefingBtn;
}

// ========================================
// INDEX.HTML INTEGRATION
// ========================================

async function integrateIndexPage() {
  console.log('📄 Integrating briefing buttons into index.html...');
  
  try {
    // Wait for workout cards to be rendered
    await waitForElement('.scan-btn');
    
    // Find all scan buttons (details buttons)
    const scanButtons = document.querySelectorAll('.scan-btn');
    console.log(`Found ${scanButtons.length} workout cards`);
    
    scanButtons.forEach((scanBtn, index) => {
      const day = scanBtn.dataset.day;
      
      // Check if briefing button already exists
      const existingBriefingBtn = scanBtn.parentNode.querySelector('.briefing-btn');
      if (existingBriefingBtn) {
        console.log(`⚠️ Briefing button already exists for ${day}`);
        return;
      }
      
      // Wrap buttons in flex container if not already
      if (!scanBtn.parentNode.classList.contains('flex')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex gap-2 z-20';
        scanBtn.parentNode.insertBefore(wrapper, scanBtn);
        wrapper.appendChild(scanBtn);
      }
      
      // Add briefing button before scan button
      addBriefingButton(scanBtn, day, 'before');
      console.log(`✅ Added briefing button for ${day}`);
    });
    
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
    
    // Add event listener - use global variables from workouts.html
    briefingBtn.addEventListener('click', function() {
      // Try to get current week/day from various sources
      let weekNum = 1;
      let dayKey = 'day1';
      
      // Method 1: From Utils
      try {
        weekNum = Utils.getCurrentWeek();
      } catch (e) {
        console.warn('Could not get week from Utils');
      }
      
      // Method 2: From modal title/subtitle
      const modalTitle = document.getElementById('modal-title');
      if (modalTitle) {
        const titleText = modalTitle.textContent.toLowerCase();
        if (titleText.includes('dimanche')) dayKey = 'day1';
        else if (titleText.includes('mardi')) dayKey = 'day2';
        else if (titleText.includes('vendredi')) dayKey = 'day3';
        else if (titleText.includes('maison')) dayKey = 'day4';
      }
      
      // Method 3: From active workout card
      const activeCard = document.querySelector('.workout-card.active');
      if (activeCard && activeCard.dataset.day) {
        dayKey = activeCard.dataset.day;
      }
      
      // Method 4: From URL params (if coming from index)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('week')) weekNum = parseInt(urlParams.get('week'));
      if (urlParams.get('day')) dayKey = urlParams.get('day');
      
      console.log(`📋 Opening briefing from modal: Week ${weekNum}, Day ${dayKey}`);
      
      // Vibration feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      // Close modal
      modal.classList.remove('open');
      
      // Redirect to briefing
      window.location.href = `briefing.html?week=${weekNum}&day=${dayKey}`;
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
  if (path.includes('index.html') || path === '/' || path === '') {
    // Index page - wait for cards to be rendered
    setTimeout(() => {
      integrateIndexPage();
    }, 1500); // Wait for workout cards to be dynamically created
  } 
  else if (path.includes('workouts.html')) {
    // Workouts page - wait for modal to be available
    setTimeout(() => {
      integrateWorkoutsPage();
    }, 1000);
    
    // Also listen for modal opens to re-inject button if needed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.classList && mutation.target.classList.contains('open')) {
          // Modal opened - check if button exists
          setTimeout(() => {
            if (!document.getElementById('modal-briefing-btn')) {
              integrateWorkoutsPage();
            }
          }, 100);
        }
      });
    });
    
    waitForElement('#details-modal').then((modal) => {
      observer.observe(modal, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  }
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
