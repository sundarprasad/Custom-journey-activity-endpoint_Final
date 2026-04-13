'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const path = require('path');
const http = require('http');
const routes = require('./routes');
const activity = require('./routes/activity');

// EXPRESS CONFIGURATION
const app = express();

// CORS Configuration - CRITICAL for Marketing Cloud
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Basic config
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Development error handler
if (app.get('env') === 'development') {
    app.use(errorhandler());
}

// Default routes
app.get('/', routes.index);
app.post('/', activity.execute);
app.post('/login', routes.login);
app.post('/logout', routes.logout);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            hasClientId: !!process.env.CLIENT_ID,
            hasClientSecret: !!process.env.CLIENT_SECRET,
            hasSubdomain: !!process.env.SUBDOMAIN
        }
    });
});

// =========================
// Journey Builder Endpoints
// =========================

// Required SFMC endpoints
app.post('/journeybuilder/save', activity.save);
app.post('/journeybuilder/validate', activity.validate);
app.post('/journeybuilder/publish', activity.publish);
app.post('/journeybuilder/execute', activity.execute);
app.post('/journeybuilder/edit', activity.edit);
app.post('/journeybuilder/stop', activity.stop);

// Backward-compatible endpoints (optional)
app.post('/save', activity.save);
app.post('/validate', activity.validate);
app.post('/publish', activity.publish);
app.post('/execute', activity.execute);
app.post('/edit', activity.edit);
app.post('/stop', activity.stop);

// Test endpoint
app.post('/test-endpoint', activity.testEndpoint);

// Debug logs
app.get('/debug-log', activity.debugLog);

// =========================
// Removed problematic routes
// =========================
// These caused the "Route.get() requires a callback" error earlier
// because their handlers were undefined or unnecessary in this setup

// app.get('/journeys', activity.getJourneys);
// app.get('/activity/:uuid', activity.getActivityByUUID);

// =========================
// Server start
// =========================
const port = process.env.PORT || 3000;

http.createServer(app).listen(port, '0.0.0.0', function () {
    console.log('Express server listening on port ' + port);
});

module.exports = app;
