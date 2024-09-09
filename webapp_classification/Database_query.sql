CREATE SCHEMA classification_webapp;
use classification_webapp;

-- Used to create a subscription
CREATE TABLE Subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_type ENUM('Member', 'Guest', 'Enterprise'),
    start_date DATE,
    end_date DATE
);

-- Used to create the users table
CREATE TABLE users (
    username VARCHAR(255) primary key,
    password VARCHAR(255) NOT NULL,
    current_subscription INT,
	starting_subscription INT,
    credits INT default 0,
    FOREIGN KEY (current_subscription) REFERENCES subscriptions(subscription_id),
	FOREIGN KEY (starting_subscription) REFERENCES subscriptions(subscription_id)
);

SELECT * FROM users
JOIN subscriptions ON users.current_subscription = subscriptions.subscription_id;







