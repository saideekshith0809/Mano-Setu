// ============================================================
// ManoSetu i18n — Google Translate Powered (Translates EVERYTHING)
// ============================================================

(function() {
    // Inject Google Translate script
    var gtScript = document.createElement('script');
    gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateInit';
    document.head.appendChild(gtScript);

    // Hidden Google Translate widget (we control it with our own buttons)
    window.googleTranslateInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,te',
            autoDisplay: false
        }, 'google_translate_element');
    };

    // Create hidden container for Google Translate widget
    document.addEventListener('DOMContentLoaded', function() {
        var gtDiv = document.createElement('div');
        gtDiv.id = 'google_translate_element';
        gtDiv.style.cssText = 'position:absolute; top:-9999px; left:-9999px;';
        document.body.appendChild(gtDiv);

        // Hide Google Translate top bar
        var style = document.createElement('style');
        style.textContent = [
            '.goog-te-banner-frame { display: none !important; }',
            'body { top: 0 !important; }',
            '.goog-te-gadget { display: none !important; }',
            '.skiptranslate { display: none !important; }',
            'body { top: 0px !important; }',
            '#goog-gt-tt { display: none !important; }',
            '.goog-te-balloon-frame { display: none !important; }',
            '.goog-text-highlight { background: none !important; box-shadow: none !important; }',
            
            /* Premium Language Dropdown Styles */
            '.lang-dropdown { position: relative; display: inline-block; font-family: "Sora", sans-serif; margin-left: 15px; }',
            '.lang-drop-btn { background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.08); padding: 8px 16px; border-radius: 100px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; color: #1a1a2e; backdrop-filter: blur(8px); transition: 0.2s; }',
            '.lang-drop-btn:hover { background: white; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }',
            '.lang-drop-btn svg { width: 16px; height: 16px; color: #7c3aed; }',
            '.lang-menu { display: none; position: absolute; top: 120%; right: 0; background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 140px; padding: 8px; z-index: 2000; border: 1px solid rgba(0,0,0,0.03); transform: translateY(10px); transition: all 0.2s ease; }',
            '.lang-menu.show { display: block; transform: translateY(0); opacity: 1; }',
            '.lang-item { padding: 10px 14px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; display: flex; align-items: center; justify-content: space-between; color: #64748b; }',
            '.lang-item:hover { background: #f8f9fc; color: #7c3aed; }',
            '.lang-item.active { background: #f1f5f9; color: #1a1a2e; }',
            '.lang-item.active::after { content: "✓"; font-size: 11px; color: #7c3aed; }'
        ].join('\n');
        document.head.appendChild(style);

        // Restore saved language on page load
        var saved = localStorage.getItem('manosetu-lang') || 'en';
        if (saved !== 'en') {
            // Wait for Google Translate to load, then trigger translation
            var attempts = 0;
            var interval = setInterval(function() {
                attempts++;
                if (attempts > 30) { clearInterval(interval); return; }
                var select = document.querySelector('.goog-te-combo');
                if (select) {
                    select.value = saved;
                    select.dispatchEvent(new Event('change'));
                    clearInterval(interval);
                }
            }, 300);
        }

        // Highlight active language button
        highlightActiveBtn(saved);
    });

    function highlightActiveBtn(lang) {
        // Dropdown Highlight Logic
        document.querySelectorAll('.lang-select-item').forEach(function(item) {
            var itemLang = item.getAttribute('data-lang');
            if (itemLang === lang) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Current Lang Label Update
        var label = document.getElementById('currentLangLabel');
        if (label) {
            var map = { 'en': 'English', 'hi': 'Hindi', 'te': 'Telugu' };
            label.textContent = map[lang] || 'Language';
        }

        // Legacy highlight for old buttons
        document.querySelectorAll('.lang-btn').forEach(function(btn) {
            var onclick = btn.getAttribute('onclick') || '';
            if (onclick.indexOf("'" + lang + "'") !== -1 || onclick.indexOf('"' + lang + '"') !== -1) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Toggle Dropdown
    window.toggleLangDropdown = function(e) {
        if (e) e.stopPropagation();
        var menu = document.getElementById('langDropdownMenu');
        if (menu) menu.classList.toggle('show');
    };

    // Close on click outside
    document.addEventListener('click', function() {
        var menu = document.getElementById('langDropdownMenu');
        if (menu) menu.classList.remove('show');
    });

    // Global setLang function — triggers Google Translate
    window.setLang = function(lang) {
        localStorage.setItem('manosetu-lang', lang);

        if (lang === 'en') {
            // Reset to English — remove Google Translate cookie and reload
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
            window.location.reload();
            return;
        }

        // Try to use Google Translate dropdown
        var select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = lang;
            select.dispatchEvent(new Event('change'));
            highlightActiveBtn(lang);
        } else {
            // If Google Translate isn't loaded yet, reload and let it pick up from localStorage
            window.location.reload();
        }
    };
})();
