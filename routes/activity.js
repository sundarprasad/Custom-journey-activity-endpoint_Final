'use strict';
const axios = require("axios");

/*
 * POST Handlers for various routes
 */
exports.edit = function (req, res) {
    res.status(200).json({ success: true });
};

exports.save = async function (req, res) {
    try {
        const payload = req.body;
        await saveToDatabase(payload);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ success: false, error: 'Error saving data' });
    }
};

exports.execute = async function (req, res) {
    try {
        console.log('=== Execute called ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const args = (req.body && req.body.inArguments && req.body.inArguments[0]) ? req.body.inArguments[0] : {};

        const endpointUrl = (args.endpointUrl || process.env.ENDPOINT_URL || '').trim();
        const fieldMappings = (args.fieldMappings && typeof args.fieldMappings === 'object') ? args.fieldMappings : {};

        console.log('Endpoint URL:', endpointUrl);
        console.log('Field Mappings:', JSON.stringify(fieldMappings, null, 2));

        if (!endpointUrl) {
            console.error('Execute error: missing endpointUrl (set in UI or env ENDPOINT_URL)');
            return res.status(200).json({ success: false, error: 'Missing endpointUrl' });
        }
        
        if (Object.keys(fieldMappings).length === 0) {
            console.error('Execute error: no fields selected');
            return res.status(200).json({ success: false, error: 'No fields selected' });
        }

        // Journey Builder will have already resolved {{...}} templates into actual values
        await postToEndpoint(endpointUrl, fieldMappings);

        console.log(`Successfully posted data to endpoint: ${endpointUrl}`);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error during endpoint POST execution:', error.response ? error.response.data : error.message);
        return res.status(200).json({ success: false }); // Do not stop the journey
    }
};


exports.publish = function (req, res) {
    res.status(200).json({ success: true });
};

exports.validate = function (req, res) {
    res.status(200).json({ success: true });
};

exports.stop = function (req, res) {
    res.status(200).json({ success: true });
};

/*
 * Function to POST data to an external endpoint
 */
async function postToEndpoint(endpointUrl, fieldMappings) {
    console.log('Posting to endpoint:', endpointUrl);
    console.log('Payload:', JSON.stringify(fieldMappings, null, 2));

    const response = await axios.post(endpointUrl, fieldMappings, {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 10000
    });

    console.log('Endpoint response status:', response.status);
    console.log('Endpoint response data:', JSON.stringify(response.data, null, 2));
    return response.data;
}

/*
 * GET Handler for /journeys route
 */
exports.getJourneys = async function (req, res) {
    res.status(404).json({ error: 'Not implemented in DE copy mode' });
}

/*
 * Function to retrieve journeys
 */
async function fetchJourneys() {
    throw new Error('Not implemented');
}

/*
 * Handler to get activity data by UUID
 */
exports.getActivityByUUID = async function (req, res) {
    res.status(404).send('Not implemented in DE copy mode');
}


/*
 * Function to save data to the database
 */
async function saveToDatabase() {
    return;
}
