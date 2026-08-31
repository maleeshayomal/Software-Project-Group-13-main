const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Adjust password if necessary
    database: 'yamundra_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize database and tables
async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS yamundra_db;`);
        await connection.end();

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);

        // Add new columns if they don't exist
        const alterQueries = [
            'ALTER TABLE users ADD COLUMN firstName VARCHAR(255)',
            'ALTER TABLE users ADD COLUMN lastName VARCHAR(255)',
            'ALTER TABLE users ADD COLUMN email VARCHAR(255)',
            'ALTER TABLE users ADD COLUMN phone VARCHAR(255)',
            'ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT "user"',
            'ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT "active"'
        ];

        for (const query of alterQueries) {
            try {
                await pool.query(query);
            } catch (error) {
                // Ignore error if column already exists
                if (error.code !== 'ER_DUP_FIELDNAME') {
                    console.error('Error altering table:', error);
                }
            }
        }
        await pool.query(`
            CREATE TABLE IF NOT EXISTS court_bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                court_name VARCHAR(50) NOT NULL,
                booking_date DATE NOT NULL,
                time_slot VARCHAR(50) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'BOOKING_CANCELLED',
                court_name VARCHAR(50),
                booking_date DATE,
                time_slot VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS courts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price_per_hour DECIMAL(10, 2) DEFAULT 0.00,
                availability_hours VARCHAR(100) DEFAULT '06:00-22:00',
                is_active BOOLEAN DEFAULT true,
                maintenance_status VARCHAR(50) DEFAULT 'operational'
            );
        `);

        // Pro shop sales table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pro_shop_sales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                product_id INT,
                product_name VARCHAR(255) NOT NULL,
                quantity INT DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(12,2) AS (quantity * price) PERSISTENT,
                purchase_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create default admin user if not exists
        const hashedAdminPassword = await bcrypt.hash('admin123', 10);
        await pool.query(`
            INSERT IGNORE INTO users (username, password, firstName, lastName, email, phone, role) 
            VALUES ('admin', ?, 'Super', 'Admin', 'admin@yamundra.com', '1234567890', 'admin')
        `, [hashedAdminPassword]);

        console.log('Database, users, courts, court_bookings, and notifications tables initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}
initDB();

// Register Endpoint
app.post('/api/register', async (req, res) => {
    const { username, password, firstName, lastName, email, phone } = req.body;
    if (!username || !password || !firstName || !lastName || !email || !phone) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if user exists
        const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await pool.query(
            'INSERT INTO users (username, password, firstName, lastName, email, phone) VALUES (?, ?, ?, ?, ?, ?)', 
            [username, hashedPassword, firstName, lastName, email, phone]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Find user
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Login successful', 
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update User Endpoint
app.put('/api/users/:username', async (req, res) => {
    const { username } = req.params;
    const { firstName, lastName, email, phone } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE users SET firstName = ?, lastName = ?, email = ?, phone = ? WHERE username = ?',
            [firstName, lastName, email, phone, username]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change Password Endpoint
app.put('/api/users/:username/change-password', async (req, res) => {
    const { username } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }

    try {
        // Find user
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = users[0];

        // Compare current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        const [result] = await pool.query(
            'UPDATE users SET password = ? WHERE username = ?',
            [hashedNewPassword, username]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: 'Failed to update password' });
        }

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- COURT BOOKING ENDPOINTS ---

// Check Court Availability for a specific date
app.get('/api/court-bookings/availability', async (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ error: 'Date query parameter is required (YYYY-MM-DD)' });
    }

    try {
        const [bookings] = await pool.query(
            "SELECT id, username, court_name, DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, time_slot, status FROM court_bookings WHERE DATE(booking_date) = DATE(?) AND status = 'BOOKED'",
            [date]
        );
        res.json({ date, bookings });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Book a court session
app.post('/api/court-bookings', async (req, res) => {
    const { username, court_name, booking_date, time_slot } = req.body;

    if (!username || !court_name || !booking_date || !time_slot) {
        return res.status(400).json({ error: 'All fields (username, court_name, booking_date, time_slot) are required' });
    }

    try {
        // Check if court is already booked for this date and time slot
        const [existing] = await pool.query(
            "SELECT * FROM court_bookings WHERE court_name = ? AND DATE(booking_date) = DATE(?) AND time_slot = ? AND status = 'BOOKED'",
            [court_name, booking_date, time_slot]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: `${court_name} is already booked for ${time_slot} on ${booking_date}.` });
        }

        // Create booking
        const [result] = await pool.query(
            "INSERT INTO court_bookings (username, court_name, booking_date, time_slot, status) VALUES (?, ?, ?, ?, 'BOOKED')",
            [username, court_name, booking_date, time_slot]
        );

        res.status(201).json({
            message: 'Court booked successfully!',
            bookingId: result.insertId,
            court_name,
            booking_date,
            time_slot
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's court bookings
app.get('/api/court-bookings/user/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const [bookings] = await pool.query(
            "SELECT id, username, court_name, DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, time_slot, status, created_at FROM court_bookings WHERE username = ? ORDER BY created_at DESC",
            [username]
        );
        res.json({ bookings });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel a court booking & trigger broadcast notification
app.put('/api/court-bookings/:id/cancel', async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required to cancel a booking' });
    }

    try {
        // Retrieve booking first
        const [bookings] = await pool.query(
            "SELECT id, username, court_name, DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, time_slot, status FROM court_bookings WHERE id = ?",
            [id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookings[0];

        if (booking.username !== username) {
            return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
        }

        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ error: 'Booking is already cancelled' });
        }

        // Update status to CANCELLED
        await pool.query(
            "UPDATE court_bookings SET status = 'CANCELLED' WHERE id = ?",
            [id]
        );

        // Broadcast notification message to all registered users
        const message = `🔔 Booking Canceled: ${booking.court_name} is now available for session ${booking.time_slot} on ${booking.booking_date}! Ready for booking.`;

        await pool.query(
            "INSERT INTO notifications (message, type, court_name, booking_date, time_slot) VALUES (?, 'BOOKING_CANCELLED', ?, ?, ?)",
            [message, booking.court_name, booking.booking_date, booking.time_slot]
        );

        res.json({
            message: 'Booking cancelled successfully. Notification sent to all registered users!',
            bookingId: id,
            court_name: booking.court_name,
            time_slot: booking.time_slot,
            booking_date: booking.booking_date
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get broadcast notifications for registered users
app.get('/api/notifications', async (req, res) => {
    try {
        const [notifications] = await pool.query(
            "SELECT id, message, type, court_name, DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, time_slot, created_at FROM notifications ORDER BY created_at DESC LIMIT 20"
        );
        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Shop - Record a purchase (called when a user completes checkout)
app.post('/api/shop/purchase', async (req, res) => {
    const { username, product_id, product_name, quantity, price, purchase_date } = req.body;

    if (!username || !product_name || !price || !purchase_date) {
        return res.status(400).json({ error: 'Required fields: username, product_name, price, purchase_date' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO pro_shop_sales (username, product_id, product_name, quantity, price, purchase_date) VALUES (?, ?, ?, ?, ?, ?)',
            [username, product_id || null, product_name, quantity || 1, price, purchase_date]
        );

        res.status(201).json({ message: 'Purchase recorded', saleId: result.insertId });
    } catch (error) {
        console.error('Error recording purchase:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========== NOTIFICATION SYSTEM ENDPOINTS ==========

// Create notification tables if not already created
async function initNotificationTables() {
    try {
        // User subscriptions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notification_subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                court_type VARCHAR(50),
                time_slot VARCHAR(50),
                day_of_week INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Notification delivery log table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notification_delivery_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                recipient_id INT NOT NULL,
                notification_type VARCHAR(50),
                channel VARCHAR(50) DEFAULT 'SYSTEM',
                delivery_status VARCHAR(20),
                message TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_recipient_timestamp (recipient_id, timestamp)
            )
        `);

        // Waitlist table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS court_waitlist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                court_id INT NOT NULL,
                time_slot VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_waitlist (user_id, court_id, time_slot)
            )
        `);

        console.log('Notification tables initialized successfully');
    } catch (error) {
        console.error('Error initializing notification tables:', error);
    }
}
initNotificationTables();

// Send notification to user(s)
app.post('/api/notifications/send', async (req, res) => {
    const { type, recipientId, recipients, message, data, timestamp } = req.body;

    if (!type || (!recipientId && !recipients)) {
        return res.status(400).json({ error: 'Type and recipient(s) are required' });
    }

    try {
        const recipientList = recipients || [recipientId];
        const sentNotifications = [];

        for (const userId of recipientList) {
            const logEntry = {
                recipient_id: userId,
                notification_type: type,
                channel: 'SYSTEM',
                delivery_status: 'sent',
                message: message || `${type} notification`,
                timestamp: timestamp || new Date().toISOString()
            };

            const [result] = await pool.query(
                'INSERT INTO notification_delivery_log (recipient_id, notification_type, channel, delivery_status, message, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    logEntry.recipient_id,
                    logEntry.notification_type,
                    logEntry.channel,
                    logEntry.delivery_status,
                    logEntry.message,
                    logEntry.timestamp
                ]
            );

            sentNotifications.push({
                userId,
                logId: result.insertId,
                status: 'sent'
            });
        }

        res.status(201).json({
            message: 'Notifications sent successfully',
            sentCount: sentNotifications.length,
            notifications: sentNotifications
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// Get pending notifications for a user
app.get('/api/notifications/pending/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [logs] = await pool.query(
            'SELECT * FROM notification_delivery_log WHERE recipient_id = ? AND delivery_status = "sent" ORDER BY timestamp DESC LIMIT 20',
            [userId]
        );

        res.json({ notifications: logs });
    } catch (error) {
        console.error('Error fetching pending notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Log notification delivery
app.post('/api/notifications/log', async (req, res) => {
    const { recipient, type, timestamp, deliveryStatus, details } = req.body;

    if (!recipient || !type) {
        return res.status(400).json({ error: 'Recipient and type are required' });
    }

    try {
        const message = JSON.stringify(details);
        await pool.query(
            'INSERT INTO notification_delivery_log (recipient_id, notification_type, channel, delivery_status, message, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [recipient, type, 'SYSTEM', deliveryStatus || 'sent', message, timestamp || new Date().toISOString()]
        );

        res.status(201).json({ message: 'Notification logged successfully' });
    } catch (error) {
        console.error('Error logging notification:', error);
        res.status(500).json({ error: 'Failed to log notification' });
    }
});

// Get notification delivery log
app.get('/api/notifications/log/:userId', async (req, res) => {
    const { userId } = req.params;
    const { limit = 50, type } = req.query;

    try {
        let query = 'SELECT * FROM notification_delivery_log WHERE recipient_id = ?';
        const params = [userId];

        if (type) {
            query += ' AND notification_type = ?';
            params.push(type);
        }

        query += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(parseInt(limit));

        const [logs] = await pool.query(query, params);
        res.json({ logs, count: logs.length });
    } catch (error) {
        console.error('Error fetching delivery log:', error);
        res.status(500).json({ error: 'Failed to fetch delivery log' });
    }
});

// Subscribe to notifications
app.post('/api/notifications/subscribe/:userId', async (req, res) => {
    const { userId } = req.params;
    const { courtType, timeSlot, dayOfWeek } = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO notification_subscriptions (user_id, court_type, time_slot, day_of_week) VALUES (?, ?, ?, ?)',
            [userId, courtType || null, timeSlot || null, dayOfWeek || null]
        );

        res.status(201).json({
            message: 'Subscription created successfully',
            subscriptionId: result.insertId,
            criteria: { courtType, timeSlot, dayOfWeek }
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// Unsubscribe from notifications
app.post('/api/notifications/unsubscribe/:userId', async (req, res) => {
    const { userId } = req.params;
    const { subscriptionKey } = req.body;

    try {
        const [result] = await pool.query(
            'DELETE FROM notification_subscriptions WHERE user_id = ? AND id = ?',
            [userId, subscriptionKey]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Error removing subscription:', error);
        res.status(500).json({ error: 'Failed to remove subscription' });
    }
});

// Get user's subscriptions
app.get('/api/notifications/subscriptions/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [subscriptions] = await pool.query(
            'SELECT id, court_type, time_slot, day_of_week, created_at FROM notification_subscriptions WHERE user_id = ?',
            [userId]
        );

        res.json({ subscriptions, count: subscriptions.length });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Add user to waitlist
app.post('/api/notifications/waitlist/add', async (req, res) => {
    const { userId, courtId, timeSlot } = req.body;

    if (!userId || !courtId) {
        return res.status(400).json({ error: 'User ID and Court ID are required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO court_waitlist (user_id, court_id, time_slot) VALUES (?, ?, ?)',
            [userId, courtId, timeSlot || null]
        );

        res.status(201).json({
            message: 'Added to waitlist successfully',
            waitlistId: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'User already on waitlist for this slot' });
        }
        console.error('Error adding to waitlist:', error);
        res.status(500).json({ error: 'Failed to add to waitlist' });
    }
});

// Remove user from waitlist
app.post('/api/notifications/waitlist/remove', async (req, res) => {
    const { userId, courtId } = req.body;

    if (!userId || !courtId) {
        return res.status(400).json({ error: 'User ID and Court ID are required' });
    }

    try {
        const [result] = await pool.query(
            'DELETE FROM court_waitlist WHERE user_id = ? AND court_id = ?',
            [userId, courtId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Waitlist entry not found' });
        }

        res.json({ message: 'Removed from waitlist successfully' });
    } catch (error) {
        console.error('Error removing from waitlist:', error);
        res.status(500).json({ error: 'Failed to remove from waitlist' });
    }
});

// Get waitlist for a court
app.get('/api/notifications/waitlist/court/:courtId', async (req, res) => {
    const { courtId } = req.params;

    try {
        const [waitlist] = await pool.query(
            'SELECT w.id, w.user_id, w.time_slot, w.created_at, u.username, u.email FROM court_waitlist w JOIN users u ON w.user_id = u.id WHERE w.court_id = ? ORDER BY w.created_at ASC',
            [courtId]
        );

        res.json({ waitlist, count: waitlist.length });
    } catch (error) {
        console.error('Error fetching waitlist:', error);
        res.status(500).json({ error: 'Failed to fetch waitlist' });
    }
});

// Trigger booking confirmation notification
app.post('/api/notifications/booking-confirmation', async (req, res) => {
    const { userId, bookingId, bookingDetails } = req.body;

    if (!userId || !bookingId) {
        return res.status(400).json({ error: 'User ID and Booking ID are required' });
    }

    try {
        const message = `Booking Confirmation: Your court booking has been confirmed. Court: ${bookingDetails?.courtName}, Date: ${bookingDetails?.bookingDate}, Time: ${bookingDetails?.timeSlot}`;

        await pool.query(
            'INSERT INTO notification_delivery_log (recipient_id, notification_type, channel, delivery_status, message) VALUES (?, ?, ?, ?, ?)',
            [userId, 'BOOKING_CONFIRMATION', 'SYSTEM', 'sent', message]
        );

        res.status(201).json({
            message: 'Booking confirmation notification sent',
            bookingId
        });
    } catch (error) {
        console.error('Error sending booking confirmation:', error);
        res.status(500).json({ error: 'Failed to send booking confirmation' });
    }
});

// Trigger reminder notification (2 hours before booking)
app.post('/api/notifications/reminder', async (req, res) => {
    const { userId, bookingId, bookingStartTime, bookingDetails } = req.body;

    if (!userId || !bookingId || !bookingStartTime) {
        return res.status(400).json({ error: 'User ID, Booking ID, and Start Time are required' });
    }

    try {
        const startTime = new Date(bookingStartTime);
        const reminderTime = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);

        const message = `Reminder: Your court booking starts in 2 hours. Court: ${bookingDetails?.courtName}, Time: ${bookingDetails?.timeSlot}`;

        await pool.query(
            'INSERT INTO notification_delivery_log (recipient_id, notification_type, channel, delivery_status, message, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, 'REMINDER', 'SYSTEM', 'scheduled', message, reminderTime]
        );

        res.status(201).json({
            message: 'Reminder notification scheduled',
            bookingId,
            reminderTime: reminderTime.toISOString()
        });
    } catch (error) {
        console.error('Error scheduling reminder:', error);
        res.status(500).json({ error: 'Failed to schedule reminder' });
    }
});

// Get cancellation alert count for rate limiting
app.get('/api/notifications/rate-limit/check/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM notification_delivery_log WHERE recipient_id = ? AND notification_type = "CANCELLATION_ALERT" AND timestamp > ?',
            [userId, oneHourAgo]
        );

        const count = result[0]?.count || 0;
        const maxAllowed = 10;
        const rateLimitExceeded = count >= maxAllowed;

        res.json({
            userId,
            alertsInLastHour: count,
            maxAllowed,
            rateLimitExceeded,
            remainingAlerts: Math.max(0, maxAllowed - count)
        });
    } catch (error) {
        console.error('Error checking rate limit:', error);
        res.status(500).json({ error: 'Failed to check rate limit' });
    }
});

// --- ADMIN ENDPOINTS ---

// Admin Check Middleware placeholder (In production, use JWT or sessions)
const isAdmin = async (req, res, next) => {
    const { username } = req.query; // Simple check for demo purposes
    if (!username) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const [users] = await pool.query('SELECT role FROM users WHERE username = ?', [username]);
        if (users.length > 0 && users[0].role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Overview & Stats
app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const [totalBookingsRes] = await pool.query("SELECT COUNT(*) as count FROM court_bookings WHERE DATE(booking_date) = ?", [today]);
        const [cancellationsRes] = await pool.query("SELECT COUNT(*) as count FROM court_bookings WHERE DATE(booking_date) = ? AND status = 'CANCELLED'", [today]);
        const [membersRes] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
        const [activeCourtsRes] = await pool.query("SELECT COUNT(*) as count FROM courts WHERE is_active = true AND maintenance_status = 'operational'");

        // Pro shop sales for today
        const [proShopSalesRes] = await pool.query(
            "SELECT COUNT(*) as count, COALESCE(SUM(total_price),0) as revenue FROM pro_shop_sales WHERE DATE(purchase_date) = ?",
            [today]
        );

        res.json({
            totalBookingsToday: totalBookingsRes[0].count,
            courtsAvailableNow: activeCourtsRes[0].count,
            cancellationsToday: cancellationsRes[0].count,
            registeredMembers: membersRes[0].count
            ,
            proShopSalesToday: proShopSalesRes[0].count,
            proShopRevenueToday: proShopSalesRes[0].revenue
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Court Management - Get all courts
app.get('/api/admin/courts', async (req, res) => {
    try {
        const [courts] = await pool.query("SELECT * FROM courts");
        res.json({ courts });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Court Management - Add court
app.post('/api/admin/courts', isAdmin, async (req, res) => {
    const { name, description, price_per_hour, availability_hours, is_active, maintenance_status } = req.body;
    try {
        await pool.query(
            "INSERT INTO courts (name, description, price_per_hour, availability_hours, is_active, maintenance_status) VALUES (?, ?, ?, ?, ?, ?)",
            [name, description, price_per_hour, availability_hours, is_active, maintenance_status]
        );
        res.json({ message: 'Court added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Court Management - Edit court
app.put('/api/admin/courts/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, price_per_hour, availability_hours, is_active, maintenance_status } = req.body;
    try {
        await pool.query(
            "UPDATE courts SET name=?, description=?, price_per_hour=?, availability_hours=?, is_active=?, maintenance_status=? WHERE id=?",
            [name, description, price_per_hour, availability_hours, is_active, maintenance_status, id]
        );
        res.json({ message: 'Court updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Booking Management - Get all bookings
app.get('/api/admin/bookings', isAdmin, async (req, res) => {
    try {
        const [bookings] = await pool.query(
            "SELECT id, username, court_name, DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, time_slot, status, created_at FROM court_bookings ORDER BY booking_date DESC, time_slot ASC"
        );
        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Booking Management - Cancel booking by admin
app.put('/api/admin/bookings/:id/cancel', isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("UPDATE court_bookings SET status = 'CANCELLED' WHERE id = ?", [id]);
        
        // Fetch to get details for notification
        const [bookings] = await pool.query("SELECT * FROM court_bookings WHERE id = ?", [id]);
        if (bookings.length > 0) {
            const b = bookings[0];
            const message = `🔔 Booking Canceled by Admin: ${b.court_name} is now available for session ${b.time_slot} on ${b.booking_date}! Ready for booking.`;
            await pool.query(
                "INSERT INTO notifications (message, type, court_name, booking_date, time_slot) VALUES (?, 'BOOKING_CANCELLED', ?, ?, ?)",
                [message, b.court_name, b.booking_date, b.time_slot]
            );
        }
        res.json({ message: 'Booking cancelled by admin' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Member Management - Get all members
app.get('/api/admin/members', isAdmin, async (req, res) => {
    try {
        const [members] = await pool.query(
            "SELECT id, username, firstName, lastName, email, phone, role, status FROM users WHERE role = 'user'"
        );
        res.json({ members });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Member Management - Suspend/Activate Member
app.put('/api/admin/members/:username/status', isAdmin, async (req, res) => {
    const { username } = req.params;
    const { status } = req.body;
    try {
        await pool.query("UPDATE users SET status = ? WHERE username = ?", [status, username]);
        res.json({ message: `Member status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin - Get pro shop sales (pro shop sales section in admin panel)
app.get('/api/admin/pro-shop-sales', isAdmin, async (req, res) => {
    const { limit = 100, offset = 0, fromDate, toDate } = req.query;
    try {
        let query = 'SELECT id, username, product_id, product_name, quantity, price, total_price, DATE_FORMAT(purchase_date, "%Y-%m-%d") as purchase_date, created_at FROM pro_shop_sales';
        const params = [];

        if (fromDate && toDate) {
            query += ' WHERE DATE(purchase_date) BETWEEN ? AND ?';
            params.push(fromDate, toDate);
        }

        query += ' ORDER BY purchase_date DESC, created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        res.json({ sales: rows, count: rows.length });
    } catch (error) {
        console.error('Error fetching pro shop sales:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

