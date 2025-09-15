import 'dotenv/config';
import sequelize from '../config/database';

/**
 * Migration pour ajouter la colonne pourcentage_detention à la table actifs_immobiliers
 */
const addPourcentageDetentionColumn = async (): Promise<void> => {
  try {
    console.log('🚀 Ajout de la colonne pourcentage_detention...');
    
    // Connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    // Ajouter la colonne pourcentage_detention
    await sequelize.query(`
      ALTER TABLE actifs_immobiliers 
      ADD COLUMN IF NOT EXISTS pourcentage_detention DECIMAL(5,2) 
      CHECK (pourcentage_detention >= 0 AND pourcentage_detention <= 100)
    `);
    
    // Ajouter le commentaire
    await sequelize.query(`
      COMMENT ON COLUMN actifs_immobiliers.pourcentage_detention 
      IS 'Pourcentage de détention FINDEV en pourcentage (ex: 25.00 pour 25%)'
    `);
    
    console.log('✅ Colonne pourcentage_detention ajoutée avec succès');
    
    // Vérifier que la colonne a été ajoutée
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'actifs_immobiliers' 
      AND column_name = 'pourcentage_detention'
    `);
    
    if (results.length > 0) {
      console.log('✅ Vérification : colonne créée avec succès');
      console.log(results[0]);
    } else {
      throw new Error('La colonne n\'a pas été créée correctement');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Exécuter la migration
if (require.main === module) {
  addPourcentageDetentionColumn()
    .then(() => {
      console.log('🎉 Migration terminée !');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { addPourcentageDetentionColumn };
