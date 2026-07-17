/**
 * ============================================================
 *  app.js — Logique principale du mini site romantique
 *  Auteur   : Développeur Front-End Senior
 *  Structure : Modules IIFE organisés par fonctionnalité
 * ============================================================
 */

'use strict';

/* ============================================================
   ⚙️  CONFIGURATION — MODIFIE CES VALEURS
   ============================================================ */
const CONFIG = {
  /* Date de début de la relation (YYYY, MM-1, DD) — mois 0-indexé */
  TOGETHER_SINCE: new Date(2020, 5, 6), // 6 juin 2020 — 6 ans ensemble ❤️

  /* Prénom de ta copine (affiché dans le certificat) */
  GIRLFRIEND_NAME: 'Ma Micky ',

  /* Ton prénom (signature du certificat) */
  YOUR_NAME: 'Ton Amoureux',

  /* Durée du splash screen en ms */
  SPLASH_DURATION: 3000,

  /* Message machine à écrire — \n pour un saut de ligne */
  LOVE_MESSAGE: `Certaines personnes passent leur vie\nà chercher une relation paisible.\n\nMoi, j'ai la chance de partager la mienne avec toi.\n\nMerci de choisir chaque jour\nla communication plutôt que la colère.\nMerci pour ta patience.\nMerci pour ton amour.\nMerci d'être toi.\n\nJe t'aime ❤️`,
};

/* ============================================================
   UTILITAIRES
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Génère un nombre aléatoire entre min et max
 */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Attend n millisecondes (Promise)
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ============================================================
   MODULE : CANVAS DE PARTICULES (Cœurs, Pétales, Étoiles)
   ============================================================ */
const ParticleSystem = (() => {
  const canvas = $('#particles-canvas');
  const ctx = canvas?.getContext('2d');
  let particles = [];
  let animFrameId = null;
  let active = false;

  // Types de particules
  const TYPES = ['❤️', '💕', '🌸', '✨', '⭐', '💫'];

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x = rand(0, window.innerWidth);
      this.y = window.innerHeight + rand(10, 80);
      this.size = rand(10, 22);
      this.speedX = rand(-0.6, 0.6);
      this.speedY = rand(-0.5, -1.2);
      this.opacity = rand(0.3, 0.7);
      this.type = TYPES[Math.floor(rand(0, TYPES.length))];
      this.wobble = rand(0, Math.PI * 2);
      this.wobbleSpeed = rand(0.02, 0.05);
      this.life = 0;
    }

    update() {
      this.life++;
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.3;
      this.y += this.speedY;
      if (this.y < -40) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.font = `${this.size}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(this.type, this.x, this.y);
      ctx.restore();
    }
  }

  function resize() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function loop() {
    if (!active || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animFrameId = requestAnimationFrame(loop);
  }

  function init(count = 18) {
    if (!canvas) return;
    resize();
    particles = Array.from({ length: count }, () => {
      const p = new Particle();
      p.y = rand(-50, window.innerHeight); // Distribution initiale
      return p;
    });
    active = true;
    loop();
    window.addEventListener('resize', resize);
  }

  function stop() {
    active = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
  }

  return { init, stop };
})();

/* ============================================================
   MODULE : SPLASH SCREEN
   ============================================================ */
const Splash = (() => {
  const el = $('#splash-screen');
  const fill = $('#progress-fill');
  const heartsContainer = el?.querySelector('.splash-hearts-container');

  /** Génère des mini cœurs flottants dans le splash */
  function createFloatingHearts(count = 12) {
    if (!heartsContainer) return;
    const emojis = ['❤️', '💕', '💗', '💖', '🌸', '✨'];

    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'splash-float-heart';
      h.textContent = emojis[Math.floor(rand(0, emojis.length))];
      h.style.cssText = `
        left: ${rand(2, 95)}%;
        font-size: ${rand(12, 26)}px;
        animation-duration: ${rand(5, 10)}s;
        animation-delay: ${rand(0, 6)}s;
      `;
      heartsContainer.appendChild(h);
    }
  }

  /** Anime la barre de progression */
  function animateProgress(duration, onComplete) {
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      if (fill) fill.style.width = pct + '%';
      if (pct < 100) {
        requestAnimationFrame(step);
      } else {
        onComplete?.();
      }
    }

    requestAnimationFrame(step);
  }

  async function run(onDone) {
    createFloatingHearts();
    animateProgress(CONFIG.SPLASH_DURATION, async () => {
      await sleep(200);
      el?.classList.add('fade-out');
      await sleep(800);
      el?.style.setProperty('display', 'none');
      onDone?.();
    });
  }

  return { run };
})();

/* ============================================================
   MODULE : HOME SCREEN
   ============================================================ */
const HomeScreen = (() => {
  const el = $('#home-screen');
  const btn = $('#cta-button');
  const confettiContainer = $('#confetti-container');

  /** Effet ripple sur le bouton */
  function addRipple(e) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
    `;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  /** Lance les confettis */
  function launchConfetti() {
    if (!confettiContainer) return;
    confettiContainer.innerHTML = '';
    const colors = [
      '#FF5D8F', '#E63973', '#FFD166', '#FF8FAB',
      '#FFB6C1', '#FFF7F8', '#C9973C', '#FF6B9D',
    ];

    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';

      const color = colors[Math.floor(rand(0, colors.length))];
      const size  = rand(6, 14);
      const left  = rand(5, 95);
      const dur   = rand(1.5, 3.2);
      const delay = rand(0, 0.8);
      const shape = Math.random() > 0.4 ? '50%' : '2px';

      piece.style.cssText = `
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape};
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
      `;
      confettiContainer.appendChild(piece);
    }
  }

  function show(onDone) {
    el?.classList.remove('hidden');
    // Petit délai pour la transition CSS
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el?.style.setProperty('opacity', '1');
      });
    });

    btn?.addEventListener('click', async (e) => {
      addRipple(e);
      launchConfetti();
      // Démarrage musique après geste utilisateur
      MusicPlayer.start();
      btn.disabled = true;
      btn.style.transform = 'scale(0.95)';
      await sleep(400);
      btn.style.transform = '';
      await sleep(1200);
      el?.classList.add('fade-out');
      await sleep(800);
      el?.style.setProperty('display', 'none');
      onDone?.();
    }, { once: true });
  }

  return { show };
})();

