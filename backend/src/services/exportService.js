const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment');
const path = require('path');
const fs = require('fs').promises;
const { User, Message, sequelize } = require('../models');

class ExportService {
  constructor() {
    this.browser = null;
    this.exportsDir = path.join(__dirname, '../../exports');
    this.initializeExportsDirectory();
  }

  async initializeExportsDirectory() {
    try {
      await fs.access(this.exportsDir);
    } catch {
      await fs.mkdir(this.exportsDir, { recursive: true });
    }
  }

  async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Export PDF via Puppeteer
  async exportToPDF(data, template = 'default', options = {}) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const html = this.generateHTML(data, template);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfOptions = {
        format: options.format || 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        ...options
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      
      // Sauvegarder le fichier
      const filename = `export_${template}_${moment().format('YYYY-MM-DD_HH-mm-ss')}.pdf`;
      const filepath = path.join(this.exportsDir, filename);
      await fs.writeFile(filepath, pdfBuffer);

      return {
        success: true,
        filename,
        filepath,
        buffer: pdfBuffer
      };
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      throw new Error(`Erreur lors de l'export PDF: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  // Export Excel (XLSX)
  async exportToExcel(data, sheetName = 'Export', filename = null) {
    try {
      const workbook = XLSX.utils.book_new();
      
      if (Array.isArray(data)) {
        // Données tabulaires
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      } else if (typeof data === 'object' && data.sheets) {
        // Plusieurs feuilles
        for (const [name, sheetData] of Object.entries(data.sheets)) {
          const worksheet = XLSX.utils.json_to_sheet(sheetData);
          XLSX.utils.book_append_sheet(workbook, worksheet, name);
        }
      } else {
        throw new Error('Format de données non supporté pour Excel');
      }

      const exportFilename = filename || `export_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
      const filepath = path.join(this.exportsDir, exportFilename);
      
      XLSX.writeFile(workbook, filepath);

      return {
        success: true,
        filename: exportFilename,
        filepath
      };
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      throw new Error(`Erreur lors de l'export Excel: ${error.message}`);
    }
  }

