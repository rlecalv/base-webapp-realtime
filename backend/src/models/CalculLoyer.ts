import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CalculLoyerAttributes {
  id: number;
  loyer_id: number;
  date_calcul: Date;
  periode_calcul: string;
  loyer_theorique: number;
  loyer_encaisse: number;
  charges_theoriques: number;
  charges_encaissees: number;
  provisions_charges: number;
  regularisation_charges: number;
  penalites_retard: number;
  remises_accordees: number;
  vacance_locative: number;
  jours_occupation: number;
  jours_vacance: number;
  taux_occupation_reel: number;
  revenus_nets_periode: number;
  impayés_cumules: number;
  depot_garantie_utilise: number;
  frais_relocation: number;
  commission_agence: number;
  cout_contentieux: number;
  provisions_douteuses: number;
  rendement_reel: number;
  ecart_previsionnel: number;
  notes_calcul?: string;
  statut_calcul: string;
  actif: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface CalculLoyerCreationAttributes extends Optional<CalculLoyerAttributes, 'id' | 'created_at' | 'updated_at'> {}

class CalculLoyer extends Model<CalculLoyerAttributes, CalculLoyerCreationAttributes> implements CalculLoyerAttributes {
  public id!: number;
  public loyer_id!: number;
  public date_calcul!: Date;
  public periode_calcul!: string;
  public loyer_theorique!: number;
  public loyer_encaisse!: number;
  public charges_theoriques!: number;
  public charges_encaissees!: number;
  public provisions_charges!: number;
  public regularisation_charges!: number;
  public penalites_retard!: number;
  public remises_accordees!: number;
  public vacance_locative!: number;
  public jours_occupation!: number;
  public jours_vacance!: number;
  public taux_occupation_reel!: number;
  public revenus_nets_periode!: number;
  public impayés_cumules!: number;
  public depot_garantie_utilise!: number;
  public frais_relocation!: number;
  public commission_agence!: number;
  public cout_contentieux!: number;
  public provisions_douteuses!: number;
  public rendement_reel!: number;
  public ecart_previsionnel!: number;
  public notes_calcul?: string;
  public statut_calcul!: string;
  public actif!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CalculLoyer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    loyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'loyers',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    date_calcul: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    periode_calcul: {
      type: DataTypes.ENUM('mensuel', 'trimestriel', 'semestriel', 'annuel'),
      allowNull: false,
    },
    loyer_theorique: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    loyer_encaisse: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    charges_theoriques: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    charges_encaissees: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    provisions_charges: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    regularisation_charges: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    penalites_retard: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    remises_accordees: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    vacance_locative: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    jours_occupation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    jours_vacance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    taux_occupation_reel: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100,
      comment: 'Taux d\'occupation réel en pourcentage',
    },
    revenus_nets_periode: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    impayés_cumules: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    depot_garantie_utilise: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    frais_relocation: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    commission_agence: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    cout_contentieux: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    provisions_douteuses: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    rendement_reel: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Rendement réel en pourcentage',
    },
    ecart_previsionnel: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    notes_calcul: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut_calcul: {
      type: DataTypes.ENUM('brouillon', 'calcule', 'valide', 'archive'),
      allowNull: false,
      defaultValue: 'brouillon',
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'CalculLoyer',
    tableName: 'calculs_loyers',
    indexes: [
      {
        fields: ['loyer_id'],
      },
      {
        fields: ['date_calcul'],
      },
      {
        fields: ['periode_calcul'],
      },
      {
        fields: ['statut_calcul'],
      },
      {
        fields: ['actif'],
      },
      {
        fields: ['loyer_id', 'date_calcul', 'periode_calcul'],
        unique: true,
        name: 'idx_unique_calcul_loyer',
      },
    ],
  }
);

export default CalculLoyer;
