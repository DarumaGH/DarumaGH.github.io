// Main application JavaScript
class PortfolioApp {
    constructor() {
        this.currentSection = 'about';
        this.sections = ['about', 'games', 'software', 'contact'];
        this.isScrollingToSection = false; // Flag to track programmatic scrolling
        this.scrollTimeout = null; // Timeout to reset the flag
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.loadAllSections();
            this.setupNavigation();
            this.setupLightbox();
            this.setupScrollAnimations();
            this.setupExternalLinks();
            this.setupResizeHandler();
            this.setupScrollObserver();
        });
    }

    async loadAllSections() {
        for (const section of this.sections) {
            await this.loadSection(section);
        }
    }

    async loadSection(sectionName) {
        try {
            const response = await fetch(`sections/${sectionName}.html`);
            if (!response.ok) throw new Error(`Failed to load section: ${sectionName}`);
            
            const content = await response.text();
            const sectionElement = document.getElementById(sectionName);
            if (sectionElement) {
                sectionElement.innerHTML = content;
            }
        } catch (error) {
            console.error('Error loading section:', error);
            const sectionElement = document.getElementById(sectionName);
            if (sectionElement) {
                sectionElement.innerHTML = `
                    <div class="content-container">
                        <h2 class="section-title">Error</h2>
                        <p>Sorry, failed to load the ${sectionName} section.</p>
                    </div>
                `;
            }
        }
    }

    setupScrollObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '-20% 0px -20% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            // Only update navigation if we're not currently scrolling to a section
            if (!this.isScrollingToSection) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.id;
                        this.updateActiveNav(sectionId);
                    }
                });
            }
        }, options);

        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }

    updateActiveNav(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        let lastScrollTime = 0;
        let userScrollTimeout;
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-section');
                
                // Set flag to indicate we're scrolling programmatically
                this.isScrollingToSection = true;
                
                // Clear any existing timeout
                if (this.scrollTimeout) {
                    clearTimeout(this.scrollTimeout);
                }
                
                // Immediately update the active nav to the clicked section
                this.updateActiveNav(targetSection);
                
                // Scroll to the section with offset
                const targetElement = document.getElementById(targetSection);
                const offsetTop = targetElement.offsetTop + 30; // Adjust offset as needed
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Reset the flag after a shorter duration
                this.scrollTimeout = setTimeout(() => {
                    this.isScrollingToSection = false;
                }, 500);
            });
        });
        
        // Listen for scroll events to detect user scrolling
        window.addEventListener('scroll', () => {
            const currentTime = Date.now();
            
            if (this.isScrollingToSection) {
                // Clear any existing user scroll timeout
                clearTimeout(userScrollTimeout);
                
                // If user scrolls within a short time after programmatic scroll,
                // immediately enable nav updates
                userScrollTimeout = setTimeout(() => {
                    this.isScrollingToSection = false;
                }, 100);
                
                // Also check if user is actively scrolling by detecting rapid scroll events
                if (currentTime - lastScrollTime < 16) { // ~60fps threshold
                    this.isScrollingToSection = false;
                }
            }
            
            lastScrollTime = currentTime;
        }, { passive: true });
        
        // Also listen for wheel and touch events to immediately detect user interaction
        const immediateUserScrollHandler = () => {
            if (this.isScrollingToSection) {
                this.isScrollingToSection = false;
            }
        };
        
        window.addEventListener('wheel', immediateUserScrollHandler, { passive: true });
        window.addEventListener('touchstart', immediateUserScrollHandler, { passive: true });
        window.addEventListener('keydown', (e) => {
            // Detect keyboard scrolling (arrow keys, page up/down, etc.)
            if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
                immediateUserScrollHandler();
            }
        });
    }

    setupLightbox() {
        const projectImages = document.querySelectorAll('.project-image');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = document.querySelector('.lightbox-close');
        
        // Open lightbox
        projectImages.forEach(image => {
            image.addEventListener('click', () => {
                lightbox.style.display = 'block';
                lightboxImg.src = image.src;
                lightboxImg.alt = image.alt;
                document.body.style.overflow = 'hidden';
            });
        });
        
        // Close lightbox
        const closeLightbox = () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
        
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Close lightbox with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

    setupScrollAnimations() {
        // Add loading animation for images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
            
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            if (img.complete) {
                img.style.opacity = '1';
            }
        });
        
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe project cards for scroll animations
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }

    setupExternalLinks() {
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.addEventListener('click', function() {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 100);
            });
        });
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const isMobile = window.innerWidth <= 1024;
                document.body.classList.toggle('mobile-view', isMobile);
            }, 250);
        });
        
        // Initial call to set mobile class
        document.body.classList.toggle('mobile-view', window.innerWidth <= 1024);
    }
}

// Initialize the app
new PortfolioApp();