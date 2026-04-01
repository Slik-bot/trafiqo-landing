const initPricingDrag = () => {
  const track = document.getElementById('pricingTrack');
  if (!track) return;
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  track.addEventListener('mousedown', (e) => {
    isDown = true;
    track.style.cursor = 'grabbing';
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });
  track.addEventListener('mouseup', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });
  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });
};

const initPricingDots = () => {
  const track = document.getElementById('pricingTrack');
  const dots = document.querySelectorAll('.pricing-dot');
  if (!track || !dots.length) return;

  track.addEventListener('scroll', () => {
    const cardWidth = track.querySelector('.pricing-card')?.offsetWidth + 20 || 280;
    const idx = Math.min(
      Math.round(track.scrollLeft / cardWidth),
      dots.length - 1
    );
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }, { passive: true });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const cardWidth = track.querySelector('.pricing-card')?.offsetWidth + 20 || 280;
      track.scrollTo({ left: cardWidth * i, behavior: 'smooth' });
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initPricingDrag();
  initPricingDots();
});
