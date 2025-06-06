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

    // Calculate how much of a section is visible on screen
    getVisiblePercentage(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // If element is completely above or below viewport
        if (rect.bottom <= 0 || rect.top >= windowHeight) {
            return 0;
        }
        
        // Calculate visible portion
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(windowHeight, rect.bottom);
        const visibleHeight = visibleBottom - visibleTop;
        const totalHeight = rect.height;
        
        return totalHeight > 0 ? (visibleHeight / totalHeight) * 100 : 0;
    }

    // Find the section with the highest visible percentage
    getMostVisibleSection() {
        let mostVisibleSection = null;
        let highestVisibility = 0;
        
        document.querySelectorAll('.section').forEach(section => {
            const visibilityPercentage = this.getVisiblePercentage(section);
            
            if (visibilityPercentage > highestVisibility) {
                highestVisibility = visibilityPercentage;
                mostVisibleSection = section.id;
            }
        });
        
        return mostVisibleSection;
    }

    setupScrollObserver() {
        // Use scroll event instead of IntersectionObserver for more precise control
        let scrollTimeout;
        
        const handleScroll = () => {
            // Clear existing timeout
            clearTimeout(scrollTimeout);
            
            // Debounce the scroll event
            scrollTimeout = setTimeout(() => {
                // Only update navigation if not currently scrolling programmatically
                if (!this.isScrollingToSection) {
                    const mostVisibleSection = this.getMostVisibleSection();
                    if (mostVisibleSection && mostVisibleSection !== this.currentSection) {
                        this.currentSection = mostVisibleSection;
                        this.updateActiveNav(mostVisibleSection);
                    }
                }
            });
        };
        
        // Remove existing scroll listener if any
        window.removeEventListener('scroll', this.scrollHandler);
        
        // Store reference for cleanup
        this.scrollHandler = handleScroll;
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial check
        setTimeout(() => {
            const mostVisibleSection = this.getMostVisibleSection();
            if (mostVisibleSection) {
                this.currentSection = mostVisibleSection;
                this.updateActiveNav(mostVisibleSection);
            }
        }, 100);
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
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-section');
                
                // Set the scrolling flag
                this.isScrollingToSection = true;
                
                if (this.scrollTimeout) {
                    clearTimeout(this.scrollTimeout);
                }
                
                // Update the active nav immediately
                this.updateActiveNav(targetSection);
                this.currentSection = targetSection;
                
                const targetElement = document.getElementById(targetSection);
                let offsetTop;
                
                if (window.innerWidth <= 1024) {
                    // Mobile: account for sticky header height
                    const sidebarHeight = document.querySelector('.sidebar').offsetHeight;
                    offsetTop = targetElement.offsetTop - sidebarHeight - 10;
                } else {
                    // Desktop: use existing offset
                    offsetTop = targetElement.offsetTop + 25;
                }
                
                // Scroll to the target section
                if (targetSection === 'about') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }

                // Reset the scrolling flag after animation completes
                this.scrollTimeout = setTimeout(() => {
                    this.isScrollingToSection = false;
                }, 800); // Increased timeout for smoother mobile experience
            });
        });

        // Initialize the first active nav item
        this.updateActiveNav(this.sections[0]);
    }

    setupLightbox() {
        // Use event delegation to handle dynamically loaded images
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('project-image')) {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                
                lightbox.style.display = 'block';
                lightboxImg.src = e.target.src;
                lightboxImg.alt = e.target.alt;
                document.body.style.overflow = 'hidden';
            }
        });
        
        // Close lightbox
        const closeLightbox = () => {
            const lightbox = document.getElementById('lightbox');
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
        
        const lightboxClose = document.querySelector('.lightbox-close');
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        
        const lightbox = document.getElementById('lightbox');
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
        
        // Use a timeout to ensure content is loaded before observing
        setTimeout(() => {
            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(card);
            });
        }, 500);
    }

    setupExternalLinks() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[target="_blank"]') || e.target.closest('a[target="_blank"]')) {
                const link = e.target.matches('a[target="_blank"]') ? e.target : e.target.closest('a[target="_blank"]');
                link.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    link.style.transform = 'scale(1)';
                }, 100);
            }
        });
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Recalculate the most visible section after resize
                const mostVisibleSection = this.getMostVisibleSection();
                if (mostVisibleSection) {
                    this.currentSection = mostVisibleSection;
                    this.updateActiveNav(mostVisibleSection);
                }
            }, 250);
        });
    }
}

// Initialize the app
new PortfolioApp();