
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { sequelize, connection } from './db/config.js';
import { Image, Rating } from './models/associations.js';
import User from './models/User.js';
import jwt from "jsonwebtoken";


const app = express();
const secret = 'default-secret'


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (req.url.startsWith("/register") || req.url.startsWith("/user")) {
            cb(null, "./server/uploads/profileimage");
        } else if (req.url.startsWith("/image")) {
            cb(null, "./server/uploads/images");
        } else {
            cb(new Error("Invalid endpoint for file upload"), null);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Add limits to the multer configuration to restrict the file size
const upload = multer({
    storage: storage,
    limits: { fieldSize: 2 * 1024 * 1024 },  // 2MB size limit
});



function authenticateToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token is required" });

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.post("/register", upload.single('profileimage'), async (req, res) => {
    const { email, password, username, bio } = req.body;
    let profileImagePath = req.file ? req.file.path : null;

    try {
        // Step 1: Validate input fields
        if (!email || !password || !username) {
            if (profileImagePath) {
                fs.unlinkSync(profileImagePath); // Delete the image if validation fails
            }
            return res.status(400).json("Missing required fields");
        }

        // Step 2: Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            if (profileImagePath) {
                fs.unlinkSync(profileImagePath); // Delete the image if user exists
            }
            return res.status(400).json({ message: "Email is already in use" });
        }

        // Step 3: Sync the User model and create the new user
        await User.sync({ alter: true });

        const newUser = await User.create({
            email,
            password,
            username,
            bio,
            profileimage: profileImagePath,  // Save the image path in the database
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        // Step 4: Handle any unexpected errors
        if (profileImagePath) {
            fs.unlinkSync(profileImagePath); // Delete the image on error
        }
        res.status(500).json({ message: 'Error registering user', error });
    }
});

app.put("/user/:id", upload.single("profileimage"), async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password, username, bio } = req.body;

        // Find the user by ID
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user details
        user.email = email || user.email;
        user.password = password || user.password;
        user.username = username || user.username;
        user.bio = bio || user.bio;

        if (req.file) {
            // If the user has an existing profile image, delete it
            if (user.profileimage) {
                const oldImagePath = path.resolve(user.profileimage); // Resolve the absolute path
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // Delete the old profile image
                }
            }

            // Save the new profile image
            user.profileimage = req.file.path;
        }

        // Save the updated user record
        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({
            message: "Error updating user profile",
            error: error.message,
        });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json({ "Users": users })
    } catch (error) {
        console.error("Error fetching users:", error);
    }
})

app.get("/user/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User data fetched successfully",
            user: {
                username: user.username,
                email: user.email,
                bio: user.bio,
                profileimage: user.profileimage,  // Path to the profile image
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({
            message: "Error fetching user profile",
            error: error.message,
        });
    }
});


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email)
            return res.status(400).json("Email is required");

        if (!password)
            return res.status(400).json("Password is required");

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log("No user found with email:", email);
            return res.status(401).json("Invalid email");
        }
        if (password !== user.password) {
            console.log("Invalid password for email:", email);
            return res.status(401).json("Invalid password");
        }
        const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: "24h" });
        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

//images 

app.post("/image", authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { id: userid } = req.user;
        const { caption } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const imagePath = req.file.path;

        const newImage = await Image.create({
            caption: caption,
            userid: parseInt(userid, 10), // Storing the user's ID
            image: imagePath,
        });

        res.status(201).json({
            message: "Image uploaded successfully",
            image: {
                caption: caption,
                userid: newImage.userid,
                image: newImage.image,  // Return the image path in the response
            },
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Error uploading image", error });
    }
});


app.get("/image", authenticateToken, async (req, res) => {
    try {
        const images = await Image.findAll()
        res.status(200).json(images)

    } catch (error) {
        res.status(500).json({ "Error Occurred": error })
    }

})

app.get("/image/:userid", authenticateToken, async (req, res) => {
    try {
        const { userid } = req.params
        const image = await Image.findAll({ where: { userid } })
        if (!image) {
            res.status(400).json({ "Image not found": userid })

        }
        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ "Error Occurred": error })
    }

})

app.get("/otherpf/:userid",  async (req, res) => {
    try {
        const { userid } = req.params
        const image = await Image.findAll({ where: { userid } })
        if (!image) {
            res.status(400).json({ "Image not found": userid })

        }
        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ "Error Occurred": error })
    }

})

