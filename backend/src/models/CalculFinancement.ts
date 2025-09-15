import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CalculFinancementAttributes {
  id: number;
  financement_id: number;
  date_calcul: Date;
  periode_calcul: string;
  capital_debut_periode: number;
  capital_fin_periode: number;
  interets_periode: number;
  amortissement_capital: number;
  mensualite_theorique: number;
  mensualite_payee: number;
  assurance_periode: number;
  frais_periode: number;
  penalites_periode: number;
  capital_restant_du: number;
  interets_cumules: number;
  cout_total_credit: number;
  taux_effectif_global: number;
  duree_restante_mois: number;
  ratio_service_dette: number;
  capacite_remboursement: number;
  risque_defaut: number;
  provisions_risque: number;
  valeur_garantie: number;
  couverture_garantie: number;
  notes_calcul?: string;
  statut_calcul: string;
  actif: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface CalculFinancementCreationAttributes extends Optional<CalculFinancementAttributes, 'id' | 'created_at' | 'updated_at'> {}

class CalculFinancement extends Model<CalculFinancementAttributes, CalculFinancementCreationAttributes> implements CalculFinancementAttributes {
  public id!: number;
  public financement_id!: number;
  public date_calcul!: Date;
  public periode_calcul!: string;
  public capital_debut_periode!: number;
  public capital_fin_periode!: number;
  public interets_periode!: number;
  public amortissement_capital!: number;
  public mensualite_theorique!: number;
  public mensualite_payee!: number;
  public assurance_periode!: number;
  public frais_periode!: number;
  public penalites_periode!: number;
  public capital_restant_du!: number;
  public interets_cumules!: number;
  public cout_total_credit!: number;
  public taux_effectif_global!: number;
  public duree_restante_mois!: number;
  public ratio_service_dette!: number;
  public capacite_remboursement!: number;
  public risque_defaut!: number;
  public provisions_risque!: number;
  public valeur_garantie!: number;
  public couverture_garantie!: number;
  public notes_calcul?: string;
  public statut_calcul!: string;
  public actif!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CalculFinancement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    financement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'financements',
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
    capital_debut_periode: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    capital_fin_periode: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    interets_periode: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    amortissement_capital: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    mensualite_theorique: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    mensualite_payee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    assurance_periode: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    frais_periode: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    penalites_periode: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    capital_restant_du: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    interets_cumules: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    cout_total_credit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    taux_effectif_global: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Taux effectif global en pourcentage',
    },
    duree_restante_mois: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ratio_service_dette: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Ratio service de la dette en pourcentage',
    },
    capacite_remboursement: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    risque_defaut: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Risque de défaut en pourcentage',
    },
    provisions_risque: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    valeur_garantie: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    couverture_garantie: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Taux de couverture de la garantie en pourcentage',
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
    modelName: 'CalculFinancement',
    tableName: 'calculs_financements',
    indexes: [
      {
        fields: ['financement_id'],
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
        fields: ['financement_id', 'date_calcul', 'periode_calcul'],
        unique: true,
        name: 'idx_unique_calcul_financement',
      },
    ],
  }
);

export default CalculFinancement;
