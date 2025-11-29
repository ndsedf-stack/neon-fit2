/**
 * NEON FIT - Scramble Text Effect
 * Effet de décryptage cyberpunk pour les titres et textes importants
 */

const ScrambleEffect = {
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_//[]<>{}',
  
  scramble(element, options = {}) {
    if (!element) return;
    
    const targetText = options.text || element.textContent || '';
    const speed = options.speed || 30;
    const delay = options.delay || 0;
    
    let iteration = 0;
    element.textContent = '';
    
    setTimeout(() => {
      const interval = setInterval(() => {
        element.textContent = targetText
          .split('')
          .map((letter, index) => {
            if (letter === ' ') return ' ';
            if (index < iteration) {
              return targetText[index];
            }
            return this.chars[Math.floor(Math.random() * this.chars.length)];
          })
          .join('');
        
        if (iteration >= targetText.length) {
          clearInterval(interval);
          element.textContent = targetText;
        }
        
        iteration += 1 / 3;
      }, speed);
    }, delay);
  },
  
  scrambleAll(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
      const delayOffset = options.stagger ? index * (options.stagger) : 0;
      this.scramble(el, { ...options, delay: (options.delay || 0) + delayOffset });
    });
  },
  
  init() {
    document.querySelectorAll('[data-scramble]').forEach((el, index) => {
      const speed = parseInt(el.dataset.scrambleSpeed) || 30;
      const delay = parseInt(el.dataset.scrambleDelay) || (index * 100);
      this.scramble(el, { speed, delay });
    });
  }
};

window.ScrambleEffect = ScrambleEffect;
