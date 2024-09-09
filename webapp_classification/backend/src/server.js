const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mysql = require("mysql");
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 5000;
const unlinkAsync = util.promisify(fs.unlink);
const saltRounds = 5;
let connection;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

const upload = multer({ storage: storage });

const s3 = new AWS.S3({
    region: 'eu-west-2',
    accessKeyId: 'AKIA6ODU5JHH2ZEUOL42',
    secretAccessKey: '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'
});

// Create MySQL connection
function createConnection() {
    connection = mysql.createConnection({
        host: '127.0.0.1',
        port: '3306',
        user: 'SB989',
        password: 'Sb220202386',
        database: 'classification_webapp'
    });

    connection.connect(function(err) {
        if (err) {
            console.error('Error connecting to MySQL database: ' + err.stack);
            return;
        }
        console.log('Connected to MySQL database');
    });
};

//Generate random secret key for jwt signing
const randomBuffer = crypto.randomBytes(32); // 32 bytes = 256 bits
const secretKey = randomBuffer.toString('hex');

// Function to generate JWT token
function generateToken(user) {
    const payload = {
        username: user.username,
    };
    return jwt.sign(payload, secretKey);
}

// Function to decode JWT token
function decodeToken(token) {
    return jwt.verify(token, secretKey);
}

//Function to create a default sub\scription
function createSubscription(Type, length, callback) {
    const query = 'INSERT INTO subscriptions (subscription_type, start_date, end_date) VALUES (?,?,?)'
    const start_date = new Date();
    let end_date = null;
    if (length > 0) {
        end_date = new Date(start_date);
        end_date.setMonth(start_date.getMonth() + length);
    };
    connection.query(query, [Type, start_date, end_date], function(error, results, fields) {
        if (error) {
            console.log("Error: ", error);
            callback(error, null); // Call the callback with error
        } else {
            callback(null, results.insertId); // Call the callback with subscription ID
        }
    });
};

app.use(bodyParser.json());

// Endpoint to create User in database
app.post("/signup", (req, res) => {
    const client_username = req.body.username;
    const client_password = req.body.password;

    // Check if username already exists
    connection.query('SELECT * FROM users WHERE username = ?', [client_username], function(error, results, fields) {
        if (error) {
            console.error('Error querying database: ' + error.stack);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length > 0) {
            return res.status(401).json({ error: "Username already exists" });
        }

        // Create a new user
        const hashedPassword = bcrypt.hashSync(client_password, saltRounds); //Hash Password so cannot be read
        // Use createSubscription function to create default subscription for starting_subscription
        createSubscription("Guest", 0, function(subscriptionError, subscriptionID) {
            if (subscriptionError) {
                console.error('Error creating subscription: ' + subscriptionError.stack);
                return res.status(500).json({ error: "Internal server error" });
            }
            // Insert user with both starting_subscription and current_subscription set to the same subscription ID
            const setSubscriptionQuery = 'INSERT INTO users (username, password, current_subscription, starting_subscription) VALUES (?, ?, ?, ?)';
            connection.query(setSubscriptionQuery, [client_username, hashedPassword, subscriptionID, subscriptionID], function(error, results, fields) {
                if (error) {
                    console.error('Error querying database: ' + error.stack);
                    return res.status(500).json({ error: "Internal server error" });
                }
                return res.json({ message: "Successfully created account" });
            });
        });
    });
});

//Endpoint to verify login details with database
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Query database to find user by username
    connection.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
        if (error) {
            console.error('Error querying database: ' + error.stack);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const client = results[0];

        // Compare passwords
        if (bcrypt.compareSync(password, client.password)) {
            const tkn = generateToken(client);
            return res.json({
                message: "login successful",
                token: tkn
            });
        } else {
            return res.status(401).json({ error: "Invalid username or password" });
        }
    });
});

