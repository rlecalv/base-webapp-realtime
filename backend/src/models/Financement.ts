import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface FinancementAttributes {
  id: number;
  actif_immobilier_id: number;
  type_financement: string;
  organisme_preteur: string;
  numero_contrat?: string;
  montant_emprunte: number;
  taux_interet: number;
  duree_mois: number;
  date_debut: Date;
  date_fin: Date;
  mensualite: number;
  capital_restant_du?: number;
  interets_cumules?: number;
  type_taux: string;
  periodicite_remboursement: string;
  date_echeance: number;
  assurance_emprunteur?: number;
  taux_assurance?: number;
  garanties?: string;
  frais_dossier?: number;
  frais_garantie?: number;
  penalites_remboursement?: number;
  clause_particuliere?: string;
  statut: string;
  date_derniere_echeance?: Date;
  montant_rembourse?: number;
  notes?: string;
  actif: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface FinancementCreationAttributes extends Optional<FinancementAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Financement extends Model<FinancementAttributes, FinancementCreationAttributes> implements FinancementAttributes {
  public id!: number;
  public actif_immobilier_id!: number;
  public type_financement!: string;
  public organisme_preteur!: string;
  public numero_contrat?: string;
  public montant_emprunte!: number;
  public taux_interet!: number;
  public duree_mois!: number;
  public date_debut!: Date;
  public date_fin!: Date;
  public mensualite!: number;
  public capital_restant_du?: number;
  public interets_cumules?: number;
  public type_taux!: string;
  public periodicite_remboursement!: string;
  public date_echeance!: number;
  public assurance_emprunteur?: number;
  public taux_assurance?: number;
  public garanties?: string;
  public frais_dossier?: number;
  public frais_garantie?: number;
  public penalites_remboursement?: number;
  public clause_particuliere?: string;
  public statut!: string;
  public date_derniere_echeance?: Date;
  public montant_rembourse?: number;
  public notes?: string;
  public actif!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Financement.init(
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
    type_financement: {
      type: DataTypes.ENUM('pret_bancaire', 'credit_immobilier', 'pret_relais', 'pret_in_fine', 'credit_bail', 'autofinancement', 'autre'),
      allowNull: false,
    },
    organisme_preteur: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    numero_contrat: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    montant_emprunte: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    taux_interet: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      comment: 'Taux d\'intérêt en pourcentage (ex: 2.5000 pour 2.5%)',
    },
    duree_mois: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    mensualite: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    capital_restant_du: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    interets_cumules: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    type_taux: {
      type: DataTypes.ENUM('fixe', 'variable', 'mixte', 'revisable'),
      allowNull: false,
      defaultValue: 'fixe',
    },
    periodicite_remboursement: {
      type: DataTypes.ENUM('mensuel', 'trimestriel', 'semestriel', 'annuel', 'in_fine'),
      allowNull: false,
      defaultValue: 'mensuel',
    },
    date_echeance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 31,
      },
    },
    assurance_emprunteur: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    taux_assurance: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      comment: 'Taux d\'assurance en pourcentage',
    },
    garanties: {
      type: DataTypes.ENUM('hypotheque', 'privilege_preteur', 'caution', 'nantissement', 'ipp', 'autre'),
      allowNull: true,
    },
    frais_dossier: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    frais_garantie: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    penalites_remboursement: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    clause_particuliere: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('actif', 'rembourse', 'suspendu', 'defaillant', 'restructure'),
      allowNull: false,
      defaultValue: 'actif',
    },
    date_derniere_echeance: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    montant_rembourse: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
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
    modelName: 'Financement',
    tableName: 'financements',
    indexes: [
      {
        fields: ['actif_immobilier_id'],
      },
      {
        fields: ['type_financement'],
      },
      {
        fields: ['organisme_preteur'],
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
        fields: ['numero_contrat'],
        unique: true,
        where: {
          numero_contrat: {
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

export default Financement;