/* ============================================================
   MODULE : MACHINE À ÉCRIRE (Typewriter)
   ============================================================ */
const Typewriter = (() => {
  let isRunning = false;
  let abortController = null;

  async function type(targetEl, text, speed = 38) {
    if (!targetEl || isRunning) return;
    isRunning = true;
    abortController = new AbortController();
    const signal = abortController.signal;

    targetEl.textContent = '';

    for (const char of text) {
      if (signal.aborted) break;
      targetEl.textContent += char;
      await sleep(char === '\n' ? speed * 3 : speed);
    }
    isRunning = false;
  }

  function abort() {
    abortController?.abort();
    isRunning = false;
  }

  return { type, abort };
})();

/* ============================================================
   MODULE : COMPTEUR ANIMÉ
   ============================================================ */
const Counter = (() => {
  function animateValue(el, from, to, duration = 1500) {
    if (!el) return;
    const data = el.dataset;
    if (data.target === 'infinity') return; // Valeur déjà affichée

    const suffix = data.suffix || '';
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function animateOnFlip(card) {
    const valueEl = card.querySelector('.stat-card__value');
    if (!valueEl || valueEl.dataset.animated) return;
    valueEl.dataset.animated = 'true';
    const target = parseInt(valueEl.dataset.target, 10);
    if (!isNaN(target)) animateValue(valueEl, 0, target);
  }

  // Garde l'ancienne observe pour compatibilite (ne plus utiliser)
  function observe() {}

  return { observe, animateOnFlip };})();

/* ============================================================
   MODULE : COMPTEUR JOURS ENSEMBLE
   ============================================================ */
const TogetherCounter = (() => {
  function render() {
    const el = $('#days-together');
    if (!el) return;

    const now    = new Date();
    const diff   = Math.floor((now - CONFIG.TOGETHER_SINCE) / (1000 * 60 * 60 * 24));
    const days   = Math.max(0, diff);

    // Animation de comptage
    let current = 0;
    const duration = 2000;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(days * eased);
      el.textContent = current.toLocaleString('fr-FR');
      if (progress < 1) requestAnimationFrame(step);
    }

    // Déclencher au scroll
    const section = $('.together-section');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (section) observer.observe(section);
  }

  return { render };
})();

