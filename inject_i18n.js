const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const i18nScriptTag = '<script src="/i18n.js"></script>';
const langSwitcher = `
    <!-- Native i18n Switcher -->
    <div style="display: flex; gap: 8px; margin-left: 20px; background: #f1f5f9; padding: 4px; border-radius: 10px;">
        <button class="lang-btn" onclick="window.setLang('en')" style="border: none; background: transparent; cursor: pointer; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 6px;">EN</button>
        <button class="lang-btn" onclick="window.setLang('hi')" style="border: none; background: transparent; cursor: pointer; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 6px;">HI</button>
        <button class="lang-btn" onclick="window.setLang('te')" style="border: none; background: transparent; cursor: pointer; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 6px;">TE</button>
    </div>
    <style>
        .lang-btn.active { background: #7c3aed !important; color: white !important; }
        .lang-btn:hover:not(.active) { background: #e2e8f0; }
    </style>
`;

fs.readdir(publicDir, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(publicDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // 1. Remove Google Translate
            content = content.replace(/<!-- Google Translate Widget[\s\S]*?<\/style>/g, '');
            content = content.replace(/<div id="google_translate_element"[\s\S]*?<\/style>/g, '');
            content = content.replace(/<script type="text\/javascript" src="\/\/translate\.google\.com[\s\S]*?<\/script>/g, '');
            content = content.replace(/<script[\s\S]*?googleTranslateElementInit[\s\S]*?<\/script>/g, '');

            // 2. Inject i18n Script
            if (!content.includes('i18n.js')) {
                content = content.replace('</head>', i18nScriptTag + '\n</head>');
            }

            // 3. Inject Switcher & i18n Attributes
            if (!content.includes('Native i18n Switcher')) {
                // Insert before first logout button or before </nav>
                if (content.includes('Logout')) {
                    content = content.replace(/(?=<button[^>]*>Logout)/, langSwitcher);
                } else {
                    content = content.replace('</nav>', langSwitcher + '\n</nav>');
                }
            }

            // 4. Add data-t attributes to common elements
            content = content.replace(/>Home<\/a>/, ' data-t="nav_home">Home</a>');
            content = content.replace(/>Wellness<\/a>/, ' data-t="nav_wellness">Wellness</a>');
            content = content.replace(/>Book Session<\/a>/, ' data-t="nav_booking">Book Session</a>');
            content = content.replace(/>Dashboard<\/a>/, ' data-t="nav_dashboard">Dashboard</a>');
            content = content.replace(/>Community<\/a>/, ' data-t="nav_community">Community</a>');
            content = content.replace(/>Safe Board<\/a>/, ' data-t="nav_community">Safe Board</a>');
            content = content.replace(/>Sessions<\/a>/, ' data-t="nav_booking">Sessions</a>');
            content = content.replace(/>SOS<\/button>/, ' data-t="nav_sos">SOS</button>');
            content = content.replace(/>Logout<\/button>/, ' data-t="nav_logout">Logout</button>');
            
            // Homepage / Landing Page Comprehensive Tagging
            content = content.replace(/<h3>AI Companion<\/h3>/, '<h3 data-t="card_ai_title">AI Companion</h3>');
            content = content.replace(/<p>CBT \+ DBT powered support in Hindi & English<\/p>/, '<p data-t="card_ai_desc">CBT + DBT powered support in Hindi & English</p>');
            content = content.replace(/<h3>Mood Tracker<\/h3>/, '<h3 data-t="card_mood_title">Mood Tracker</h3>');
            content = content.replace(/<p>Daily emotional check-ins with AI insights<\/p>/, '<p data-t="card_mood_desc">Daily emotional check-ins with AI insights</p>');
            content = content.replace(/<h3>100% Private<\/h3>/, '<h3 data-t="card_privacy_title">100% Private</h3>');
            content = content.replace(/<p>Anonymous identity — no names, no judgement<\/p>/, '<p data-t="card_privacy_desc">Anonymous identity — no names, no judgement</p>');
            
            // Trust Strip
            content = content.replace(/<strong>100% Private<\/strong>/, '<strong data-t="trust_privacy">100% Private</strong>');
            content = content.replace(/DPDP compliant<\/div>/, '<span data-t="trust_privacy_sub">DPDP compliant</span></div>');
            content = content.replace(/<strong>24\/7 AI Support<\/strong>/, '<strong data-t="trust_ai">24/7 AI Support</strong>');
            content = content.replace(/Always here<\/div>/, '<span data-t="trust_ai_sub">Always here</span></div>');
            content = content.replace(/<strong>Hindi \+ English<\/strong>/, '<strong data-t="trust_lang">Hindi + English</strong>');
            content = content.replace(/Bilingual support<\/div>/, '<span data-t="trust_lang_sub">Bilingual support</span></div>');
            content = content.replace(/<strong>50,000\+ Youth<\/strong>/, '<strong data-t="trust_youth">50,000+ Youth</strong>');
            content = content.replace(/Community members<\/div>/, '<span data-t="trust_youth_sub">Community members</span></div>');
            content = content.replace(/<strong>Early Intervention<\/strong>/, '<strong data-t="trust_early">Early Intervention</strong>');
            content = content.replace(/Real-time alerts<\/div>/, '<span data-t="trust_early_sub">Real-time alerts</span></div>');

            // Features Section
            content = content.replace(/<div class="section-tag">Core Features<\/div>/, '<div class="section-tag" data-t="sec_tag_features">Core Features</div>');
            content = content.replace(/<h2 class="section-title">Everything You Need,<br><span class="grad">Nothing You Don't<\/span><\/h2>/, '<h2 class="section-title" data-t="sec_title_features">Everything You Need, Nothing You Don\'t</h2>');
            content = content.replace(/<p class="section-desc">Designed for real struggles. Built with empathy. Powered by science.<\/p>/, '<p class="section-desc" data-t="sec_desc_features">Designed for real struggles. Built with empathy. Powered by science.</p>');

            content = content.replace(/<h3>AI Chatbot<\/h3>/, '<h3 data-t="feat_ai_chat">AI Chatbot</h3>');
            content = content.replace(/<p>CBT & DBT-backed conversations. Context memory. Voice \+ text. Hindi & English.<\/p>/, '<p data-t="feat_ai_chat_desc">CBT & DBT-backed conversations. Context memory. Voice + text.</p>');
            content = content.replace(/<h3>Mood Analytics<\/h3>/, '<h3 data-t="feat_mood_analytics">Mood Analytics</h3>');
            content = content.replace(/<p>Daily tracking, mental health scores, pattern detection, AI-generated insights.<\/p>/, '<p data-t="feat_mood_analytics_desc">Daily tracking, mental health scores, pattern detection, AI-generated insights.</p>');
            content = content.replace(/<h3>Safe Board<\/h3>/, '<h3 data-t="feat_safe_board">Safe Board</h3>');
            content = content.replace(/<p>Anonymous message board. Ask questions, get advice from vetted mentors.<\/p>/, '<p data-t="feat_safe_board_desc">Anonymous message board. Ask questions, get advice from vetted mentors.</p>');
            content = content.replace(/<h3>Support Guides<\/h3>/, '<h3 data-t="feat_support_guides">Support Guides</h3>');
            content = content.replace(/<p>Talk to approved, friendly guides who understand your journey.<\/p>/, '<p data-t="feat_support_guides_desc">Talk to approved, friendly guides who understand your journey.</p>');
            content = content.replace(/<h3>Care Center<\/h3>/, '<h3 data-t="feat_care_center">Care Center</h3>');
            content = content.replace(/<p>Live community wellbeing stats for our partners to help you better.<\/p>/, '<p data-t="feat_care_center_desc">Live community wellbeing stats for our partners to help you better.</p>');
            content = content.replace(/<h3>Safety Shield<\/h3>/, '<h3 data-t="feat_safety_shield">Safety Shield</h3>');
            content = content.replace(/<p>Our smart system monitors for stress signals to keep you safe always.<\/p>/, '<p data-t="feat_safety_shield_desc">Our smart system monitors for stress signals to keep you safe always.</p>');

            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Refactored ' + file + ' to Native i18n (EN/HI/TE)');
        }
    });
});
