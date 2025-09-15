import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { MessageAttributes } from '../types';

class Message extends Model<MessageAttributes> implements MessageAttributes {
  public id!: number;
  public content!: string;
  public user_id!: number;
  public message_type!: 'text' | 'image' | 'file' | 'system';
  public is_edited!: boolean;
  public edited_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;
}

Message.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000]
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  message_type: {
    type: DataTypes.ENUM('text', 'image', 'file', 'system'),
    defaultValue: 'text'
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  edited_at: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  tableName: 'messages',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default Message;