/* ============================================================
   MODULE : CERTIFICAT
   ============================================================ */
const Certificate = (() => {
  function setDate() {
    const el = $('#cert-date-display');
    if (!el) return;

    const now = new Date();
    const opts = { day: 'numeric', month: 'long', year: 'numeric' };
    el.textContent = now.toLocaleDateString('fr-FR', opts);
  }

  function setName() {
    const el = $('#cert-recipient-name');
    if (el) el.textContent = CONFIG.GIRLFRIEND_NAME;

    const sig = $('.cert-signature__text');
    if (sig) sig.textContent = CONFIG.YOUR_NAME;
  }

  async function download() {
    const btn = $('#download-cert-btn');
    const cert = $('#certificate');
    if (!btn || !cert) return;

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span aria-hidden="true">⏳</span> Génération en cours...';

    try {
      const canvas = await html2canvas(cert, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFEF8',
        logging: false,
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // Calcul des dimensions pour centrer l'image
      const ratio   = canvas.width / canvas.height;
      const pdfW    = pageW - 20;
      const pdfH    = pdfW / ratio;
      const offsetY = (pageH - pdfH) / 2;

      pdf.addImage(imgData, 'PNG', 10, offsetY, pdfW, pdfH);
      pdf.save('certificat-notre-mois.pdf');
      btn.innerHTML = '<span aria-hidden="true"></span> Téléchargé !';
    } catch (err) {
      console.error('Erreur PDF :', err);
      btn.innerHTML = '<span aria-hidden="true">❌</span> Erreur, réessaie';
    }

    await sleep(2500);
    btn.innerHTML = originalText;
    btn.disabled = false;
  }

  function init() {
    setDate();
    setName();
    $('#download-cert-btn')?.addEventListener('click', download);
  }

  return { init };
})();

/* ============================================================
   MODULE : LETTRE D'AMOUR
   ============================================================ */
const LoveLetter = (() => {
  let opened = false;

  async function open() {
    if (opened) return;
    opened = true;

    const container = $('#letter-container');
    const envelope  = $('#envelope');
    const letter    = $('#letter');
    const btn       = $('#open-letter-btn');

    if (!container || !envelope || !letter) return;

    btn.setAttribute('aria-expanded', 'true');

    // Afficher le conteneur
    container.classList.remove('hidden');
    await sleep(100);

    // Ouvrir l'enveloppe (flap se lève)
    envelope.classList.add('open');
    await sleep(500);

    // Faire glisser la lettre physiquement hors de l'enveloppe
    letter.classList.add('visible');
    await sleep(400);

    // On laisse l'enveloppe visible en arrière-plan !
  }

  function init() {
    $('#open-letter-btn')?.addEventListener('click', open);
  }

  return { init };
})();

/* ============================================================
   MODULE : LECTEUR AUDIO
   ============================================================ */
const MusicPlayer = (() => {
  const player    = $('#music-player');
  const audio     = $('#audio-player');
  const playBtn   = $('#play-pause-btn');
  const muteBtn   = $('#mute-btn');
  const volSlider = $('#volume-slider');
  const toggleBtn = $('#toggle-player-btn');
  const playerBody = $('#player-body');
  const bars = $$('.bar');

  let isPlaying = false;
  let isMuted   = false;

  /* Icônes SVG inline pour l'état du lecteur */
  const SVG_PLAY  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  const SVG_PAUSE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  const SVG_VOL_ON  = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
  const SVG_VOL_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

  function updatePlayUI() {
    if (!playBtn) return;
    playBtn.innerHTML = isPlaying ? SVG_PAUSE : SVG_PLAY;
    playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Lecture');
    bars.forEach(b => b.classList.toggle('playing', isPlaying));
  }

  function play() {
    if (!audio) return;
    audio.volume = parseFloat(volSlider?.value || '0.7');
    audio.play().then(() => {
      isPlaying = true;
      updatePlayUI();
    }).catch(() => {
      // Autoplay bloqué — l'utilisateur doit interagir d'abord
      console.info('Lecture audio en attente d\'une interaction utilisateur.');
    });
  }

  function pause() {
    audio?.pause();
    isPlaying = false;
    updatePlayUI();
  }

  function togglePlay() {
    isPlaying ? pause() : play();
  }

  function toggleMute() {
    if (!audio || !muteBtn) return;
    isMuted = !isMuted;
    audio.muted = isMuted;
    muteBtn.innerHTML = isMuted ? SVG_VOL_OFF : SVG_VOL_ON;
    muteBtn.setAttribute('aria-label', isMuted ? 'Rétablir le son' : 'Couper le son');
  }

  function toggleCollapse() {
    const isCollapsed = playerBody?.style.display === 'none';
    if (playerBody) playerBody.style.display = isCollapsed ? '' : 'none';
    toggleBtn?.classList.toggle('collapsed', !isCollapsed);
    toggleBtn?.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
    toggleBtn?.setAttribute('aria-label', isCollapsed ? 'Réduire' : 'Agrandir');
  }

  function show() {
    player?.classList.remove('hidden');
  }

  function start() {
    show();
    play();
  }

  function init() {
    playBtn?.addEventListener('click', togglePlay);
    muteBtn?.addEventListener('click', toggleMute);
    toggleBtn?.addEventListener('click', toggleCollapse);

    volSlider?.addEventListener('input', () => {
      if (audio) audio.volume = parseFloat(volSlider.value);
      if (isMuted && parseFloat(volSlider.value) > 0) {
        isMuted = false;
        if (audio) audio.muted = false;
        if (muteBtn) muteBtn.innerHTML = SVG_VOL_ON;
      }
    });

    // Keyboard accessibility
    [playBtn, muteBtn, toggleBtn].forEach(btn => {
      btn?.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  return { init, start, show };
})();

/* ============================================================
   MODULE : ANIMATIONS AU SCROLL
   ============================================================ */
const ScrollAnimator = (() => {
  function init() {
    const elements = $$('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Délai en cascade pour les groupes
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, entry.target.dataset.delay || 0);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ============================================================
   MODULE : LANDING PAGE — Initialisation complète
   ============================================================ */
const LandingPage = (() => {
  function addScrollClasses() {
    // Hero
    $('.hero-inner')?.classList.add('animate-on-scroll', 'zoom-in');

    // Photo
    $('.profile-photo-wrapper')?.classList.add('animate-on-scroll', 'slide-left');
    $('.message-card')?.classList.add('animate-on-scroll', 'slide-right');

    // Stats
    $$('.stat-card').forEach((c, i) => {
      c.classList.add('animate-on-scroll');
      c.dataset.delay = i * 80;
    });

    // Together
    $('.together-card')?.classList.add('animate-on-scroll', 'zoom-in');

    // Timeline items
    $$('.timeline-item').forEach((item, i) => {
      item.classList.add('animate-on-scroll');
      item.classList.add(i % 2 === 0 ? 'slide-left' : 'slide-right');
      item.dataset.delay = i * 150;
    });

    // Certificate
    $('.certificate')?.classList.add('animate-on-scroll', 'zoom-in');

    // Letter
    $('.letter-trigger-btn')?.classList.add('animate-on-scroll');

    // Restart
    $('.restart-btn')?.classList.add('animate-on-scroll');
  }

  async function init() {
    const page = $('#landing-page');
    if (!page) return;

    page.classList.remove('hidden');
    addScrollClasses();
    ScrollAnimator.init();

    // Certificat
    Certificate.init();

    // Compteurs
    Counter.observe();
    TogetherCounter.render();

    // Lettre
    LoveLetter.init();

    // Effet machine à écrire (déclenché quand le message est visible)
    const msgEl = $('#typewriter-text');
    const section = $('.profile-section');

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        Typewriter.type(msgEl, CONFIG.LOVE_MESSAGE, 35);
        observer.disconnect();
      }
    }, { threshold: 0.3 });

    if (section) observer.observe(section);
  }

  return { init };
})();

/* ============================================================
   MODULE : BOUTON RECOMMENCER
   ============================================================ */
const Restart = (() => {
  function init() {
    $('#restart-btn')?.addEventListener('click', async () => {
      // Arrêt musique
      const audio = $('#audio-player');
      audio?.pause();
      if (audio) audio.currentTime = 0;

      // Masquer landing
      const landing = $('#landing-page');
      if (landing) {
        landing.style.opacity = '0';
        landing.style.transform = 'scale(0.97)';
        landing.style.transition = 'all 0.6s ease';
        await sleep(600);
        landing.classList.add('hidden');
        landing.style.opacity = '';
        landing.style.transform = '';
        landing.style.transition = '';
      }

      // Masquer le lecteur
      $('#music-player')?.classList.add('hidden');

      // Réinitialiser écran Home
      const home = $('#home-screen');
      if (home) {
        home.classList.remove('hidden', 'fade-out');
        home.style.display = '';
        home.style.opacity = '1';
        $('#confetti-container').innerHTML = '';
        const btn = $('#cta-button');
        if (btn) btn.disabled = false;
        HomeScreen.show(() => LandingPage.init());
      }

      // Réinitialiser la lettre
      const letterContainer = $('#letter-container');
      if (letterContainer) {
        letterContainer.classList.add('hidden');
        const envelope = $('#envelope');
        const letter = $('#letter');
        if (envelope) {
          envelope.classList.remove('open');
        }
        if (letter) letter.classList.remove('visible');
      }

      // Réinitialiser typewriter
      Typewriter.abort();
      const msgEl = $('#typewriter-text');
      if (msgEl) msgEl.textContent = '';
      const btn2 = $('#open-letter-btn');
      if (btn2) btn2.setAttribute('aria-expanded', 'false');
    });
  }

  return { init };
})();

/* ============================================================
   MODULE : CARTES RETOURNABLES
   ============================================================ */
const FlipCards = (() => {
  function init() {
    const cards = $$('.stat-card');

    cards.forEach(card => {
      // Clic pour retourner
      card.addEventListener('click', () => flip(card));

      // Accessibilité clavier
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          flip(card);
        }
      });
    });
  }

  function flip(card) {
    const isFlipped = card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');

    // Animer le compteur quand on révèle la face arrière
    if (isFlipped) {
      setTimeout(() => Counter.animateOnFlip(card), 350);
    } else {
      // Re-permettre l'animation au prochain retournement
      const valueEl = card.querySelector('.stat-card__value');
      if (valueEl) delete valueEl.dataset.animated;
    }
  }

  return { init };
})();

/* ============================================================
   MODULE : ANIMATIONS SCROLL
   ============================================================ */
const ScrollAnimations = (() => {
  function init() {
    const elements = $$('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ============================================================
   MODULE : CURSEUR PERSONNALISÉ
   ============================================================ */
const CustomCursor = (() => {
  function init() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // Ignore sur mobile/tactile

    const dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    document.body.appendChild(dot);

    const ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    document.body.appendChild(ring);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function render() {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Ajouter classe hover sur les éléments interactifs
    const interactives = document.querySelectorAll('a, button, .stat-card, input, textarea, .envelope, .timeline-item');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  return { init };
})();

/* ============================================================
   POINT D'ENTRÉE PRINCIPAL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialiser le canvas de particules
  ParticleSystem.init(20);

  // 2. Lecteur audio (init sans démarrer)
  MusicPlayer.init();

  // 3. Cartes retournables
  FlipCards.init();

  // 4. Animations au défilement
  ScrollAnimations.init();

  // 5. Curseur personnalisé
  CustomCursor.init();

  // 6. Splash → Home → Landing
  Splash.run(() => {
    HomeScreen.show(async () => {
      await sleep(300);
      LandingPage.init();
      Restart.init();
    });
  });
});
