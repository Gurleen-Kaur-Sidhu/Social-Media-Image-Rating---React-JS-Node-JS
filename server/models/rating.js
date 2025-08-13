import { DataTypes } from 'sequelize';
import { sequelize } from '../db/config.js';

const Rating = sequelize.define('Rating', {
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    image_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userid:{
        type:DataTypes.INTEGER,
        allowNull:false,

    },
}, {
    tableName: 'rating',
    timestamps: false,
});




export default Rating;
