/* ============================================================ */
/* main.js — Divine Comedy                                      */
/* ============================================================ */

/* -------- Home page — hover zone glow images -------- */

(() => {
    document.querySelectorAll('.home-link').forEach(link => {
        const zone = Array.from(link.classList).find(c => c.startsWith('home-link-') && c !== 'home-link');
        if (!zone) return;
        const hoverEl = document.querySelector('.home-hover-' + zone.replace('home-link-', ''));
        if (!hoverEl) return;

        const show = () => hoverEl.classList.add('is-visible');
        const hide = () => hoverEl.classList.remove('is-visible');
        link.addEventListener('mouseenter', show);
        link.addEventListener('mouseleave', hide);
        link.addEventListener('focus',      show);
        link.addEventListener('blur',       hide);
    });
})();

/* -------- Home illustration — scale fixed 1440×1080 canvas to cover viewport -------- */

(() => {
    const FRAME_W = 1440;
    const FRAME_H = 1080;
    const root = document.documentElement;

    const updateHomeScale = () => {
        const scale = Math.max(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H);
        root.style.setProperty('--home-scale', scale);
    };

    updateHomeScale();
    window.addEventListener('resize', updateHomeScale);
})();

/* -------- Estrela — botão de voltar -------- */

(() => {
    const star = document.querySelector('.star-home');
    if (!star) return;
    star.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        document.body.style.transition = 'opacity 0.35s ease';
        document.body.style.opacity = '0';
        setTimeout(() => {
            if (history.length > 1) history.back();
            else window.location.href = star.getAttribute('href') || 'index.html';
        }, 360);
    });
})();

/* -------- Page transitions -------- */

(() => {
    document.addEventListener('click', e => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank') return;
        e.preventDefault();
        document.body.style.transition = 'opacity 0.35s ease';
        document.body.style.opacity = '0';
        setTimeout(() => { window.location.href = href; }, 360);
    });
})();

/* -------- Realm panels — auto-open from URL hash (e.g. index.html#inferno) -------- */

(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const panel = document.querySelector(`.realm-panel-${hash}`);
    if (!panel) return;
    panel.classList.add('is-active');
    panel.setAttribute('aria-hidden', 'false');
    window.history.replaceState(null, '', window.location.pathname);
})();

/* -------- Realm panels — canticle overlays -------- */

(() => {
    const order   = ['inferno', 'purgatorio', 'paradiso'];
    const trigger = document.querySelector('.realm-trigger');
    if (!trigger) return;

    const panelFor = name => document.querySelector(`.realm-panel-${name}`);

    const show = name => {
        const panel = panelFor(name);
        if (!panel) return;
        panel.classList.add('is-active');
        panel.setAttribute('aria-hidden', 'false');
    };

    const hide = name => {
        const panel = panelFor(name);
        if (!panel) return;
        panel.classList.remove('is-active');
        panel.setAttribute('aria-hidden', 'true');
    };

    /* Trigger opens Inferno */
    trigger.addEventListener('click', () => show('inferno'));

    /* Back buttons — close this panel */
    document.querySelectorAll('.realm-back').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.closest('.realm-panel').dataset.realm;
            hide(name);
        });
    });

    /* Next buttons — open the next canticle on top */
    document.querySelectorAll('.realm-next').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.closest('.realm-panel').dataset.realm;
            const next = order[order.indexOf(name) + 1];
            if (next) show(next);
        });
    });

    /* Escape key closes the topmost active panel */
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        for (let i = order.length - 1; i >= 0; i--) {
            const panel = panelFor(order[i]);
            if (panel?.classList.contains('is-active')) { hide(order[i]); break; }
        }
    });
})();

/* -------- Popular Culture — transform-based horizontal pan -------- */

(() => {
    if (!document.body.classList.contains('popular-body')) return;

    const strip = document.querySelector('.popular-scroll');
    if (!strip) return;

    const fixedLayer = strip.querySelector('.pop-fixed');

    document.documentElement.style.overflow = 'hidden';

    const MAX = 2800 - window.innerWidth;
    let x = 0;

    function panTo(val) {
        x = Math.max(0, Math.min(MAX, val));
        strip.style.transform = `translateX(${-x}px)`;
        if (fixedLayer) fixedLayer.style.transform = `translateX(${x}px)`;
    }

    /* Wheel / trackpad */
    window.addEventListener('wheel', e => {
        e.preventDefault();
        panTo(x + e.deltaY + e.deltaX);
    }, { passive: false });

    /* Mouse drag */
    let dragStartX = null, dragStartScroll = 0;

    window.addEventListener('mousedown', e => {
        dragStartX = e.clientX;
        dragStartScroll = x;
    });
    window.addEventListener('mousemove', e => {
        if (dragStartX === null) return;
        panTo(dragStartScroll - (e.clientX - dragStartX));
    });
    window.addEventListener('mouseup', () => { dragStartX = null; });

    /* Touch */
    let touchStartX = null, touchStartScroll = 0;
    window.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartScroll = x;
    }, { passive: true });
    window.addEventListener('touchmove', e => {
        if (touchStartX === null) return;
        panTo(touchStartScroll - (e.touches[0].clientX - touchStartX));
    }, { passive: true });
    window.addEventListener('touchend', () => { touchStartX = null; });
})();

/* -------- Marcas d'água — sobem suavemente enquanto a página desce -------- */

(() => {
    ['.structure-watermark', '.criticism-watermark'].forEach(sel => {
        const watermark = document.querySelector(sel);
        if (!watermark) return;

        watermark.style.willChange = 'transform';
        let ticking = false;

        function update() {
            const el = watermark.getBoundingClientRect();
            const maxOffset = (window.innerHeight - el.height) / 2;
            const offset = Math.min(window.scrollY * 0.5, maxOffset);
            watermark.style.transform = `translateY(${offset}px)`;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });

        update();
    });
})();

/* -------- Canticles — painéis revelados pelo scroll -------- */

(() => {
    if (!document.body.classList.contains('canticles-body')) return;

    const purgatorio = document.getElementById('purgatorio');
    const paradiso   = document.getElementById('paradiso');
    if (!purgatorio || !paradiso) return;

    purgatorio.style.willChange = 'transform';
    paradiso.style.willChange   = 'transform';

    let ticking = false;

    function update() {
        const scrollY = window.scrollY;
        const vh      = window.innerHeight;

        const p1 = Math.max(0, Math.min(1, scrollY / vh));
        purgatorio.style.transform = `translateY(${(1 - p1) * -100}%)`;

        const p2 = Math.max(0, Math.min(1, (scrollY - vh) / vh));
        paradiso.style.transform = `translateY(${(1 - p2) * -100}%)`;

        document.body.classList.toggle('paradiso-active', p2 > 0);

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    update();
})();

/* -------- Mobile nav hamburger toggle -------- */

(() => {
    const toggle   = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        toggle.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });

    /* Close the menu when a link is tapped */
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('is-open');
            toggle.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open navigation');
        });
    });
})();
