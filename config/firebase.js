/**
 * ManoSetu - Firebase Firestore Configuration & Initialization
 * ==========================================================
 * Handles real Firebase Admin SDK setup with a Mock fallback for demos.
 */

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let db;

try {
  const serviceAccountPath = process.env.FIREBASE_KEY_PATH || path.join(__dirname, '..', 'serviceAccountKey.json');
  
  if (require('fs').existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('\x1b[32m✅ Firebase Connected: Real-time Cloud Firestore Active\x1b[0m');
  } else {
    throw new Error('MISSING_KEY');
  }
} catch (error) {
  console.log('\x1b[33m⚠️ Firebase Key Missing: Entering High-Fidelity Mock Mode.\x1b[0m');
  // Fallback to Mock Firestore
  const { MockFirestore } = require('../services/dbService');
  db = new MockFirestore();
}

module.exports = { admin, db };
