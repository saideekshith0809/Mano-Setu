const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// 1. Ensure Index.html has the 8-card grid pointing to separate pages
let indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

const linkUpdates = [
    { old: 'onclick="openChat()"', new: 'onclick="window.location.href=\'/chat.html\'"' },
    { old: 'onclick="window.location.href=\'/community.html\'"', new: 'onclick="window.location.href=\'/community.html\'"' },
    { old: 'onclick="window.location.href=\'/booking.html\'"', new: 'onclick="window.location.href=\'/booking.html\'"' },
    { old: 'onclick="window.location.href=\'/dashboard.html\'"', new: 'onclick="window.location.href=\'/dashboard.html\'"' },
    { old: 'onclick="openSOS()"', new: 'onclick="window.location.href=\'/safety.html\'"' },
    { old: 'onclick="openVoice()"', new: 'onclick="window.location.href=\'/voice.html\'"' }
];

linkUpdates.forEach(u => { indexHtml = indexHtml.split(u.old).join(u.new); });

// Update Progress card to check role and GO TO NGO-DASHBOARD IF ADMIN
indexHtml = indexHtml.replace('onclick="window.location.href=\'/dashboard.html\'"', 'onclick="const r=localStorage.getItem(\'manosetu-role\'); window.location.href=(r===\'admin\'?\'/ngo-dashboard.html\':\'/dashboard.html\');"');

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);

console.log('✅ ALL FEATURE LINKS IN INDEX.HTML ARE NOW CORRECT.');
