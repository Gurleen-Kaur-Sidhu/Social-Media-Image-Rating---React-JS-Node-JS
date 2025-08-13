import Image from './image.js';
import Rating from './rating.js';

// Define associations
Image.hasMany(Rating, { foreignKey: 'image_id', as: 'ratings' });
Rating.belongsTo(Image, { foreignKey: 'image_id', as: 'image' });

export { Image, Rating };