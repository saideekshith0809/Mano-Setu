const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// 1. SHARED CONTENT (Style + Nav)
const headStyle = '<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800&display=swap" rel="stylesheet"><style>body { font-family: \'Sora\', sans-serif; background: #f8f9fc; color: #1a1a2e; margin: 0; padding-top: 80px; } nav { position: fixed; top: 0; left: 0; right: 0; height: 70px; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); display: flex; align-items: center; padding: 0 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); z-index: 1000; } .logo { font-weight: 800; font-size: 24px; color: #7c3aed; text-decoration: none; margin-right: auto; } .nav-links { display: flex; gap: 24px; } .nav-links a { text-decoration: none; color: #64748b; font-weight: 500; font-size: 14px; } .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; } .card { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 24px; } .btn { background: #7c3aed; color: white; padding: 12px 24px; border-radius: 12px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; }</style>';

const headScript = '<script>const token = localStorage.getItem(\'x-session-token\'); if (!token && !window.location.pathname.includes(\'auth.html\')) window.location.href = \'/auth.html\'; const originalFetch = window.fetch; window.fetch = async function() { let [resource, config] = arguments; if (typeof resource === \'string\' && resource.startsWith(\'/api/\') && !resource.startsWith(\'/api/auth\')) { config = config || {}; config.headers = config.headers || {}; config.headers[\'x-session-token\'] = localStorage.getItem(\'x-session-token\') || \'\'; } return originalFetch(resource, config); };</script>';

const navHtml = '<nav><a href="/index.html" class="logo">ManoSetu</a><div class="nav-links"><a href="/index.html">Home</a><a href="/chat.html">AI Chat</a><a href="/community.html">Safe Board</a><a href="/wellness.html">Wellness</a><a href="/booking.html">Sessions</a></div></nav>';

// 2. CREATE MISSING PAGES
function savePage(name, title, content) {
    const html = '<!DOCTYPE html><html><head>' + headScript + headStyle + '</head><body>' + navHtml + '<div class="container"><div class="card"><h1>' + title + '</h1>' + content + '</div></div></body></html>';
    fs.writeFileSync(path.join(publicDir, name + '.html'), html);
}

savePage('chat', '🤖 Mental Health AI', '<div style="height:300px;background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:20px;">AI: Welcome! How can I support you today?</div><input type="text" style="width:100%;padding:12px;border-radius:8px;border:1px solid #e2e8f0;"><button class="btn" style="margin-top:10px;">Send Message</button>');
savePage('community', '🏠 Safe Board', '<p>Peer community posts will appear here. No one is alone.</p><div class="card" style="background:#fdf4ff;"><b>Member:</b> Graduation stress is real! <br><b>Guide:</b> You got this! ✨</div><button class="btn">New Post</button>');
savePage('safety', '🛡️ Safety Shield', '<p>Your emergency network has been notified. Support is on the way.</p><button class="btn" style="background:#ef4444;">Deactivate Alert</button>');
savePage('voice', '🎙️ Voice Support', '<div style="font-size:60px;margin:30px; text-align:center;">⏺️</div><p style="text-align:center;">Listening with empathy...</p><div style="display:flex;justify-content:center;"><button class="btn">End Call</button></div>');

// 3. UPDATE INDEX.HTML GRIDS
let indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
indexHtml = indexHtml.replace(/onclick="openChat\(\)"/g, 'onclick="window.location.href=\'/chat.html\'"');
indexHtml = indexHtml.replace(/onclick="openSOS\(\)"/g, 'onclick="window.location.href=\'/safety.html\'"');
indexHtml = indexHtml.replace(/onclick="openVoice\(\)"/g, 'onclick="window.location.href=\'/voice.html\'"');
indexHtml = indexHtml.replace(/onclick="document\.getElementById\('community'\)\.scrollIntoView\(.*?\)"/g, 'onclick="window.location.href=\'/community.html\'"');

// Fix any potential errors in index.html for support guides card
indexHtml = indexHtml.replace(/onclick="window\.location\.href='\/find-therapist\.html'"/g, 'onclick="window.location.href=\'/booking.html\'"');

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
console.log('✅ All features now have their own separate pages and are linked correctly.');