app.delete("/image/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Step 1: Delete all ratings associated with the image
        const deletedRatings = await Rating.destroy({
            where: { image_id: id }  // Delete ratings where the image_id matches the image being deleted
        });

        // Step 2: Delete the image
        const image = await Image.findByPk(id);
        if (!image) {
            return res.status(400).json({ message: `Image with ID ${id} not found.` });
        }

        // Delete the image
        await image.destroy();

        // Respond with a success message
        res.status(200).json({
            message: "Image and associated ratings deleted successfully.",
            deletedRatings: deletedRatings,  // Optionally return the number of deleted ratings
        });
    } catch (error) {
        console.error("Error deleting image and ratings:", error);
        res.status(500).json({ error: "Error deleting the image and its ratings", details: error });
    }
});


app.put("/rating", authenticateToken, async (req, res) => {
    try {
        const { image_id, userid, rating } = req.body;

        if (!image_id || !rating || !userid) {
            return res.status(400).json({ message: "Image ID, User ID, and rating are required" });
        }

        const existingRating = await Rating.findOne({
            where: {
                image_id: image_id,
                userid: userid
            }
        });

        if (existingRating) {
            existingRating.rating = rating;
            await existingRating.save();
            res.status(200).json({ message: "Rating updated successfully" });
        } else {
            const newRating = await Rating.create({ image_id, userid, rating });
            res.status(201).json({ message: "Rating added successfully", rating: newRating });
        }

    } catch (error) {
        res.status(500).json({ message: "Error adding or updating rating", error });
    }
});


app.get("/rating", authenticateToken, async (req, res) => {
    try {
        const rating = await Rating.findAll();
        res.status(200).json({ "Data": rating })
    } catch (error) {
        res.status(500).json({ "Error Occurred": error })
    }
})




app.get("/rating/:userid/:image_id", authenticateToken, async (req, res) => {
    try {
      const { userid, image_id } = req.params; // Extract both userId and imageId from URL params
  
      // Fetch the rating from the Rating table
      const rating = await Rating.findOne({
        where: {
          userid: userid,   // User who rated the image
          image_id: image_id, // Image for which the rating is given
        },
      });
  
     
  
      // Send the rating data
      res.status(200).json({ Data: rating });
    } catch (error) {
      console.log(error);
      res.status(500).json({ Error: "Error occurred while fetching rating" });
    }
  });


app.delete("/rating/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const rating = await Rating.findOne({ where: { id } })
        if (!rating) {
            res.status(400).json({ "Rating not found": id })
        } else {
            await rating.destroy();
            res.status(200).json({ message: "Deleted Successfully" })
        }
    } catch (error) {
        res.status(500).json({ "Error deleting the rating": error })
    }
})


// profile delete

app.delete("/profileimg/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id)
;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.profileimage) {
            const oldImagePath = path.resolve(user.profileimage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        user.profileimage = null;
        await user.save();
        res.status(200).json({ message: "Profile image deleted successfully" });

    } catch (error) {
        console.error("Error deleting profile image:", error);
    }
})



// rating
app.get("/avgrating/:image_id", authenticateToken, async (req, res) => {
    try {
        const { image_id } = req.params
        const averageRating = await Rating.findOne({
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']],
            where: { image_id },
        });
         
        const formating = parseFloat(averageRating.get('averageRating')).toFixed(1);

        res.status(200).json({ "Average Rating": formating,"imageid":image_id })


    } catch (error) {
        res.status(500).json({ "Error Occurred": error })
    }

})



app.get('/profileavg/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const images = await Image.findAll({
            where: { userid: userId },
            attributes: ['id'],
        });

        if (images.length === 0) {
            return res.status(404).json({ message: 'No images found for this user.' });
        }

        let totalRatings = 0;
        let imageCount = 0;

        for (let image of images) {
            const imageId = image.id;
            const ratings = await Rating.findAll({
                where: { image_id: imageId },
                attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']],
            });

            if (ratings[0].dataValues.avg_rating !== null) {
                totalRatings += parseFloat(ratings[0].dataValues.avg_rating);
                imageCount++;
            }
        }

        if (imageCount === 0) {
            return res.status(200).json({ avg_rating: 0 }); // If no ratings, return 0
        }

        const overallAvgRating = totalRatings / imageCount;

        return res.status(200).json({
            avg_rating: overallAvgRating.toFixed(1),
        });
    } catch (error) {
        console.error('Error fetching average rating:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// viewers
app.get("/userratings/:user_id", authenticateToken, async (req, res) => {
    try {
        const { user_id } = req.params;

        const result = await Image.findAll({
            where: { userid: user_id },
            attributes: [
                'userid',
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('ratings.userid'))), 'usersRated'],
            ],
            include: [{
                model: Rating,
                as: 'ratings',
                attributes: [],
                required: true, // Only include images with ratings
            }],
            group: ['Image.userid'], // Group by the user ID only
            raw: true,
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ "Error Occurred": error.message });
    }
});




connection();

app.listen(5000, () => {
    console.log("Server is Running ")
});