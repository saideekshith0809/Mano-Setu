const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add notranslate to lang-btn buttons so Google Translate doesn't touch them
    const before = content;
    content = content.replace(/class="lang-btn"/g, 'class="lang-btn notranslate"');
    // Don't double-add if already has notranslate
    content = content.replace(/class="lang-btn notranslate notranslate"/g, 'class="lang-btn notranslate"');
    
    if (content !== before) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed: ' + file);
    } else {
        console.log('Skipped (no change): ' + file);
    }
});

console.log('Done!');
