'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const path = require('path');
const http = require('http');

// Route files
const routes = require('./routes');
const activity = require('./routes/activity');

const app = express();

/*
 * =====================================
 * CORS Configuration (Required for SFMC)
 * =====================================
 */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

/*
 * =====================================
 * Basic Configuration
 * =====================================
 */
const PORT = process.env.PORT || 3000;
app.set('port', PORT);

// Static files (public folder)
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing (CRITICAL for SFMC payload)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
 * =====================================
 * Error Handling (Development only)
 * =====================================
 */
if (app.get('env') === 'development') {
    app.use(errorhandler());
}

/*
 * =====================================
 * UI Routes
 * =====================================
 */
app.get('/', routes.index);
app.post('/login', routes.login);
app.post('/logout', routes.logout);

/*
 * =====================================
 * Health Check (for AWS App Runner)
 * =====================================
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

/*
 * =====================================
 * Journey Builder Endpoints (Primary)
 * =====================================
 */
app.post('/execute', activity.execute);
app.post('/save', activity.save);
app.post('/validate', activity.validate);
app.post('/publish', activity.publish);
app.post('/stop', activity.stop);
app.post('/edit', activity.edit);

/*
 * =====================================
 * Journey Builder Endpoints (Optional Compatibility)
 * =====================================
 */
app.post('/journeybuilder/execute', activity.execute);
app.post('/journeybuilder/save', activity.save);
app.post('/journeybuilder/validate', activity.validate);
app.post('/journeybuilder/publish', activity.publish);
app.post('/journeybuilder/stop', activity.stop);
app.post('/journeybuilder/edit', activity.edit);

/*
 * =====================================
 * Debug & Testing
 * =====================================
 */
app.post('/test-endpoint', activity.testEndpoint);
app.get('/debug-log', activity.debugLog);

/*
 * =====================================
 * Start Server
 * =====================================
 */
http.createServer(app).listen(PORT, '0.0.0.0', function () {
    console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = app;
