// ===== VARIABLES =====
let currentRoom = { name: 'Double Sharing', price: 8500 };
let paymentTimer = null;
let timeRemaining = 300; // 5 minutes

const preloader = document.getElementById('preloader');
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const bookingModal = document.getElementById('bookingModal');
const paymentModal = document.getElementById('paymentModal');
const contactForm = document.getElementById('contactForm');
const bookingForm = document.getElementById('bookingForm');
const paymentForm = document.getElementById('paymentForm');
const notification = document.getElementById('notification');
const pricingToggle = document.getElementById('pricingToggle');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  hidePreloader();
  setupEventListeners();
  setupScrollEffects();
  setMinDate();
});

function hidePreloader() {
  setTimeout(() => {
    if (preloader) preloader.style.display = 'none';
  }, 2500);
}

function setupEventListeners() {
  // Navigation
  navToggle?.addEventListener('click', toggleMenu);
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle?.classList.remove('active');
      if (navMenu) navMenu.style.display = 'none';
    });
  });

  // Room Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterRooms(btn.dataset.filter);
    });
  });

  // Pricing Toggle
  pricingToggle?.addEventListener('change', togglePricing);

  // Forms
  contactForm?.addEventListener('submit', handleContactForm);
  bookingForm?.addEventListener('submit', handleBookingForm);
  paymentForm?.addEventListener('submit', handlePaymentForm);

  // FAQ
  document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });

  // Testimonial Navigation
  document.getElementById('prevTest')?.addEventListener('click', scrollTestimonials);
  document.getElementById('nextTest')?.addEventListener('click', scrollTestimonials);
}

function setupScrollEffects() {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });
}

// ===== MENU TOGGLE =====
function toggleMenu() {
  navToggle.classList.toggle('active');
  navMenu.style.display = navToggle.classList.contains('active') ? 'flex' : 'none';
}

// ===== SCROLL TO ELEMENT =====
function scrollToElement(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ===== ROOM FILTERING =====
function filterRooms(type) {
  const cards = document.querySelectorAll('.room-card');
  cards.forEach(card => {
    if (type === 'all' || card.dataset.type === type) {
      card.style.display = 'block';
      setTimeout(() => card.style.opacity = '1', 10);
    } else {
      card.style.opacity = '0';
      setTimeout(() => card.style.display = 'none', 300);
    }
  });
}

// ===== PRICING TOGGLE =====
function togglePricing() {
  const isYearly = pricingToggle.checked;
  document.querySelectorAll('.price.monthly').forEach(el => {
    el.style.display = isYearly ? 'none' : 'inline';
  });
  document.querySelectorAll('.price.yearly').forEach(el => {
    el.style.display = isYearly ? 'inline' : 'none';
  });
}

// ===== BOOKING MODAL =====
function openBookingModal(roomName = 'Double Sharing', price = 8500) {
  currentRoom = { name: roomName, price: price };
  document.getElementById('summaryRoom').textContent = roomName;
  document.getElementById('summaryPrice').textContent = price;
  document.getElementById('rentAmount').textContent = price;
  document.getElementById('depositAmount').textContent = price;
  document.getElementById('totalDue').textContent = price;
  
  bookingModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  bookingModal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function updateTotal() {
  const durationSelect = document.querySelector('.booking-form select');
  const duration = durationSelect?.value || 0;
  const price = currentRoom.price;
  const totalRent = price * duration;
  const total = totalRent + price;
  
  document.getElementById('durationDisplay').textContent = duration;
  document.getElementById('totalRent').textContent = totalRent.toLocaleString();
  document.getElementById('totalDue').textContent = total.toLocaleString();
}

// ===== PAYMENT MODAL =====
function openPaymentModal(amount) {
  const totalAmount = document.getElementById('totalDue')?.textContent || amount;
  document.getElementById('paymentAmount').textContent = totalAmount;
  
  paymentModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  startPaymentTimer();
}

function closePaymentModal() {
  paymentModal.classList.remove('active');
  document.body.style.overflow = 'auto';
  stopPaymentTimer();
}

function startPaymentTimer() {
  timeRemaining = 300; // 5 minutes
  updateTimerDisplay();
  
  paymentTimer = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      stopPaymentTimer();
      showNotification('⏱️ Payment time expired! Please try again.', 'error');
      closePaymentModal();
    }
  }, 1000);
}

