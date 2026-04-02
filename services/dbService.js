/**
 * ManoSetu - High-Fidelity Mock Firestore Service
 * ===============================================
 * Mimics the Firebase Firestore API to ensure the demo functions perfectly 
 * even if no real API keys are provided.
 */

class MockFirestore {
  constructor() {
    this.store = {
      users: [
        { id: 'u1', username: 'admin@villagecraft.in', password: 'password123', role: 'admin', fullName: 'Main Admin' },
        { id: 'u2', username: 'vol@manosetu.org', password: 'password123', role: 'volunteer', fullName: 'Volunteer Node' }
      ],
      sosAlerts: [],
      moodLogs: [],
      communities: [
        { id: 'c1', name: 'Anxiety Warriors', description: 'Brave hearts fighting stress.', icon: '🛡️', color: '#7c3aed', memberCount: 120 },
        { id: 'c2', name: 'Safe Space Support', description: 'Anonymous help and guidance.', icon: '🌊', color: '#0ea5e9', memberCount: 85 }
      ],
      messages: []
    };
  }

  collection(name) {
    if (!this.store[name]) this.store[name] = [];
    return new MockCollection(this.store[name]);
  }
}

class MockCollection {
  constructor(data) {
    this.data = data;
    this.filters = [];
  }

  where(field, op, val) {
    this.filters.push({ field, op, val });
    return this;
  }

  doc(id) {
    const existing = this.data.find(d => d.id === id);
    return new MockDocument(this.data, id, existing);
  }

  async get() {
    let filtered = [...this.data];
    this.filters.forEach(f => {
      if (f.op === '==') filtered = filtered.filter(item => item[f.field] === f.val);
      if (f.op === 'array-contains') filtered = filtered.filter(item => Array.isArray(item[f.field]) && item[f.field].includes(f.val));
    });
    return { docs: filtered.map(d => ({ id: d.id, data: () => d })), size: filtered.length, empty: filtered.length === 0 };
  }

  async add(obj) {
    const newDoc = { ...obj, id: 'mock-' + Math.random().toString(36).substr(2, 9) };
    this.data.push(newDoc);
    return { id: newDoc.id };
  }

  async count() {
    return { data: () => ({ count: this.data.length }) };
  }
}

class MockDocument {
  constructor(collectionData, id, existing) {
    this.collectionData = collectionData;
    this.id = id;
    this.existing = existing;
  }

  async get() {
    return { exists: !!this.existing, data: () => this.existing };
  }

  async set(obj, options = {}) {
    if (this.existing) Object.assign(this.existing, obj);
    else this.collectionData.push({ ...obj, id: this.id });
  }

  async update(obj) {
    if (this.existing) Object.assign(this.existing, obj);
  }
}

module.exports = { MockFirestore };
