import { DataTypes } from 'sequelize';
import { sequelize } from '../db/config.js';
const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bio: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profileimage: {
        type: DataTypes.STRING, // Store the file path as a string
        allowNull: true,
    },
}, {
    tableName: 'Users',
    timestamps: false,
});




export default User;
