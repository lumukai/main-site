document.addEventListener('DOMContentLoaded', () => {
    // Language Toggle Logic
    const currentLang = localStorage.getItem('lumukai_lang') || 'en';

    // Create Switcher Container
    const switcher = document.createElement('div');
    switcher.className = 'lang-switcher';

    // Helper to create buttons
    function createLangBtn(lang, label) {
        const btn = document.createElement('button');
        btn.className = 'lang-btn';
        if (currentLang === lang) btn.classList.add('active');
        btn.textContent = label;
        btn.addEventListener('click', () => {
            // Update Active State
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Switch Language
            localStorage.setItem('lumukai_lang', lang);
            updateLanguage(lang);
        });
        return btn;
    }

    const btnEn = createLangBtn('en', 'EN');
    const btnEs = createLangBtn('es', 'ES');

    switcher.appendChild(btnEn);
    switcher.appendChild(btnEs);

    // Always append to body (position: fixed in CSS)
    document.body.appendChild(switcher);

    function updateLanguage(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        const currentYear = new Date().getFullYear();
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                let translatedText = translations[lang][key];
                // Replace {year} placeholder with the current year
                translatedText = translatedText.replace(/{year}/g, currentYear);
                // Use innerHTML to preserve formatting like <strong>
                el.innerHTML = translatedText;
            }
        });

        // Handle data-i18n-html elements (feature lists with HTML content)
        const htmlElements = document.querySelectorAll('[data-i18n-html]');
        htmlElements.forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });
    }

    function updateCopyrightYear() {
        const yearSpans = document.querySelectorAll('#current-year');
        const currentYear = new Date().getFullYear();
        yearSpans.forEach(span => {
            span.textContent = currentYear;
        });
    }

    // Initial Translation
    updateLanguage(currentLang);
    updateCopyrightYear();

    // Video Facades & Filtering
    initVideoShowcase();

    // Screenshot Lightbox
    initLightbox();

    function initVideoShowcase() {
        const facades = document.querySelectorAll('.video-facade, .short-facade');
        facades.forEach(facade => {
            facade.addEventListener('click', (e) => {
                // Avoid re-creating if already playing
                if (facade.classList.contains('playing')) return;
                const videoId = facade.getAttribute('data-video-id');
                if (!videoId) return;
                const title = facade.getAttribute('data-title') || 'YouTube Video Player';

                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
                iframe.title = title;
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.setAttribute('loading', 'lazy');

                facade.innerHTML = '';
                facade.classList.add('playing');
                facade.appendChild(iframe);
            });
        });

        // Filter Pills
        const filterBtns = document.querySelectorAll('.filter-pill');
        if (filterBtns.length === 0) return;

        const spotlightCard = document.querySelector('.video-spotlight-card');
        const mainVideoCards = document.querySelectorAll('#main-video-grid .video-card');
        const shortVideoCards = document.querySelectorAll('#shorts-video-grid .short-card');
        const featuredHeading = document.querySelector('[data-i18n="featured_videos_heading"]') || document.querySelector('[data-i18n="music_videos_heading"]');
        const shortsHeading = document.querySelector('[data-i18n="shorts_videos_heading"]');
        const mainGrid = document.getElementById('main-video-grid');
        const shortsGrid = document.getElementById('shorts-video-grid');

        function matchesFilter(card, filter) {
            if (!card) return false;
            if (filter === 'all') return true;
            if (filter === 'project') return card.dataset.channel === 'project';
            if (filter === 'lumukai' || filter === 'official') return card.dataset.channel === 'lumukai' || card.dataset.channel === 'official';
            return true;
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');

                // Filter spotlight card
                if (spotlightCard) {
                    if (matchesFilter(spotlightCard, filter)) {
                        spotlightCard.classList.remove('hidden-card');
                    } else {
                        spotlightCard.classList.add('hidden-card');
                    }
                }

                // Filter main video cards
                let visibleMainCount = 0;
                mainVideoCards.forEach(card => {
                    if (matchesFilter(card, filter)) {
                        card.classList.remove('hidden-card');
                        visibleMainCount++;
                    } else {
                        card.classList.add('hidden-card');
                    }
                });

                if (featuredHeading && mainGrid) {
                    if (visibleMainCount === 0) {
                        featuredHeading.style.display = 'none';
                        mainGrid.style.display = 'none';
                    } else {
                        featuredHeading.style.display = '';
                        mainGrid.style.display = '';
                    }
                }

                // Filter shorts cards
                let visibleShortsCount = 0;
                shortVideoCards.forEach(card => {
                    if (matchesFilter(card, filter)) {
                        card.classList.remove('hidden-card');
                        visibleShortsCount++;
                    } else {
                        card.classList.add('hidden-card');
                    }
                });

                if (shortsHeading && shortsGrid) {
                    if (visibleShortsCount === 0) {
                        shortsHeading.style.display = 'none';
                        shortsGrid.style.display = 'none';
                    } else {
                        shortsHeading.style.display = '';
                        shortsGrid.style.display = '';
                    }
                }
            });
        });
    }

    function initLightbox() {
        const carousels = document.querySelectorAll('.screenshot-carousel');
        if (carousels.length === 0) return;

        // Build lightbox DOM
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <button class="lightbox-nav lightbox-prev" aria-label="Previous">&#8249;</button>
            <img class="lightbox-img" src="" alt="Screenshot preview">
            <button class="lightbox-nav lightbox-next" aria-label="Next">&#8250;</button>
            <div class="lightbox-counter"></div>
        `;
        document.body.appendChild(overlay);

        const lightboxImg = overlay.querySelector('.lightbox-img');
        const lightboxCounter = overlay.querySelector('.lightbox-counter');
        const btnClose = overlay.querySelector('.lightbox-close');
        const btnPrev = overlay.querySelector('.lightbox-prev');
        const btnNext = overlay.querySelector('.lightbox-next');

        let currentImages = [];
        let currentIndex = 0;

        function openLightbox(images, index) {
            currentImages = images;
            currentIndex = index;
            showImage();
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        function showImage() {
            lightboxImg.src = currentImages[currentIndex];
            lightboxCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
        }

        function nextImage() {
            currentIndex = (currentIndex + 1) % currentImages.length;
            showImage();
        }

        function prevImage() {
            currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            showImage();
        }

        // Attach click handlers to each screenshot
        carousels.forEach(carousel => {
            const imgs = carousel.querySelectorAll('img');
            imgs.forEach((img, idx) => {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    const srcs = Array.from(imgs).map(i => i.src);
                    openLightbox(srcs, idx);
                });
            });
        });

        // Lightbox controls
        btnClose.addEventListener('click', closeLightbox);
        btnNext.addEventListener('click', nextImage);
        btnPrev.addEventListener('click', prevImage);

        // Close on clicking the dark backdrop (not the image or buttons)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!overlay.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });
    }
});
