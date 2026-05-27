/* ============================
   NAVBAR — scroll behavior
   ============================ */

const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

/**
 * Add/remove .scrolled class on navbar when user scrolls.
 */
function handleNavScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/**
 * Highlight the active nav link based on scroll position.
 */
function updateActiveLink() {
  let current = '';

  sections.forEach(section => {
    const top    = section.offsetTop - 100;
    const bottom = top + section.offsetHeight;
    if (window.scrollY >= top && window.scrollY < bottom) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', () => {
  handleNavScroll();
  updateActiveLink();
});

// Run once on load
handleNavScroll();
updateActiveLink();


/* ============================
   MOBILE MENU TOGGLE
   ============================ */

const navToggle  = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinksEl.classList.toggle('open');
});

// Close menu when a link is clicked
navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinksEl.classList.remove('open');
  });
});


/* ============================
   SMOOTH SCROLL
   Handles all anchor links that point to #sections
   ============================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.offsetTop - 70;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});


/* ============================
   SCROLL REVEAL ANIMATION
   Elements with class .reveal animate in when visible
   ============================ */

const revealEls = document.querySelectorAll('.reveal');

/**
 * Check each .reveal element and add .visible when in viewport.
 */
function checkReveal() {
  const windowH = window.innerHeight;

  revealEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < windowH - 80) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', checkReveal);
window.addEventListener('resize', checkReveal);

// Run once on load to reveal elements already in view
checkReveal();


/* ============================
   CONTACT FORM
   ============================ */

const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  // Basic validation
  if (!name || !email || !message) return;

  // Simulate sending — show loading state
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled    = true;

  setTimeout(() => {
    // Reset form
    contactForm.reset();

    // Show success message
    formSuccess.classList.add('show');
    submitBtn.textContent = 'Send Message';
    submitBtn.disabled    = false;

    // Hide success after 4 seconds
    setTimeout(() => {
      formSuccess.classList.remove('show');
    }, 4000);
  }, 1200);
});


/* ============================
   SKILL TAGS — hover animation
   (staggered reveal on scroll)
   ============================ */

const skillTags = document.querySelectorAll('.skill-tag');

skillTags.forEach((tag, index) => {
  tag.style.transitionDelay = (index * 0.06) + 's';
});


/* ============================
   PROJECT CARDS — tilt effect on hover
   ============================ */

const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) *  4;
    card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ============================
   TYPING EFFECT on hero role
   ============================ */

const roleEl   = document.querySelector('.hero-role');
const roles    = [
  'Frontend Developer · UI Designer',
  'HTML · CSS · JavaScript',
  'CodeAlpha Intern · 2025'
];
let   roleIdx  = 0;
let   charIdx  = 0;
let   deleting = false;

function typeRole() {
  const current = roles[roleIdx];

  if (!deleting) {
    roleEl.innerHTML = current.slice(0, charIdx + 1)
      .replace('·', '<span class="dot">·</span>');
    charIdx++;
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeRole, 2200);
      return;
    }
  } else {
    roleEl.innerHTML = current.slice(0, charIdx - 1)
      .replace('·', '<span class="dot">·</span>');
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      roleIdx  = (roleIdx + 1) % roles.length;
      setTimeout(typeRole, 400);
      return;
    }
  }

  setTimeout(typeRole, deleting ? 40 : 70);
}

// Start typing effect after initial fade-in
setTimeout(typeRole, 1200);