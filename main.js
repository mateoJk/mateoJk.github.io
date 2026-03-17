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
        this.dom = {
            html: document.documentElement,
            nav: document.getElementById('navbar'),
            typewriter: document.getElementById('typewriter-text'),
            themeBtn: document.getElementById('theme-toggle'),
            cards: document.querySelectorAll('.spotlight-card'),
            mobileMenuBtn: document.getElementById('mobile-menu-button'),
            mobileMenu: document.getElementById('mobile-menu')
        };

        this.setupTheme();
        this.setupMobileMenu(); // Nueva funcionalidad
        this.setupTypewriter();
        this.setupSpotlight();
        this.setupScrollEffects();
    }

    setupTheme() {
        const updateIcons = (isDark) => {
            document.getElementById('theme-toggle-dark-icon')?.classList.toggle('hidden', isDark);
            document.getElementById('theme-toggle-light-icon')?.classList.toggle('hidden', !isDark);
        };

        updateIcons(this.dom.html.classList.contains('dark'));

        this.dom.themeBtn?.addEventListener('click', () => {
            const isDark = this.dom.html.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateIcons(isDark);
        });
    }

setupMobileMenu() {
    if (!this.dom.mobileMenuBtn || !this.dom.mobileMenu) return;

    this.dom.mobileMenuBtn.addEventListener('click', () => {
        const isOpen = this.dom.mobileMenu.classList.contains('opacity-100');
        
        if (isOpen) {
            // Cerrar
            this.dom.mobileMenu.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            this.dom.mobileMenu.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
            this.dom.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        } else {
            // Abrir
            this.dom.mobileMenu.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            this.dom.mobileMenu.classList.remove('opacity-0', '-translate-y-2', 'pointer-events-none');
            this.dom.mobileMenuBtn.setAttribute('aria-expanded', 'true');
        }
    });

    // Ajustar los links para que también cierren con el nuevo efecto
    this.dom.mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            this.dom.mobileMenu.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            this.dom.mobileMenu.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
            this.dom.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
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
        const onMove = (e, card, rect) => {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            requestAnimationFrame(() => {
                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);
                
                const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
                const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 5;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
        };

        this.dom.cards.forEach(card => {
            // Cacheamos el rect al entrar para evitar layout thrashing en cada movimiento
            let rect = null;
            
            card.addEventListener('mouseenter', () => {
                rect = card.getBoundingClientRect();
            });

            card.addEventListener('mousemove', (e) => {
                if (rect) onMove(e, card, rect);
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

        // Optimización: Usar variables para evitar manipular el DOM si no es necesario
        let isScrolled = false;
        window.addEventListener('scroll', () => {
            const shouldScroll = window.scrollY > 20;
            if (isScrolled !== shouldScroll) {
                isScrolled = shouldScroll;
                this.dom.nav?.classList.toggle('py-2', isScrolled);
                this.dom.nav?.classList.toggle('shadow-sm', isScrolled);
            }
        }, { passive: true });
    }
}

// Inicialización única
document.addEventListener('DOMContentLoaded', () => {
    window.portfolio = new PortfolioApp();
});