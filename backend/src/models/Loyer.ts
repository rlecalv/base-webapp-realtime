import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface LoyerAttributes {
  id: number;
  actif_immobilier_id: number;
  locataire_id: number;
  numero_bail?: string;
  date_debut: Date;
  date_fin?: Date;
  duree_bail?: number;
  type_bail: string;
  montant_loyer_mensuel: number;
  charges_mensuelles?: number;
  depot_garantie?: number;
  indexation?: string;
  indice_reference?: number;
  date_revision?: Date;
  periodicite_paiement: string;
  jour_echeance: number;
  modalite_paiement?: string;
  clause_resiliation?: string;
  clause_particuliere?: string;
  statut: string;
  date_entree?: Date;
  date_sortie?: Date;
  etat_lieux_entree?: string;
  etat_lieux_sortie?: string;
  frais_agence?: number;
  commission_gestion?: number;
  notes?: string;
  actif: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface LoyerCreationAttributes extends Optional<LoyerAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Loyer extends Model<LoyerAttributes, LoyerCreationAttributes> implements LoyerAttributes {
  public id!: number;
  public actif_immobilier_id!: number;
  public locataire_id!: number;
  public numero_bail?: string;
  public date_debut!: Date;
  public date_fin?: Date;
  public duree_bail?: number;
  public type_bail!: string;
  public montant_loyer_mensuel!: number;
  public charges_mensuelles?: number;
  public depot_garantie?: number;
  public indexation?: string;
  public indice_reference?: number;
  public date_revision?: Date;
  public periodicite_paiement!: string;
  public jour_echeance!: number;
  public modalite_paiement?: string;
  public clause_resiliation?: string;
  public clause_particuliere?: string;
  public statut!: string;
  public date_entree?: Date;
  public date_sortie?: Date;
  public etat_lieux_entree?: string;
  public etat_lieux_sortie?: string;
  public frais_agence?: number;
  public commission_gestion?: number;
  public notes?: string;
  public actif!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Loyer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    actif_immobilier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'actifs_immobiliers',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    locataire_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'locataires',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    numero_bail: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duree_bail: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Durée en mois',
    },
    type_bail: {
      type: DataTypes.ENUM('habitation', 'commercial', 'professionnel', 'mixte', 'saisonnier', 'autre'),
      allowNull: false,
    },
    montant_loyer_mensuel: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    charges_mensuelles: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    depot_garantie: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    indexation: {
      type: DataTypes.ENUM('IRL', 'ICC', 'ILAT', 'ILC', 'fixe', 'autre'),
      allowNull: true,
    },
    indice_reference: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    date_revision: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    periodicite_paiement: {
      type: DataTypes.ENUM('mensuel', 'trimestriel', 'semestriel', 'annuel'),
      allowNull: false,
      defaultValue: 'mensuel',
    },
    jour_echeance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 31,
      },
    },
    modalite_paiement: {
      type: DataTypes.ENUM('virement', 'cheque', 'especes', 'prelevement', 'autre'),
      allowNull: true,
    },
    clause_resiliation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clause_particuliere: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('actif', 'resilie', 'suspendu', 'en_cours', 'termine'),
      allowNull: false,
      defaultValue: 'actif',
    },
    date_entree: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_sortie: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    etat_lieux_entree: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    etat_lieux_sortie: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frais_agence: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    commission_gestion: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Pourcentage de commission',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Loyer',
    tableName: 'loyers',
    indexes: [
      {
        fields: ['actif_immobilier_id'],
      },
      {
        fields: ['locataire_id'],
      },
      {
        fields: ['statut'],
      },
      {
        fields: ['date_debut'],
      },
      {
        fields: ['date_fin'],
      },
      {
        fields: ['numero_bail'],
        unique: true,
        where: {
          numero_bail: {
            [Op.ne]: null,
          },
        },
      },
      {
        fields: ['actif'],
      },
    ],
  }
);

export default Loyer;
