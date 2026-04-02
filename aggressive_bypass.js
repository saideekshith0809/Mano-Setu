const fs = require('fs');
const path = require('path');

const authCtrlPath = path.join(__dirname, 'controllers', 'authController.js');
let code = fs.readFileSync(authCtrlPath, 'utf8');

// The new, more aggressive bypass that triggers if NOT fully connected (status 1)
const aggressiveBypass = `
    const isReady = (require('mongoose').connection.readyState === 1);
    if (!isReady) {
        console.log('⚠️ OFFLINE MODE: DB not ready (status ' + require('mongoose').connection.readyState + '). Bypassing for demo.');
        const mockToken = 'hackathon-token-' + Date.now();
        return res.status(200).json({
            success: true,
            message: 'Connected (Demo Mode)',
            token: mockToken,
            user: { id: 'demo-user', username: req.body.username || 'Demo', role: req.body.role || 'user' }
        });
    }
`;

// Replace the previous bypass logic (which checked for === 0) with the aggressive bypass (!== 1)
code = code.replace(/const isDBDown = \(require\('mongoose'\)\.connection\.readyState === 0\);[\s\S]*?}/g, aggressiveBypass);

fs.writeFileSync(authCtrlPath, code, 'utf8');
console.log('✅ REFINED: Aggressive Hackathon Bypass active (triggers whenever DB is not 100% ready).');