  // Export CSV
  async exportToCSV(data, filename = null, headers = null) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Les données doivent être un tableau non vide');
      }

      const exportFilename = filename || `export_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
      const filepath = path.join(this.exportsDir, exportFilename);

      // Générer les en-têtes automatiquement si non fournis
      const csvHeaders = headers || Object.keys(data[0]).map(key => ({
        id: key,
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
      }));

      const csvWriter = createCsvWriter({
        path: filepath,
        header: csvHeaders,
        encoding: 'utf8'
      });

      await csvWriter.writeRecords(data);

      return {
        success: true,
        filename: exportFilename,
        filepath
      };
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      throw new Error(`Erreur lors de l'export CSV: ${error.message}`);
    }
  }

  // Méthodes spécifiques pour les données de l'application
  async exportUsers(format = 'excel', filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.isActive !== undefined) {
        whereClause.is_active = filters.isActive;
      }
      
      if (filters.isAdmin !== undefined) {
        whereClause.is_admin = filters.isAdmin;
      }

      if (filters.dateFrom) {
        whereClause.created_at = {
          [sequelize.Op.gte]: new Date(filters.dateFrom)
        };
      }

      const users = await User.findAll({
        where: whereClause,
        attributes: ['id', 'username', 'email', 'is_active', 'is_admin', 'last_login', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']]
      });

      const userData = users.map(user => ({
        id: user.id,
        nom_utilisateur: user.username,
        email: user.email,
        actif: user.is_active ? 'Oui' : 'Non',
        administrateur: user.is_admin ? 'Oui' : 'Non',
        derniere_connexion: user.last_login ? moment(user.last_login).format('DD/MM/YYYY HH:mm') : 'Jamais',
        date_creation: moment(user.created_at).format('DD/MM/YYYY HH:mm'),
        derniere_modification: moment(user.updated_at).format('DD/MM/YYYY HH:mm')
      }));

      switch (format.toLowerCase()) {
        case 'excel':
          return await this.exportToExcel(userData, 'Utilisateurs', `utilisateurs_${moment().format('YYYY-MM-DD')}.xlsx`);
        case 'csv':
          return await this.exportToCSV(userData, `utilisateurs_${moment().format('YYYY-MM-DD')}.csv`);
        case 'pdf':
          return await this.exportToPDF({ users: userData, title: 'Liste des Utilisateurs' }, 'users');
        default:
          throw new Error('Format d\'export non supporté');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export des utilisateurs:', error);
      throw error;
    }
  }

  async exportMessages(format = 'excel', filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.userId) {
        whereClause.user_id = filters.userId;
      }
      
      if (filters.messageType) {
        whereClause.message_type = filters.messageType;
      }

      if (filters.dateFrom) {
        whereClause.created_at = {
          [sequelize.Op.gte]: new Date(filters.dateFrom)
        };
      }

      if (filters.dateTo) {
        whereClause.created_at = {
          ...whereClause.created_at,
          [sequelize.Op.lte]: new Date(filters.dateTo)
        };
      }

      const messages = await Message.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'user',
          attributes: ['username', 'email']
        }],
        order: [['created_at', 'DESC']]
      });

      const messageData = messages.map(message => ({
        id: message.id,
        contenu: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        utilisateur: message.user ? message.user.username : 'Utilisateur supprimé',
        email_utilisateur: message.user ? message.user.email : '',
        type_message: message.message_type,
        modifie: message.is_edited ? 'Oui' : 'Non',
        date_modification: message.edited_at ? moment(message.edited_at).format('DD/MM/YYYY HH:mm') : '',
        date_creation: moment(message.created_at).format('DD/MM/YYYY HH:mm')
      }));

      switch (format.toLowerCase()) {
        case 'excel':
          return await this.exportToExcel(messageData, 'Messages', `messages_${moment().format('YYYY-MM-DD')}.xlsx`);
        case 'csv':
          return await this.exportToCSV(messageData, `messages_${moment().format('YYYY-MM-DD')}.csv`);
        case 'pdf':
          return await this.exportToPDF({ messages: messageData, title: 'Liste des Messages' }, 'messages');
        default:
          throw new Error('Format d\'export non supporté');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export des messages:', error);
      throw error;
    }
  }

  async exportStatistics(format = 'pdf') {
    try {
      // Récupérer les statistiques
      const [userStats, messageStats] = await Promise.all([
        this.getUserStatistics(),
        this.getMessageStatistics()
      ]);

      const statisticsData = {
        title: 'Statistiques de l\'Application',
        generated_at: moment().format('DD/MM/YYYY HH:mm'),
        users: userStats,
        messages: messageStats
      };

      switch (format.toLowerCase()) {
        case 'pdf':
          return await this.exportToPDF(statisticsData, 'statistics');
        case 'excel':
          const excelData = {
            sheets: {
              'Statistiques Utilisateurs': [userStats],
              'Statistiques Messages': [messageStats]
            }
          };
          return await this.exportToExcel(excelData, null, `statistiques_${moment().format('YYYY-MM-DD')}.xlsx`);
        default:
          throw new Error('Format d\'export non supporté pour les statistiques');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export des statistiques:', error);
      throw error;
    }
  }

  async getUserStatistics() {
    const [totalUsers, activeUsers, adminUsers, recentUsers] = await Promise.all([
      User.count(),
      User.count({ where: { is_active: true } }),
      User.count({ where: { is_admin: true } }),
      User.count({
        where: {
          created_at: {
            [sequelize.Op.gte]: moment().subtract(30, 'days').toDate()
          }
        }
      })
    ]);

    return {
      total_utilisateurs: totalUsers,
      utilisateurs_actifs: activeUsers,
      administrateurs: adminUsers,
      nouveaux_utilisateurs_30j: recentUsers
    };
  }

  async getMessageStatistics() {
    const [totalMessages, recentMessages, messagesByType] = await Promise.all([
      Message.count(),
      Message.count({
        where: {
          created_at: {
            [sequelize.Op.gte]: moment().subtract(30, 'days').toDate()
          }
        }
      }),
      Message.findAll({
        attributes: [
          'message_type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['message_type']
      })
    ]);

    const typeStats = {};
    messagesByType.forEach(stat => {
      typeStats[stat.message_type] = stat.get('count');
    });

    return {
      total_messages: totalMessages,
      messages_30j: recentMessages,
      ...typeStats
    };
  }

  generateHTML(data, template) {
    const baseStyles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 14px; color: #666; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
        .stat-label { font-size: 14px; color: #666; }
      </style>
    `;

    switch (template) {
      case 'users':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            ${baseStyles}
          </head>
          <body>
            <div class="header">
              <div class="title">${data.title}</div>
              <div class="subtitle">Généré le ${moment().format('DD/MM/YYYY à HH:mm')}</div>
            </div>
            <div class="section">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom d'utilisateur</th>
                    <th>Email</th>
                    <th>Actif</th>
                    <th>Admin</th>
                    <th>Dernière connexion</th>
                    <th>Date de création</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.users.map(user => `
                    <tr>
                      <td>${user.id}</td>
                      <td>${user.nom_utilisateur}</td>
                      <td>${user.email}</td>
                      <td>${user.actif}</td>
                      <td>${user.administrateur}</td>
                      <td>${user.derniere_connexion}</td>
                      <td>${user.date_creation}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </body>
          </html>
        `;

      case 'messages':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            ${baseStyles}
          </head>
          <body>
            <div class="header">
              <div class="title">${data.title}</div>
              <div class="subtitle">Généré le ${moment().format('DD/MM/YYYY à HH:mm')}</div>
            </div>
            <div class="section">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Contenu</th>
                    <th>Utilisateur</th>
                    <th>Type</th>
                    <th>Modifié</th>
                    <th>Date de création</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.messages.map(message => `
                    <tr>
                      <td>${message.id}</td>
                      <td>${message.contenu}</td>
                      <td>${message.utilisateur}</td>
                      <td>${message.type_message}</td>
                      <td>${message.modifie}</td>
                      <td>${message.date_creation}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </body>
          </html>
        `;

      case 'statistics':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            ${baseStyles}
          </head>
          <body>
            <div class="header">
              <div class="title">${data.title}</div>
              <div class="subtitle">Généré le ${data.generated_at}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Statistiques Utilisateurs</div>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${data.users.total_utilisateurs}</div>
                  <div class="stat-label">Total utilisateurs</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.users.utilisateurs_actifs}</div>
                  <div class="stat-label">Utilisateurs actifs</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.users.administrateurs}</div>
                  <div class="stat-label">Administrateurs</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.users.nouveaux_utilisateurs_30j}</div>
                  <div class="stat-label">Nouveaux (30j)</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Statistiques Messages</div>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${data.messages.total_messages}</div>
                  <div class="stat-label">Total messages</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.messages.messages_30j}</div>
                  <div class="stat-label">Messages (30j)</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.messages.text || 0}</div>
                  <div class="stat-label">Messages texte</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.messages.system || 0}</div>
                  <div class="stat-label">Messages système</div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

      default:
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            ${baseStyles}
          </head>
          <body>
            <div class="header">
              <div class="title">Export de données</div>
              <div class="subtitle">Généré le ${moment().format('DD/MM/YYYY à HH:mm')}</div>
            </div>
            <div class="section">
              <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>
          </body>
          </html>
        `;
    }
  }

  // Nettoyage des fichiers d'export anciens
  async cleanupOldExports(daysOld = 7) {
    try {
      const files = await fs.readdir(this.exportsDir);
      const cutoffDate = moment().subtract(daysOld, 'days');

      for (const file of files) {
        const filepath = path.join(this.exportsDir, file);
        const stats = await fs.stat(filepath);
        
        if (moment(stats.mtime).isBefore(cutoffDate)) {
          await fs.unlink(filepath);
          console.log(`Fichier d'export supprimé: ${file}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des exports:', error);
    }
  }
}

module.exports = new ExportService();
