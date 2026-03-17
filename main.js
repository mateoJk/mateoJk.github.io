/**
 * Portfolio Architecture - Mateo
 * Principles: Encapsulation, DOM Caching, Performance Optimization
 */

const APP_CONFIG = {
    typewriter: {
        phrases: ["Full Stack Developer", "Creative Thinker", "Problem Solver"],
        speeds: { type: 100, delete: 50, pause: 3000 }
    },
    revealOptions: {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    }
};

class PortfolioApp {
    constructor() {
        this.typewriterTimeout = null;
        this.init();
    }

    init() {
        // Centralized DOM Cache
        this.dom = {
            html: document.documentElement,
            nav: document.getElementById('navbar'),
            typewriter: document.getElementById('typewriter-text'),
            themeBtn: document.getElementById('theme-toggle'),
            cards: document.querySelectorAll('.spotlight-card'),
            mobileMenuBtn: document.getElementById('mobile-menu-button'),
            mobileMenu: document.getElementById('mobile-menu'),
            contactForm: document.getElementById('contact-form')
        };

        // Initialize Core Modules
        this.setupTheme();
        this.setupMobileMenu();
        this.setupTypewriter();
        this.setupSpotlight();
        this.setupScrollEffects();
        this.setupContactForm(); // Integrated logic
    }

    setupTheme() {
        const updateIcons = (isDark) => {
            document.getElementById('theme-toggle-dark-icon')?.classList.toggle('hidden', isDark);
            document.getElementById('theme-toggle-light-icon')?.classList.toggle('hidden', !isDark);
        };

        const currentTheme = localStorage.getItem('theme') || 
                            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        if (currentTheme === 'dark') this.dom.html.classList.add('dark');
        updateIcons(this.dom.html.classList.contains('dark'));

        this.dom.themeBtn?.addEventListener('click', () => {
            const isDark = this.dom.html.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateIcons(isDark);
        });
    }

    setupMobileMenu() {
        if (!this.dom.mobileMenuBtn || !this.dom.mobileMenu) return;

        const toggleMenu = (open) => {
            this.dom.mobileMenu.classList.toggle('opacity-100', open);
            this.dom.mobileMenu.classList.toggle('translate-y-0', open);
            this.dom.mobileMenu.classList.toggle('pointer-events-auto', open);
            this.dom.mobileMenu.classList.toggle('opacity-0', !open);
            this.dom.mobileMenu.classList.toggle('-translate-y-2', !open);
            this.dom.mobileMenu.classList.toggle('pointer-events-none', !open);
            this.dom.mobileMenuBtn.setAttribute('aria-expanded', open);
        };

        this.dom.mobileMenuBtn.addEventListener('click', () => {
            const isOpen = this.dom.mobileMenu.classList.contains('opacity-100');
            toggleMenu(!isOpen);
        });

        this.dom.mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });
    }

    setupTypewriter() {
        if (!this.dom.typewriter) return;
        
        let i = 0, j = 0, isDeleting = false;
        const { phrases, speeds } = APP_CONFIG.typewriter;

        const loop = () => {
            const currentPhrase = phrases[i];
            this.dom.typewriter.textContent = isDeleting 
                ? currentPhrase.substring(0, j--) 
                : currentPhrase.substring(0, j++);

            let nextTick = isDeleting ? speeds.delete : speeds.type;

            if (!isDeleting && j > currentPhrase.length) {
                isDeleting = true;
                nextTick = speeds.pause;
            } else if (isDeleting && j < 0) {
                isDeleting = false;
                i = (i + 1) % phrases.length;
                nextTick = 500;
            }

            this.typewriterTimeout = setTimeout(loop, nextTick);
        };
        loop();
    }

    setupSpotlight() {
        this.dom.cards.forEach(card => {
            let rect = null;
            
            card.addEventListener('mouseenter', () => rect = card.getBoundingClientRect());

            card.addEventListener('mousemove', (e) => {
                if (!rect) return;
                
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                requestAnimationFrame(() => {
                    card.style.setProperty("--mouse-x", `${x}px`);
                    card.style.setProperty("--mouse-y", `${y}px`);
                    
                    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
                    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 5;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                });
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
                rect = null;
            });
        });
    }

    setupScrollEffects() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, APP_CONFIG.revealOptions);

        document.querySelectorAll('.reveal-hidden').forEach(el => observer.observe(el));

        let isScrolled = false;
        window.addEventListener('scroll', () => {
            const shouldScroll = window.scrollY > 20;
            if (isScrolled !== shouldScroll) {
                isScrolled = shouldScroll;
                this.dom.nav?.classList.toggle('py-2', isScrolled);
                this.dom.nav?.classList.toggle('shadow-md', isScrolled);
            }
        }, { passive: true });
    }

    setupContactForm() {
        const form = this.dom.contactForm;
        if (!form) return;

        const btn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(form);
            
            // UI Feedback: Loading
            const originalText = btn.innerText;
            btn.innerText = "Enviando...";
            btn.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    btn.innerText = "¡Mensaje Enviado!";
                    btn.classList.replace('bg-primary', 'bg-green-500');
                    form.reset();
                } else {
                    throw new Error('Network response was not ok.');
                }
            } catch (error) {
                btn.innerText = "Error al enviar";
                btn.classList.replace('bg-primary', 'bg-red-500');
            } finally {
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.classList.remove('bg-green-500', 'bg-red-500');
                    btn.classList.add('bg-primary');
                }, 4000);
            }
        });
    }
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    window.portfolio = new PortfolioApp();
});