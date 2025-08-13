import { DataTypes } from 'sequelize';
import { sequelize } from '../db/config.js';

const Image = sequelize.define('Image', {
    userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    caption: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'Images',
    timestamps: true,
    updatedAt: false,
    createdAt: 'createdAt',
});

export default Image;