import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('Socialmedia', 'postgres', 'admin@123', {
    host: 'localhost',
    dialect: 'postgres'
});

const connection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// Export using ES module syntax
export { sequelize, connection };
