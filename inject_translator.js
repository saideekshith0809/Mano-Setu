const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const widgetCode = `
<!-- Google Translate Widget (Customized) -->
<div id="google_translate_element" style="position: fixed; bottom: 30px; right: 30px; z-index: 10001; background: #ffffff; padding: 12px; border-radius: 14px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.06); transform: scale(1.05);"></div>
<script type="text/javascript">
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en', 
    includedLanguages: 'hi,te,en', 
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    autoDisplay: false
  }, 'google_translate_element');
}
</script>
<script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
<style>
  body { top: 0 !important; }
  .skiptranslate iframe { display: none !important; }
  #goog-gt-tt { display: none !important; }
  .goog-te-gadget { font-family: 'Outfit', 'Sora', sans-serif !important; color: transparent !important; }
  .goog-te-gadget .goog-te-combo { margin: 0; padding: 8px 12px; border-radius: 10px; border: 1px solid #e2e8f0; font-family: inherit; font-size: 14px; outline: none; background: #f8fafc; color: #1e293b; cursor: pointer; }
  #google_translate_element:hover { transform: scale(1.08); transition: transform 0.2s; }
</style>
`;

fs.readdir(publicDir, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(publicDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Clean up any existing translator blocks
            if (content.includes('google_translate_element')) {
              console.log('Replacing existing translator in ' + file);
              content = content.replace(/<!-- Google Translate Widget[\s\S]*?<\/style>/g, '');
              content = content.replace(/<div id="google_translate_element"[\s\S]*?<\/style>/g, '');
            }

            if (content.includes('</body>')) {
                content = content.replace('</body>', widgetCode + '\n</body>');
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Injected fresh 3-lang translator into ' + file);
            }
        }
    });
});
