/**
 * Home Page JavaScript for ImgNinja Landing Page
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all home page functionality
  initializeHomePage();
});

function initializeHomePage() {
  // Initialize mobile menu
  initializeMobileMenu();

  // Initialize smooth scrolling
  initializeSmoothScrolling();

  // Initialize scroll animations
  initializeScrollAnimations();

  // Initialize feature card interactions
  initializeFeatureCards();

  // Initialize back to top functionality
  initializeBackToTop();

  // Initialize hero enhancements
  initializeHeroEnhancements();
}

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      navLinks.classList.toggle('active');
      
      // Prevent scrolling when menu is open
      document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking on a link
    const navLinkItems = navLinks.querySelectorAll('a');
    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#"
      if (href === '#') return;
      
      const targetElement = document.querySelector(href);
      
      if (targetElement) {
        e.preventDefault();
        
        const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Initialize scroll animations for elements
 */
function initializeScrollAnimations() {
  // Create intersection observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observe elements that should animate on scroll
  const animateElements = document.querySelectorAll('.feature-card, .benefit-card, .section-header');
  animateElements.forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });

  // Add CSS for scroll animations
  addScrollAnimationStyles();
}

/**
 * Add CSS styles for scroll animations
 */
function addScrollAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease-out;
    }
    
    .animate-on-scroll.animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    .feature-card.animate-on-scroll {
      transition-delay: 0.1s;
    }
    
    .feature-card:nth-child(2).animate-on-scroll {
      transition-delay: 0.2s;
    }
    
    .feature-card:nth-child(3).animate-on-scroll {
      transition-delay: 0.3s;
    }
    
    .benefit-card.animate-on-scroll {
      transition-delay: 0.1s;
    }
    
    .benefit-card:nth-child(2).animate-on-scroll {
      transition-delay: 0.2s;
    }
    
    .benefit-card:nth-child(3).animate-on-scroll {
      transition-delay: 0.3s;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize feature card interactions
 */
function initializeFeatureCards() {
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach(card => {
    // Add hover effect for live cards
    if (card.classList.contains('live')) {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-5px) scale(1)';
      });
    }
    
    // Add click tracking for analytics (if needed)
    const button = card.querySelector('.feature-button');
    if (button && !button.disabled) {
      button.addEventListener('click', function(e) {
        // Track feature button clicks
        console.log('Feature button clicked:', card.querySelector('.feature-title').textContent);
      });
    }
  });
}

/**
 * Initialize back to top button functionality
 */
function initializeBackToTop() {
  const backToTopButton = document.querySelector('.back-to-top');
  
  if (backToTopButton) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    });

    // Smooth scroll to top when clicked
    backToTopButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Initialize parallax effect for hero background (optional enhancement)
 */
function initializeParallaxEffect() {
  const heroBackground = document.querySelector('.hero-background');
  
  if (heroBackground) {
    window.addEventListener('scroll', function() {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      heroBackground.style.transform = `translateY(${rate}px)`;
    });
  }
}

/**
 * Initialize typing effect for hero title (optional enhancement)
 */
function initializeTypingEffect() {
  const heroTitle = document.querySelector('.hero-title');
  const text = heroTitle.textContent;
  
  if (heroTitle && text) {
    heroTitle.textContent = '';
    heroTitle.style.borderRight = '2px solid var(--highlight-color)';
    
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        heroTitle.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      } else {
        // Remove cursor after typing is complete
        setTimeout(() => {
          heroTitle.style.borderRight = 'none';
        }, 1000);
      }
    };
    
    // Start typing effect after a delay
    setTimeout(typeWriter, 1000);
  }
}

/**
 * Initialize feature countdown for upcoming features (optional)
 */
function initializeFeatureCountdown() {
  const upcomingCards = document.querySelectorAll('.feature-card.upcoming');
  
  upcomingCards.forEach(card => {
    const button = card.querySelector('.upcoming-button');
    if (button) {
      // Add hover effect to show "notify me" option
      card.addEventListener('mouseenter', function() {
        button.innerHTML = '<i class="fas fa-bell"></i> Notify Me';
      });
      
      card.addEventListener('mouseleave', function() {
        button.innerHTML = '<i class="fas fa-clock"></i> Coming Soon';
      });
      
      // Add click handler for notification signup
      button.addEventListener('click', function(e) {
        e.preventDefault();
        // Here you could implement a notification signup modal
        console.log('User wants to be notified about:', card.querySelector('.feature-title').textContent);
      });
    }
  });
}

/**
 * Initialize performance monitoring
 */
function initializePerformanceMonitoring() {
  // Monitor page load performance
  window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log('Page loaded in:', Math.round(loadTime), 'ms');
    
    // Track Core Web Vitals if needed
    if ('web-vitals' in window) {
      // Implementation for web vitals tracking
    }
  });
}

/**
 * Initialize error handling
 */
function initializeErrorHandling() {
  window.addEventListener('error', function(e) {
    console.error('JavaScript error on home page:', e.error);
    // Could send error reports to analytics service
  });
  
  window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection on home page:', e.reason);
  });
}

/**
 * Initialize hero section enhancements
 */
function initializeHeroEnhancements() {
  // Add staggered animation to stats
  const statItems = document.querySelectorAll('.stat-item');
  statItems.forEach((item, index) => {
    item.style.animationDelay = `${1.8 + (index * 0.2)}s`;
    item.classList.add('animate-stat');
  });

  // Add hover effect to hero logo
  const heroLogo = document.querySelector('.hero-logo-img');
  if (heroLogo) {
    heroLogo.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1) rotate(5deg)';
    });

    heroLogo.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) rotate(0deg)';
    });
  }

  // Add dynamic particle movement
  initializeParticleAnimation();

  // Add counter animation to stats
  initializeStatsCounter();
}

/**
 * Initialize particle animation
 */
function initializeParticleAnimation() {
  const particles = document.querySelectorAll('.particle');

  particles.forEach((particle, index) => {
    // Random initial position
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;

    particle.style.left = randomX + '%';
    particle.style.top = randomY + '%';

    // Add mouse interaction
    document.addEventListener('mousemove', (e) => {
      const rect = particle.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * 0.01;
      const deltaY = (e.clientY - centerY) * 0.01;

      particle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });
  });
}

/**
 * Initialize stats counter animation
 */
function initializeStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const text = target.textContent;

        if (text.includes('%')) {
          const number = parseInt(text);
          animateNumber(target, 0, number, '%');
        }
      }
    });
  });

  statNumbers.forEach(stat => observer.observe(stat));
}

/**
 * Animate number counting
 */
function animateNumber(element, start, end, suffix = '') {
  const duration = 2000;
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const current = Math.floor(start + (end - start) * progress);
    element.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
}

// Initialize additional features if needed
// initializeParallaxEffect();
// initializeTypingEffect();
// initializeFeatureCountdown();
// initializePerformanceMonitoring();
// initializeErrorHandling();
