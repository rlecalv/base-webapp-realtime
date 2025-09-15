import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CalculActifImmobilierAttributes {
  id: number;
  actif_immobilier_id: number;
  date_calcul: Date;
  periode_calcul: string;
  revenus_locatifs_bruts: number;
  revenus_locatifs_nets: number;
  charges_totales: number;
  charges_courantes: number;
  charges_exceptionnelles: number;
  travaux_maintenance: number;
  travaux_amelioration: number;
  taxe_fonciere_calculee: number;
  assurance_calculee: number;
  frais_gestion_calcules: number;
  provisions_charges: number;
  cash_flow_brut: number;
  cash_flow_net: number;
  rentabilite_brute: number;
  rentabilite_nette: number;
  taux_occupation_calcule: number;
  valeur_actuelle_calculee: number;
  plus_value_latente: number;
  amortissement_cumule: number;
  valeur_comptable_nette: number;
  ratio_endettement: number;
  couverture_dette: number;
  notes_calcul?: string;
  statut_calcul: string;
  actif: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface CalculActifImmobilierCreationAttributes extends Optional<CalculActifImmobilierAttributes, 'id' | 'created_at' | 'updated_at'> {}

class CalculActifImmobilier extends Model<CalculActifImmobilierAttributes, CalculActifImmobilierCreationAttributes> implements CalculActifImmobilierAttributes {
  public id!: number;
  public actif_immobilier_id!: number;
  public date_calcul!: Date;
  public periode_calcul!: string;
  public revenus_locatifs_bruts!: number;
  public revenus_locatifs_nets!: number;
  public charges_totales!: number;
  public charges_courantes!: number;
  public charges_exceptionnelles!: number;
  public travaux_maintenance!: number;
  public travaux_amelioration!: number;
  public taxe_fonciere_calculee!: number;
  public assurance_calculee!: number;
  public frais_gestion_calcules!: number;
  public provisions_charges!: number;
  public cash_flow_brut!: number;
  public cash_flow_net!: number;
  public rentabilite_brute!: number;
  public rentabilite_nette!: number;
  public taux_occupation_calcule!: number;
  public valeur_actuelle_calculee!: number;
  public plus_value_latente!: number;
  public amortissement_cumule!: number;
  public valeur_comptable_nette!: number;
  public ratio_endettement!: number;
  public couverture_dette!: number;
  public notes_calcul?: string;
  public statut_calcul!: string;
  public actif!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CalculActifImmobilier.init(
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
    date_calcul: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    periode_calcul: {
      type: DataTypes.ENUM('mensuel', 'trimestriel', 'semestriel', 'annuel'),
      allowNull: false,
    },
    revenus_locatifs_bruts: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    revenus_locatifs_nets: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    charges_totales: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    charges_courantes: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    charges_exceptionnelles: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    travaux_maintenance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    travaux_amelioration: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    taxe_fonciere_calculee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    assurance_calculee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    frais_gestion_calcules: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    provisions_charges: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    cash_flow_brut: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    cash_flow_net: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    rentabilite_brute: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Rentabilité brute en pourcentage',
    },
    rentabilite_nette: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Rentabilité nette en pourcentage',
    },
    taux_occupation_calcule: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100,
      comment: 'Taux d\'occupation calculé en pourcentage',
    },
    valeur_actuelle_calculee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    plus_value_latente: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    amortissement_cumule: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    valeur_comptable_nette: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    ratio_endettement: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Ratio d\'endettement en pourcentage',
    },
    couverture_dette: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Ratio de couverture de la dette',
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
    modelName: 'CalculActifImmobilier',
    tableName: 'calculs_actifs_immobiliers',
    indexes: [
      {
        fields: ['actif_immobilier_id'],
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
        fields: ['actif_immobilier_id', 'date_calcul', 'periode_calcul'],
        unique: true,
        name: 'idx_unique_calcul_actif',
      },
    ],
  }
);

export default CalculActifImmobilier;
