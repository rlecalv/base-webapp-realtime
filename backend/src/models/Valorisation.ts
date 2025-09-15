import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ValorisationAttributes {
  id: number;
  actif_immobilier_id: number;
  date_evaluation: Date;
  valeur_estimee: number;
  methode_evaluation: string;
  expert_evaluateur?: string;
  numero_rapport?: string;
  surface_evaluee?: number;
  prix_m2?: number;
  valeur_locative_annuelle?: number;
  rendement_brut?: number;
  rendement_net?: number;
  taux_capitalisation?: number;
  comparables_utilises?: string;
  ajustements?: string;
  commentaires_expert?: string;
  validite_evaluation?: Date;
  cout_evaluation?: number;
  motif_evaluation?: string;
  statut: string;
  document_joint?: string;
  notes?: string;
  actif: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ValorisationCreationAttributes extends Optional<ValorisationAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Valorisation extends Model<ValorisationAttributes, ValorisationCreationAttributes> implements ValorisationAttributes {
  public id!: number;
  public actif_immobilier_id!: number;
  public date_evaluation!: Date;
  public valeur_estimee!: number;
  public methode_evaluation!: string;
  public expert_evaluateur?: string;
  public numero_rapport?: string;
  public surface_evaluee?: number;
  public prix_m2?: number;
  public valeur_locative_annuelle?: number;
  public rendement_brut?: number;
  public rendement_net?: number;
  public taux_capitalisation?: number;
  public comparables_utilises?: string;
  public ajustements?: string;
  public commentaires_expert?: string;
  public validite_evaluation?: Date;
  public cout_evaluation?: number;
  public motif_evaluation?: string;
  public statut!: string;
  public document_joint?: string;
  public notes?: string;
  public actif!: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Valorisation.init(
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
    date_evaluation: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    valeur_estimee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    methode_evaluation: {
      type: DataTypes.ENUM('expertise_professionnelle', 'comparaison_marche', 'capitalisation_revenus', 'cout_remplacement', 'methode_mixte', 'autre'),
      allowNull: false,
    },
    expert_evaluateur: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    numero_rapport: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    surface_evaluee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    prix_m2: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    valeur_locative_annuelle: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    rendement_brut: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Rendement brut en pourcentage',
    },
    rendement_net: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Rendement net en pourcentage',
    },
    taux_capitalisation: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Taux de capitalisation en pourcentage',
    },
    comparables_utilises: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description des biens comparables utilisés',
    },
    ajustements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Ajustements appliqués lors de l\'évaluation',
    },
    commentaires_expert: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    validite_evaluation: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date jusqu\'à laquelle l\'évaluation est valide',
    },
    cout_evaluation: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    motif_evaluation: {
      type: DataTypes.ENUM('acquisition', 'vente', 'financement', 'assurance', 'fiscal', 'gestion', 'succession', 'autre'),
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('brouillon', 'en_cours', 'finalisee', 'validee', 'archivee'),
      allowNull: false,
      defaultValue: 'brouillon',
    },
    document_joint: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Chemin vers le document d\'évaluation',
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
    modelName: 'Valorisation',
    tableName: 'valorisations',
    indexes: [
      {
        fields: ['actif_immobilier_id'],
      },
      {
        fields: ['date_evaluation'],
      },
      {
        fields: ['methode_evaluation'],
      },
      {
        fields: ['statut'],
      },
      {
        fields: ['expert_evaluateur'],
      },
      {
        fields: ['actif'],
      },
      {
        fields: ['actif_immobilier_id', 'date_evaluation'],
        name: 'idx_actif_date_eval',
      },
    ],
  }
);

export default Valorisation;
