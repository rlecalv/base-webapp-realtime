#!/usr/bin/env node

/**
 * Script de test pour les fonctionnalités d'export
 * Usage: node test_exports.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:8000/api/v1';
let authToken = '';

// Configuration de test
const testConfig = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@test.com'
};

// Utilitaires
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${colors.reset}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Authentification
async function authenticate() {
  try {
    log('Tentative de connexion...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: testConfig.username,
      password: testConfig.password
    });
    
    authToken = response.data.token;
    log('Authentification réussie', 'success');
    return true;
  } catch (error) {
    log('Échec de l\'authentification, tentative de création de compte...', 'warning');
    
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        username: testConfig.username,
        password: testConfig.password,
        email: testConfig.email
      });
      
      log('Compte créé, nouvelle tentative de connexion...');
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: testConfig.username,
        password: testConfig.password
      });
      
      authToken = loginResponse.data.token;
      log('Authentification réussie après création de compte', 'success');
      return true;
    } catch (registerError) {
      log(`Erreur lors de la création de compte: ${registerError.message}`, 'error');
      return false;
    }
  }
}

// Configuration des headers avec token
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
});

// Test de santé du service d'export
async function testExportHealth() {
  try {
    log('Test de santé du service d\'export...');
    const response = await axios.get(`${API_BASE_URL}/exports/health`, {
      headers: getAuthHeaders()
    });
    
    log(`Statut du service: ${JSON.stringify(response.data.status, null, 2)}`, 'success');
    return true;
  } catch (error) {
    log(`Erreur lors du test de santé: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test des formats d'export
async function testExportFormats() {
  try {
    log('Récupération des formats d\'export...');
    const response = await axios.get(`${API_BASE_URL}/exports/formats`, {
      headers: getAuthHeaders()
    });
    
    log(`Formats disponibles: ${response.data.formats.map(f => f.key).join(', ')}`, 'success');
    return response.data.formats;
  } catch (error) {
    log(`Erreur lors de la récupération des formats: ${error.response?.data?.message || error.message}`, 'error');
    return [];
  }
}

// Test d'export des utilisateurs
async function testUserExport(format = 'excel') {
  try {
    log(`Test d'export des utilisateurs en format ${format}...`);
    const response = await axios.get(`${API_BASE_URL}/exports/users?format=${format}`, {
      headers: getAuthHeaders(),
      responseType: 'blob'
    });
    
    const filename = `test_users_export.${format === 'excel' ? 'xlsx' : format}`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, response.data);
    log(`Export utilisateurs sauvegardé: ${filepath}`, 'success');
    return true;
  } catch (error) {
    log(`Erreur lors de l'export des utilisateurs: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test d'export des messages
async function testMessageExport(format = 'excel') {
  try {
    log(`Test d'export des messages en format ${format}...`);
    const response = await axios.get(`${API_BASE_URL}/exports/messages?format=${format}`, {
      headers: getAuthHeaders(),
      responseType: 'blob'
    });
    
    const filename = `test_messages_export.${format === 'excel' ? 'xlsx' : format}`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, response.data);
    log(`Export messages sauvegardé: ${filepath}`, 'success');
    return true;
  } catch (error) {
    log(`Erreur lors de l'export des messages: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test d'export des statistiques
async function testStatisticsExport(format = 'pdf') {
  try {
    log(`Test d'export des statistiques en format ${format}...`);
    const response = await axios.get(`${API_BASE_URL}/exports/statistics?format=${format}`, {
      headers: getAuthHeaders(),
      responseType: 'blob'
    });
    
    const filename = `test_statistics_export.${format}`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, response.data);
    log(`Export statistiques sauvegardé: ${filepath}`, 'success');
    return true;
  } catch (error) {
    log(`Erreur lors de l'export des statistiques: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Test d'export personnalisé
async function testCustomExport() {
  try {
    log('Test d\'export personnalisé...');
    const testData = [
      { nom: 'Test 1', valeur: 100, date: new Date().toISOString() },
      { nom: 'Test 2', valeur: 200, date: new Date().toISOString() },
      { nom: 'Test 3', valeur: 300, date: new Date().toISOString() }
    ];
    
    const response = await axios.post(`${API_BASE_URL}/exports/custom`, {
      data: testData,
      format: 'csv',
      filename: 'test_custom_export.csv'
    }, {
      headers: getAuthHeaders(),
      responseType: 'blob'
    });
    
    const filepath = path.join(__dirname, 'test_custom_export.csv');
    fs.writeFileSync(filepath, response.data);
    log(`Export personnalisé sauvegardé: ${filepath}`, 'success');
    return true;
  } catch (error) {
    log(`Erreur lors de l'export personnalisé: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Créer quelques messages de test
async function createTestMessages() {
  try {
    log('Création de messages de test...');
    const messages = [
      'Message de test 1 pour l\'export',
      'Message de test 2 avec émojis 🚀📊',
      'Message de test 3 avec du contenu plus long pour tester l\'export des données'
    ];
    
    for (const content of messages) {
      await axios.post(`${API_BASE_URL}/messages`, { content }, {
        headers: getAuthHeaders()
      });
      await sleep(100); // Petite pause entre les messages
    }
    
    log(`${messages.length} messages de test créés`, 'success');
    return true;
  } catch (error) {
    log(`Erreur lors de la création des messages: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Fonction principale de test
async function runTests() {
  log('=== DÉBUT DES TESTS D\'EXPORT ===');
  
  // Vérifier que le serveur est accessible
  try {
    await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    log('Serveur accessible', 'success');
  } catch (error) {
    log('Serveur non accessible. Assurez-vous que l\'application est démarrée.', 'error');
    process.exit(1);
  }
  
  // Authentification
  if (!(await authenticate())) {
    log('Impossible de s\'authentifier', 'error');
    process.exit(1);
  }
  
  let successCount = 0;
  let totalTests = 0;
  
  // Tests
  const tests = [
    { name: 'Santé du service', fn: testExportHealth },
    { name: 'Formats d\'export', fn: testExportFormats },
    { name: 'Création de messages test', fn: createTestMessages },
    { name: 'Export utilisateurs (Excel)', fn: () => testUserExport('excel') },
    { name: 'Export utilisateurs (CSV)', fn: () => testUserExport('csv') },
    { name: 'Export utilisateurs (PDF)', fn: () => testUserExport('pdf') },
    { name: 'Export messages (Excel)', fn: () => testMessageExport('excel') },
    { name: 'Export messages (CSV)', fn: () => testMessageExport('csv') },
    { name: 'Export messages (PDF)', fn: () => testMessageExport('pdf') },
    { name: 'Export statistiques (PDF)', fn: () => testStatisticsExport('pdf') },
    { name: 'Export statistiques (Excel)', fn: () => testStatisticsExport('excel') },
    { name: 'Export personnalisé', fn: testCustomExport }
  ];
  
  for (const test of tests) {
    totalTests++;
    log(`\n--- Test: ${test.name} ---`);
    
    try {
      const result = await test.fn();
      if (result) {
        successCount++;
        log(`✅ ${test.name} réussi`, 'success');
      } else {
        log(`❌ ${test.name} échoué`, 'error');
      }
    } catch (error) {
      log(`❌ ${test.name} échoué avec erreur: ${error.message}`, 'error');
    }
    
    await sleep(500); // Pause entre les tests
  }
  
  // Résumé
  log('\n=== RÉSUMÉ DES TESTS ===');
  log(`Tests réussis: ${successCount}/${totalTests}`, successCount === totalTests ? 'success' : 'warning');
  
  if (successCount === totalTests) {
    log('🎉 Tous les tests d\'export ont réussi !', 'success');
  } else {
    log(`⚠️  ${totalTests - successCount} test(s) ont échoué`, 'warning');
  }
  
  log('\nFichiers d\'export générés dans le répertoire courant.');
}

// Exécuter les tests
if (require.main === module) {
  runTests().catch(error => {
    log(`Erreur fatale: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runTests };
