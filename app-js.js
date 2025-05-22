// Main application JavaScript
class PortfolioApp {
    constructor() {
        this.currentSection = 'about';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupNavigation();
            this.setupLightbox();
            this.setupScrollAnimations();
            this.setupExternalLinks();
            this.setupResizeHandler();
            this.loadSection('about'); // Load initial section
        });
    }

    async loadSection(sectionName) {
        try {
            const response = await fetch(`sections/${sectionName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load section: ${sectionName}`);
            }
            
            const content = await response.text();
            const mainContent = document.getElementById('main-content');
            
            // Add fade out effect
            mainContent.style.opacity = '0';
            
            setTimeout(() => {
                mainContent.innerHTML = content;
                
                // Re-initialize lightbox for new images
                this.setupLightbox();
                
                // Scroll to top of main content without affecting sidebar
                mainContent.scrollTop = 0;
                
                // Add fade in effect
                mainContent.style.opacity = '1';
                
                // Update current section
                this.currentSection = sectionName;
            }, 150);
            
        } catch (error) {
            console.error('Error loading section:', error);
            document.getElementById('main-content').innerHTML = `
                <div class="content-container">
                    <h2 class="section-title">Error</h2>
                    <p>Sorry, failed to load the ${sectionName} section.</p>
                </div>
            `;
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetSection = link.getAttribute('data-section');
                
                // Remove active class from all nav links
                navLinks.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked nav link
                link.classList.add('active');
                
                // Load the section content
                this.loadSection(targetSection);
            });
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