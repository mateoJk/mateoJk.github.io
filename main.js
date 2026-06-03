/**
 * Portfolio Architecture - Mateo
 * Principles: Encapsulation, DOM Caching, Performance Optimization
 */

const APP_CONFIG = {
    typewriter: {
        phrases: ["Software Engineer", "Data & IA Automation", "LLM & Agents", "Problem solver"],
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
        this.setupActiveNav();
        this.setupModalCarousel();
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
            card.addEventListener('mousemove', (e) => {
                // Read layout once per event (outside rAF) so the value is
                // always current — avoids stale rects from reveal animations.
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // rAF only writes — no DOM reads inside the callback.
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
                this.dom.nav?.classList.toggle('scrolled', isScrolled);
            }
        }, { passive: true });
    }

    setupActiveNav() {
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"], #mobile-menu a[href^="#"]');
        if (!sections.length || !navLinks.length) return;

        const activate = (id) => {
            navLinks.forEach(link => {
                link.classList.toggle('nav-active', link.getAttribute('href') === `#${id}`);
            });
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) activate(entry.target.id);
            });
        }, { threshold: 0, rootMargin: '-80px 0px -60% 0px' });

        sections.forEach(section => observer.observe(section));
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

    setupModalCarousel() {
        const modal   = document.getElementById('erp-preview-modal');
        const trigger = document.querySelector('[data-modal-trigger="erp-preview"]');
        if (!modal || !trigger) return;

        const slides = [
            { webp: 'img/flowcommerce_reportes_ventas.webp',      png: 'img/flowcommerce_reportes_ventas.png',      alt: 'Reportes de ventas' },
            { webp: 'img/flowcommerce_metaads.webp',              png: 'img/flowcommerce_metaads.png',              alt: 'Meta Ads — dashboard' },
            { webp: 'img/flowcommerce_metaads_campaña.webp',      png: 'img/flowcommerce_metaads_campaña.png',      alt: 'Meta Ads — campaña' },
            { webp: 'img/flowcommerce_metaads_campaña_list.webp', png: 'img/flowcommerce_metaads_campaña_list.png', alt: 'Meta Ads — lista de campañas' },
            { webp: 'img/flowcommerce_asistente.webp',            png: 'img/flowcommerce_asistente.png',            alt: 'Asistente IA conversacional' },
        ];

        const track    = modal.querySelector('[data-carousel-track]');
        const dotsWrap = modal.querySelector('[data-carousel-dots]');
        const counter  = modal.querySelector('[data-carousel-counter]');
        const prevBtn  = modal.querySelector('[data-carousel-prev]');
        const nextBtn  = modal.querySelector('[data-carousel-next]');
        const closeBtn = modal.querySelector('[data-modal-close]');
        const backdrop = modal.querySelector('[data-modal-backdrop]');
        const panel    = modal.querySelector('.relative.z-10');

        let current   = 0;
        let autoTimer = null;

        // Inject <picture> slides into the track
        slides.forEach((s, i) => {
            const div = document.createElement('div');
            div.className = 'carousel-slide';
            div.innerHTML = `<picture>
                <source srcset="${s.webp}" type="image/webp">
                <img src="${s.png}" alt="${s.alt}" loading="${i === 0 ? 'eager' : 'lazy'}">
            </picture>`;
            track.appendChild(div);
        });

        // Inject dots
        slides.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.className = `carousel-dot${i === 0 ? ' active' : ''}`;
            btn.setAttribute('aria-label', `Slide ${i + 1}`);
            btn.addEventListener('click', () => { goTo(i); startAuto(); });
            dotsWrap.appendChild(btn);
        });

        const updateUI = () => {
            track.style.transform = `translateX(-${current * 100}%)`;
            dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) =>
                d.classList.toggle('active', i === current)
            );
            if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
        };

        const goTo = (n) => {
            current = ((n % slides.length) + slides.length) % slides.length;
            updateUI();
        };

        const startAuto = () => {
            clearInterval(autoTimer);
            autoTimer = setInterval(() => goTo(current + 1), 5000);
        };

        const stopAuto = () => clearInterval(autoTimer);

        const openModal = () => {
            goTo(0);
            modal.classList.remove('pointer-events-none');
            // Double rAF ensures the opacity transition fires after display change
            requestAnimationFrame(() => requestAnimationFrame(() => {
                modal.classList.remove('opacity-0');
                modal.classList.add('opacity-100');
            }));
            document.body.style.overflow = 'hidden';
            startAuto();
            setTimeout(() => closeBtn?.focus(), 320);
        };

        const closeModal = () => {
            modal.classList.remove('opacity-100');
            modal.classList.add('opacity-0');
            stopAuto();
            modal.addEventListener('transitionend', () => {
                modal.classList.add('pointer-events-none');
                document.body.style.overflow = '';
                trigger.focus();
            }, { once: true });
        };

        trigger.addEventListener('click', (e) => { e.stopPropagation(); openModal(); });

        // Make the entire ERP card clickable
        const card = trigger.closest('article');
        if (card) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', openModal);
        }

        closeBtn?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', closeModal);
        prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
        nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });

        // Pause auto-advance while hovering the panel
        panel?.addEventListener('mouseenter', stopAuto);
        panel?.addEventListener('mouseleave', () => {
            if (modal.classList.contains('opacity-100')) startAuto();
        });

        // Global keyboard handling: arrows, Escape, focus trap
        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('opacity-100')) return;
            if (e.key === 'Escape') { closeModal(); return; }
            if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
            if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
            if (e.key === 'Tab') {
                const focusable = [...modal.querySelectorAll('button')];
                const first = focusable[0];
                const last  = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }
        });

        updateUI();
    }
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    window.portfolio = new PortfolioApp();
});