function stopPaymentTimer() {
  if (paymentTimer) clearInterval(paymentTimer);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const timerEl = document.getElementById('paymentTimer');
  if (timerEl) timerEl.textContent = display;
}

// ===== FORM HANDLING =====
function handleContactForm(e) {
  e.preventDefault();
  
  const formData = new FormData(contactForm);
  console.log('Contact submitted:', {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message')
  });
  
  showNotification('✓ Message sent! We will contact you soon.', 'success');
  contactForm.reset();
}

function handleBookingForm(e) {
  e.preventDefault();
  
  const formData = new FormData(bookingForm);
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  
  if (!name || !email || !phone) {
    showNotification('⚠️ Please fill all required fields', 'error');
    return;
  }
  
  const totalAmount = document.getElementById('totalDue').textContent;
  
  closeBookingModal();
  setTimeout(() => {
    openPaymentModal(totalAmount);
  }, 500);
}

function handlePaymentForm(e) {
  e.preventDefault();
  
  const refId = document.getElementById('refId').value;
  if (!refId) {
    showNotification('⚠️ Please enter UPI Reference ID', 'error');
    return;
  }
  
  if (refId.length < 10) {
    showNotification('⚠️ Invalid Reference ID', 'error');
    return;
  }
  
  showNotification('✓ Payment confirmed! Booking completed successfully.', 'success');
  stopPaymentTimer();
  
  console.log('Booking confirmed with Reference ID:', refId);
  
  setTimeout(() => {
    closePaymentModal();
    bookingForm.reset();
    paymentForm.reset();
  }, 2000);
}

// ===== NOTIFICATION =====
function showNotification(message, type = 'success') {
  notification.textContent = message;
  notification.className = `notification show ${type}`;
  setTimeout(() => notification.classList.remove('show'), 3500);
}

// ===== FAQ TOGGLE =====
function toggleFAQ(header) {
  const item = header.parentElement;
  item.classList.toggle('active');
}

// ===== TESTIMONIALS SCROLL =====
function scrollTestimonials(e) {
  const slider = document.querySelector('.testimonials-slider');
  if (!slider) return;
  
  const scrollAmount = 320;
  if (e.target.closest('#prevTest')) {
    slider.scrollLeft -= scrollAmount;
  } else {
    slider.scrollLeft += scrollAmount;
  }
}

// ===== DATE PICKER =====
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => input.setAttribute('min', today));
}

// ===== MODAL CLOSE ON ESC =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeBookingModal();
    closePaymentModal();
  }
});

// ===== MODAL OVERLAY CLICK =====
bookingModal?.addEventListener('click', (e) => {
  if (e.target === bookingModal) closeBookingModal();
});

paymentModal?.addEventListener('click', (e) => {
  if (e.target.closest('.modal-overlay')) closePaymentModal();
});

// ===== SMOOTH SCROLL FOR NAVIGATION =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== ANIMATION ON SCROLL =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.stat-card, .service-item, .amenity-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

// ===== PREVENT DOUBLE SUBMISSIONS =====
let isSubmitting = false;

function preventDoubleSubmit(form) {
  if (isSubmitting) return false;
  isSubmitting = true;
  setTimeout(() => { isSubmitting = false; }, 2000);
  return true;
}

if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    if (!preventDoubleSubmit(e.target)) e.preventDefault();
  });
}

if (paymentForm) {
  paymentForm.addEventListener('submit', (e) => {
    if (!preventDoubleSubmit(e.target)) e.preventDefault();
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    if (!preventDoubleSubmit(e.target)) e.preventDefault();
  });
}

// ===== PERFORMANCE LOGGING =====
console.log('✓ LuxeHostel Website Loaded Successfully');
console.log('✓ 🏆 Best Hostel Award 2025');
console.log('✓ Students from 30+ countries');
console.log('✓ 50+ premium services');
console.log('✓ UPI Payment System Active');
