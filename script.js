// ====== DATA UTAMA (ubah di sini jika perlu) ======
const BIRTH_DATE = new Date(2006, 6, 17); // 17 Juli 2006 (bulan mulai dari 0)
// ===================================================

const sections = Array.from(document.querySelectorAll('.sec'));
let currentIndex = 0;
let navLocked = false;

const NAME_GATE_INDEX = sections.findIndex(function (s) { return s.id === 'sec-name'; });
let nameVerified = false;

const TAP_ADVANCE_IDS = new Set(['sec-welcome', 'sec-birthday', 'sec-photos', 'sec-letter', 'sec-ending']);

const dotsNav = document.getElementById('dotsNav');
sections.forEach((sec, i) => {
  const d = document.createElement('div');
  d.className = 'dnav' + (i === 0 ? ' active' : '');
  d.addEventListener('click', () => {
    if (NAME_GATE_INDEX !== -1 && !nameVerified && i > NAME_GATE_INDEX) return;
    goToIndex(i);
  });
  dotsNav.appendChild(d);
});
const dotEls = Array.from(dotsNav.children);

function goToSection(id) {
  const idx = sections.findIndex(function (s) { return s.id === id; });
  if (idx !== -1) goToIndex(idx);
}

function goToIndex(idx) {
  if (idx < 0 || idx >= sections.length || navLocked) return;
  navLocked = true;
  currentIndex = idx;
  sections.forEach((sec, i) => {
    sec.classList.remove('is-active', 'is-prev');
    if (i === idx) sec.classList.add('is-active');
    else if (i < idx) sec.classList.add('is-prev');
  });
  dotEls.forEach((d, i) => d.classList.toggle('active', i === idx));
  onSectionEnter(sections[idx].id);
  setTimeout(() => { navLocked = false; }, 600);
}

document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', () => goToIndex(currentIndex + 1));
});

document.body.addEventListener('click', (e) => {
  const current = sections[currentIndex];
  if (!current || navLocked) return;

  if (e.target.closest('button, input, .dots-nav, #giftBox, .carousel, #starsCanvas')) {
    if (current.id === 'sec-gift' && giftOpened && !e.target.closest('#giftBox')) {
      goToIndex(currentIndex + 1);
    }
    return;
  }

  if (current.id === 'sec-gift') {
    if (giftOpened) goToIndex(currentIndex + 1);
    return;
  }

  if (TAP_ADVANCE_IDS.has(current.id)) {
    goToIndex(currentIndex + 1);
  }
});

goToIndex(0);
navLocked = false;

// ---------- Loading ----------
let loadingDone = false;
function runLoading() {
  const fill = document.getElementById('loadingFill');
  const pct = document.getElementById('loadingPct');
  let p = 0;
  const timer = setInterval(() => {
    p += Math.random() * 12 + 6;
    if (p >= 100) {
      p = 100;
      clearInterval(timer);
      loadingDone = true;
      setTimeout(() => goToSection('sec-welcome'), 500);
    }
    fill.style.width = p + '%';
    pct.textContent = Math.floor(p) + '%';
  }, 180);
}

// ---------- Nama pengunjung ----------
let visitorName = '';
const VALID_NAMES = ['alvina', 'alvina widianti', 'vina', 'alfina'];

function normalizeName(str) {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

document.getElementById('nameNextBtn').addEventListener('click', () => {
  const nameInputEl = document.getElementById('nameInput');
  const nameErrorEl = document.getElementById('nameError');
  const val = nameInputEl.value;
  const normalized = normalizeName(val);

  if (!normalized || !VALID_NAMES.includes(normalized)) {
    nameErrorEl.classList.add('show');
    nameInputEl.classList.remove('shake');
    void nameInputEl.offsetWidth; // restart animation
    nameInputEl.classList.add('shake');
    return;
  }

  nameErrorEl.classList.remove('show');
  nameVerified = true;
  visitorName = val.trim();
  document.getElementById('letterSalutation').textContent = `Untuk ${visitorName},`;
  document.getElementById('finishText').textContent = `Terima kasih sudah membaca sampai akhir, ${visitorName}.`;
  goToSection('sec-birthday');
});

document.getElementById('nameInput').addEventListener('input', () => {
  document.getElementById('nameError').classList.remove('show');
});

// ---------- Umur berjalan naik ----------
function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const targetAge = calculateAge(BIRTH_DATE);
let ageAnimated = false;

function animateAge(target) {
  const el = document.getElementById('ageNumber');
  const duration = 1600;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }
  requestAnimationFrame(tick);
}

// ---------- Countdown ke ulang tahun berikutnya ----------
function getNextBirthday(birthDate) {
  const today = new Date();
  let next = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (next < today) {
    next = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  }
  return next;
}