// Endpoint to getuser details
app.get("/getuser", (req, res) => {
    const token = req.headers.authorization;

    try {
        const payload = decodeToken(token);

        // Query database to get user details and both subscriptions information
        const userQuery = `
            SELECT u.username, u.credits,
            
                currSub.subscription_id AS curr_subscription_id, currSub.subscription_type AS curr_subscription_type,
                currSub.start_date AS curr_start_date, currSub.end_date AS curr_end_date,

                startSub.subscription_id AS start_subscription_id, startSub.subscription_type AS start_subscription_type,
                startSub.start_date AS start_start_date, startSub.end_date AS start_end_date
            FROM users u
            LEFT JOIN Subscriptions currSub ON u.current_subscription = currSub.subscription_id
            LEFT JOIN Subscriptions startSub ON u.starting_subscription = startSub.subscription_id
            WHERE u.username = ?
        `;
        connection.query(userQuery, [payload.username], (error, results, fields) => {
            if (error) {
                console.error('Error querying database:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            const user = results[0]; // Extract user information from query results

            // Return user information in the response
            return res.json({
                message: 'User found',
                user: {
                    username: user.username,
                    credits: user.credits,
                    current_subscription: {
                        id: user.curr_subscription_id,
                        type: user.curr_subscription_type,
                        start_date: user.curr_start_date,
                        end_date: user.curr_end_date
                    },
                    starting_subscription: {
                        id: user.start_subscription_id,
                        type: user.start_subscription_type,
                        start_date: user.start_start_date,
                        end_date: user.start_end_date
                    }
                }
            });
        });
    
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
});

//Endpoint to update subscription for user
app.post("/updateSubscription", (req, res) => {
    const token = req.headers.authorization;
    const payload = decodeToken(token);

    //If user decides to return to Started Plan return to starting_subscription
    if (req.body.subscriptionType === 'Guest'){
        const currentSubChange = `
            UPDATE users
            SET current_subscription = starting_subscription
            WHERE username = ?
        `;

        connection.query(currentSubChange, [payload.username], (error, results, fields) => {
            if (error) {
                console.error('Error updating current subscription:', error);
                return res.status(500).json({ error: "Internal server error" });
            }

            console.log('Current subscription updated successfully');
            return res.status(200).json({ message: "Current subscription updated successfully" });
        })
    }
    // if users gets a subscriptions other than the original assigned to them
    else{
        createSubscription(req.body.subscriptionType, 1, function(subscriptionError, subscriptionID){
            if (subscriptionError) {
                console.error('Error creating subscription: ' + subscriptionError.stack);
                return res.status(500).json({ error: "Internal server error" });
            }
            const subscriptionCreditAdd = {
                'Member': 1500,
                'Guest': 0,
                'Enterprise': 20000
            }

            subscriptionCreditAmount = subscriptionCreditAdd[req.body.subscriptionType]
            const currentSubChange = `
                UPDATE users
                SET current_subscription = ?, credits = credits + ?
                WHERE username = ?
            `
            connection.query(currentSubChange, [subscriptionID, subscriptionCreditAmount, payload.username], (error, results, fields) => {
                if (error) {
                    console.error('Error updating current subscription:', error);
                    return res.status(500).json({ error: "Internal server error" });
                }

                console.log('Current subscription updated successfully');
                return res.status(200).json({ message: "Current subscription updated successfully" });
            });
        });

    }
});

app.post("/updateCredits", (req, res) => {
    const token = req.headers.authorization;
    const payload = decodeToken(token);

    const creditChangeQuery = `
        UPDATE users
        SET credits = credits + ?
        WHERE username = ?
    `
    connection.query(creditChangeQuery, [req.body.amount, payload.username], (error, results, fields) => {
        if (error) {
            console.error('Error updating credits:', err);
            return;
          }
        console.log('Credits updated successfully');
        return res.status(200).json({ message: "Credits updated successfully" });
    });
})

app.post("/uploadImages", upload.array('image'), async (req, res) => {
    const token = req.headers.authorization;
    const payload = decodeToken(token);
    const deletePromises = [];
    const images = []
    
    try {
        console.log('hi')
        await Promise.all(req.files.map(async (file) => {
            console.log("File uploaded locally:", file.filename);
            images.push(file);
        }));
        
        // Handle each uploaded image
        for (let index = 0; index < images.length; index++) {
            const image = images[index];
            const params = {
                Bucket: 'classificationapp',
                Key: 'history/users/' + payload.username + "/" + image.filename,
                Body: fs.createReadStream(image.path),
            };
            
            // Upload the image to S3
            const uploadResult = await new Promise((resolve, reject) => {
                s3.upload(params, (err, data) => {
                    if (err) {
                        console.error('Error uploading file:', err);
                        reject(err);
                    } else {
                        console.log(`File uploaded successfully. ${data.Location}`);
                        resolve(data);
                    }
                });
            });
            
            // Push a promise for deleting the local file to the array
            deletePromises.push(unlinkAsync(image.path));
        }

        // Wait for all delete promises to resolve
        await Promise.all(deletePromises);
        console.log('Local files deleted successfully');
        
        // Send a response indicating success
        res.json({ message: 'Images uploaded successfully' });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get("/getHistory", async(req, res) => {
    const token = req.headers.authorization;
    const payload = decodeToken(token);

    try {
        // List objects in the user's S3 directory
        const params = {
            Bucket: 'classificationapp',
            Prefix: 'history/users/' + payload.username + '/',
            Delimiter: '/'
        };

        const data = await s3.listObjects(params).promise();

        // Extract URLs of the images
        const imageUrls = data.Contents.map(obj => {
            return s3.getSignedUrl('getObject', {
                Bucket: params.Bucket,
                Key: obj.Key,
            });
        });

        // Send the image URLs to the client
        return res.status(200).json({ images: imageUrls });
    } catch (error) {
        console.error("Error fetching images:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
  
// Create MySQL connection when starting the server
app.listen(PORT, () => {
    createConnection();
    console.log(`Server started on port ${PORT}`);
});
