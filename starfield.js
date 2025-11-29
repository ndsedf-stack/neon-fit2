window.initStarfield = function() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let stars = [];
  let animationId;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
  }
  
  function createStars() {
    stars = [];
    const starCount = Math.min(300, Math.floor(canvas.width * canvas.height / 4000));
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() > 0.92 ? Math.random() * 2.5 + 1 : Math.random() * 1 + 0.3,
        speed: Math.random() * 0.2 + 0.03,
        opacity: Math.random() * 0.7 + 0.2,
        fade: (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        color: Math.random() > 0.88 ? (Math.random() > 0.5 ? 'cyan' : 'purple') : 'white'
      });
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
      star.y -= star.speed;
      if (star.y < -10) {
        star.y = canvas.height + 10;
        star.x = Math.random() * canvas.width;
      }
      
      star.opacity += star.fade;
      if (star.opacity > 0.95 || star.opacity < 0.1) star.fade *= -1;
      
      ctx.beginPath();
      
      if (star.color === 'cyan') {
        ctx.fillStyle = `rgba(34, 211, 238, ${star.opacity})`;
        if (star.size > 1.5) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#22d3ee';
        }
      } else if (star.color === 'purple') {
        ctx.fillStyle = `rgba(168, 85, 247, ${star.opacity})`;
        if (star.size > 1.5) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#a855f7';
        }
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.8})`;
        if (star.size > 1.8) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ffffff';
        }
      }
      
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  resize();
  animate();
  window.addEventListener('resize', resize);
  
  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  };
};

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('starfield-canvas')) {
    window.initStarfield();
  }
});