function updateCountdown() {
  const next = getNextBirthday(BIRTH_DATE);
  const now = new Date();
  const diff = next - now;

  if (diff <= 0) {
    document.getElementById('countdownGrid').innerHTML =
      '<div class="countdown-done">Selamat merayakan hari ini! 🎉</div>';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById('cdDays').textContent = String(days).padStart(2, '0');
  document.getElementById('cdHours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cdMinutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('cdSeconds').textContent = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- Gift box ----------
const giftBox = document.getElementById('giftBox');
const giftReveal = document.getElementById('giftReveal');
const giftHint = document.getElementById('giftHint');
let giftOpened = false;

giftBox.addEventListener('click', () => {
  if (giftOpened) return;
  giftOpened = true;
  giftBox.classList.add('open');
  giftHint.style.opacity = '0';
  setTimeout(() => giftReveal.classList.add('show'), 300);
});

// ---------- Carousel foto (auto-play bergantian) ----------
const track = document.getElementById('carouselTrack');
const dotsWrap = document.getElementById('carouselDots');
const slides = track ? track.querySelectorAll('.carousel-slide') : [];
let currentSlide = 0;
let carouselTimer = null;

function buildDots() {
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
}

function goToSlide(index) {
  currentSlide = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

function nextSlide() {
  const next = (currentSlide + 1) % slides.length;
  goToSlide(next);
}

function startCarousel() {
  if (carouselTimer) return;
  carouselTimer = setInterval(nextSlide, 3500);
}

if (slides.length > 0) buildDots();

// ---------- Musik latar (autoplay dengan fallback) ----------
const bgMusic = document.getElementById('bgMusic');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');
let musicPlaying = false;

function updateSoundIcon() {
  soundIcon.textContent = musicPlaying ? '🔊' : '🔇';
}

function tryAutoplay() {
  bgMusic.volume = 0.5;
  const playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => { musicPlaying = true; updateSoundIcon(); })
      .catch(() => {
        musicPlaying = false;
        updateSoundIcon();
        const resumeOnInteract = () => {
          bgMusic.play().then(() => { musicPlaying = true; updateSoundIcon(); }).catch(() => {});
          document.removeEventListener('click', resumeOnInteract);
        };
        document.addEventListener('click', resumeOnInteract, { once: true });
      });
  }
}

soundToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
  } else {
    bgMusic.play().then(() => { musicPlaying = true; }).catch(() => {});
  }
  updateSoundIcon();
});

// ---------- Stars canvas ----------
const starsCanvas = document.getElementById('starsCanvas');
const starsCtx = starsCanvas.getContext('2d');
let starsList = [];
let starsInit = false;

function resizeStarsCanvas() {
  starsCanvas.width = window.innerWidth;
  starsCanvas.height = window.innerHeight;
}

function seedStars() {
  starsList = [];
  for (let i = 0; i < 80; i++) {
    starsList.push({
      x: Math.random() * starsCanvas.width,
      y: Math.random() * starsCanvas.height,
      r: Math.random() * 1.4 + 0.4,
      a: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
      wish: false
    });
  }
}

function drawStars() {
  starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
  starsList.forEach(s => {
    s.a += s.speed;
    const alpha = 0.4 + Math.abs(Math.sin(s.a)) * 0.6;
    starsCtx.beginPath();
    starsCtx.arc(s.x, s.y, s.wish ? s.r * 2.2 : s.r, 0, Math.PI * 2);
    starsCtx.fillStyle = s.wish
      ? `rgba(241,208,120,${alpha})`
      : `rgba(239,230,207,${alpha * 0.8})`;
    starsCtx.fill();
  });
  requestAnimationFrame(drawStars);
}

starsCanvas.addEventListener('click', (e) => {
  starsList.push({
    x: e.clientX,
    y: e.clientY,
    r: 2,
    a: Math.random(),
    speed: 0.03,
    wish: true
  });
});

window.addEventListener('resize', resizeStarsCanvas);

document.getElementById('starsNextBtn').addEventListener('click', () => {
  goToIndex(currentIndex + 1);
});

// ---------- Replay ----------
document.getElementById('replayBtn').addEventListener('click', () => {
  goToSection('sec-welcome');
});

// ---------- Sparkle ambient effect (global, subtle) ----------
function createSparkle() {
  const s = document.createElement('div');
  s.className = 'sparkle';
  s.style.left = Math.random() * 100 + 'vw';
  s.style.animationDuration = (6 + Math.random() * 6) + 's';
  s.style.bottom = '-10px';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 13000);
}
setInterval(createSparkle, 1400);

// ---------- Section enter triggers ----------
function onSectionEnter(id) {
  if (id === 'sec-birthday' && !ageAnimated) {
    ageAnimated = true;
    animateAge(targetAge);
  }
  if (id === 'sec-photos') {
    startCarousel();
  }
  if (id === 'sec-stars' && !starsInit) {
    starsInit = true;
    resizeStarsCanvas();
    seedStars();
    drawStars();
  }
}

// ---------- Init ----------
window.addEventListener('load', () => {
  tryAutoplay();
  runLoading();
});
