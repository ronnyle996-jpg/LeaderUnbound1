document.addEventListener('DOMContentLoaded', () => {

    /* ── Navbar scroll ─────────────────────────────── */
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Reveal on scroll ──────────────────────────── */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ── Phase cards: tap to expand on mobile ─────── */
    const roadmapPhases = document.querySelector('.roadmap-phases');
    const phaseCards = document.querySelectorAll('.phase-card');

    const isCompactPhases = () => window.matchMedia('(max-width: 760px)').matches;

    if (roadmapPhases && phaseCards.length) {
        phaseCards.forEach((card) => {
            card.addEventListener('click', (e) => {
                if (!isCompactPhases()) return;

                e.stopPropagation();
                const expanded = card.classList.contains('is-expanded');

                phaseCards.forEach((c) => c.classList.remove('is-expanded'));

                if (!expanded) {
                    card.classList.add('is-expanded');
                    card.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'center',
                        block: 'nearest',
                    });
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!roadmapPhases.contains(e.target)) {
                phaseCards.forEach((c) => c.classList.remove('is-expanded'));
            }
        });

        window.addEventListener('resize', () => {
            if (!isCompactPhases()) {
                phaseCards.forEach((c) => c.classList.remove('is-expanded'));
            }
        }, { passive: true });
    }

    /* ── Gold floating particles in hero ──────────── */
    const particleContainer = document.getElementById('particles');
    if (particleContainer) {
        const createParticle = () => {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 3 + 1;
            const left = Math.random() * 100;
            const duration = Math.random() * 8 + 6;
            const delay = Math.random() * 10;
            p.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                bottom: ${Math.random() * 40}%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                opacity: 0;
            `;
            particleContainer.appendChild(p);
        };
        for (let i = 0; i < 28; i++) createParticle();
    }

    /* ── Smooth anchor scroll with offset ─────────── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ── Metric counter animation ──────────────────── */
    const metrics = document.querySelectorAll('.metric-num');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    metrics.forEach(m => counterObserver.observe(m));

    /* ── Form submit (Google Sheets Integration) ──── */
    const form = document.getElementById('cta-form');
    // BƯỚC 1: Thay thế đường link bên dưới bằng URL Web App của bạn
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2ambHWd-OvTid0EgzVJuKc7bExh13KSC_5DMtut0y3iPvGFp2iHoDpAcxT5puYfRWLw/exec';

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            // Đổi trạng thái button
            btn.textContent = 'Đang gửi thông tin...';
            btn.disabled = true;

            // Lấy dữ liệu từ form
            const formData = new FormData(form);

            try {
                // Gửi dữ liệu tới Google Sheets
                await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Cần thiết để tránh lỗi CORS khi gọi từ trình duyệt
                    body: formData
                });

                // Thành công (vì no-cors không trả về status, ta giả định gọi fetch không lỗi mạng là thành công)
                btn.textContent = '✓ Đã đăng ký thành công!';
                btn.style.background = 'linear-gradient(135deg, #7ecb87, #2e7d40)';
                
                setTimeout(() => {
                    form.reset();
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 5000);

            } catch (error) {
                // Lỗi mạng
                console.error('Lỗi khi gửi form:', error);
                btn.textContent = 'Lỗi kết nối. Vui lòng thử lại!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 3000);
            }
        });
    }

});

/* ── Spotify Background Music Logic ─────────────────── */
window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const element = document.getElementById('embed-iframe');
    if (!element) return;
    
    const options = {
        uri: 'spotify:track:0ky0FSvjcDJ5YYcIPJncIT'
    };
    
    const callback = (EmbedController) => {
        const musicBtn = document.getElementById('music-toggle');
        if (!musicBtn) return;

        const musicStatus = musicBtn.querySelector('.music-status');
        const iconOn = document.getElementById('music-icon-on');
        const iconOff = document.getElementById('music-icon-off');
        let hasStarted = false;
        let userToggled = false;

        const setMusicState = (isPlaying) => {
            musicBtn.classList.toggle('playing', isPlaying);
            musicStatus.textContent = isPlaying ? 'ON' : 'OFF';
            iconOn.style.display = isPlaying ? 'block' : 'none';
            iconOff.style.display = isPlaying ? 'none' : 'block';
        };

        const tryAutoplay = () => {
            if (hasStarted) return;
            try {
                setMusicState(true);
                EmbedController.play();
                musicBtn.classList.add('is-autoplaying');
            } catch (error) {
                console.warn('Spotify autoplay was blocked by the browser:', error);
            }
        };

        const unlockAutoplay = () => {
            tryAutoplay();
            window.removeEventListener('pointerdown', unlockAutoplay);
            window.removeEventListener('keydown', unlockAutoplay);
            window.removeEventListener('touchstart', unlockAutoplay);
        };

        musicBtn.addEventListener('click', () => {
            userToggled = true;
            EmbedController.togglePlay();
        });

        EmbedController.addListener('playback_update', e => {
            const isPlaying = !e.data.isPaused;
            hasStarted = hasStarted || isPlaying;
            musicBtn.classList.remove('is-autoplaying');
            if (!userToggled && !hasStarted) return;
            setMusicState(isPlaying);
        });

        setMusicState(true);
        tryAutoplay();
        window.addEventListener('pointerdown', unlockAutoplay, { once: true, passive: true });
        window.addEventListener('touchstart', unlockAutoplay, { once: true, passive: true });
        window.addEventListener('keydown', unlockAutoplay, { once: true });
    };
    
    IFrameAPI.createController(element, options, callback);
};
