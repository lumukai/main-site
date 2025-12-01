document.addEventListener('DOMContentLoaded', () => {
    // --- Language Toggle Logic ---
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

    // Append to .legal-container if it exists (so it scrolls with content), otherwise body
    const legalContainer = document.querySelector('.legal-container');
    if (legalContainer) {
        legalContainer.appendChild(switcher);
        // Ensure container has relative positioning (it does in CSS, but good to be safe if we rely on it)
        // legalContainer.style.position = 'relative'; 
    } else {
        document.body.appendChild(switcher);
    }

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


    // --- Existing Mouse Movement Effect (Only for Index) ---
    const welcomeText = document.querySelector('.welcome-text');
    if (welcomeText) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;

            welcomeText.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
});
