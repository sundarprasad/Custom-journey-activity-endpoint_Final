// 1. Initialize Postmonger session at the top
var connection = new Postmonger.Session();
var payload = {};
var schema = [];

// 2. Add the window.ready logic to break the loading spinner
$(window).ready(function() {
    connection.trigger('ready'); // CRITICAL: This stops the loading spinner
    connection.trigger('requestSchema'); // Request schema on initialization
});

// 3. Your existing initActivity logic
connection.on('initActivity', function(data) {
    if (data) { 
        payload = data; 
    }
    // Hydrate existing values if activity was already configured
    hydrateFromExistingPayload();
});

// 4. Handle requestedSchema to get field names
connection.on('requestedSchema', function (data) {
    // Validate that schema data exists
    if (!data || !data.schema) {
        console.warn('No schema data received');
        return;
    }
    
    schema = data.schema;
    
    // Populate field checkboxes
    var $fieldSelection = $('#fieldSelection');
    $fieldSelection.empty();
    
    schema.forEach(function(field) {
        if (!field || !field.key) {
            return;
        }
        
        var fieldName = field.name || field.key;
        var checkbox = $('<div style="margin-bottom: 8px;">' +
            '<label style="cursor: pointer;">' +
            '<input type="checkbox" class="field-checkbox" value="' + field.key + '" style="margin-right: 8px;">' +
            fieldName +
            '</label>' +
            '</div>');
        
        $fieldSelection.append(checkbox);
    });
    
    // Hydrate after populating fields
    hydrateFromExistingPayload();
});

function save() {
    var endpointUrl = ($('#endpointUrl').val() || '').trim();
    
    // Get all selected fields
    var selectedFields = {};
    $('.field-checkbox:checked').each(function() {
        var fieldKey = $(this).val(); // e.g., "Event.DEKey.email"
        
        // Extract the actual field name from the schema key
        // If fieldKey is "Event.DEKey.email", extract "email"
        var parts = fieldKey.split('.');
        var actualFieldName = parts[parts.length - 1];
        
        // Store as actualFieldName: "{{Event.DEKey.FieldName}}"
        selectedFields[actualFieldName] = '{{' + fieldKey + '}}';
    });

    // Initialize payload structure if not exists
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};
    payload.metaData = payload.metaData || {};

    // Build inArguments with endpoint URL and field mappings
    payload.arguments.execute.inArguments = [{
        endpointUrl: endpointUrl || null,
        fieldMappings: selectedFields
    }];
    
    payload.metaData.isConfigured = true;
    connection.trigger('updateActivity', payload);
}

function hydrateFromExistingPayload() {
    var existing = payload && payload.arguments && payload.arguments.execute && payload.arguments.execute.inArguments;
    if (!existing || existing.length === 0) {
        return;
    }

    var args = existing[0] || {};
    
    // Restore endpoint URL
    if (args.endpointUrl) {
        $('#endpointUrl').val(args.endpointUrl);
    }

    // Restore selected fields
    if (args.fieldMappings && typeof args.fieldMappings === 'object') {
        $('.field-checkbox').each(function() {
            var fieldKey = $(this).val();
            var parts = fieldKey.split('.');
            var fieldName = parts[parts.length - 1];
            
            // Check if this field was previously selected
            if (args.fieldMappings.hasOwnProperty(fieldName)) {
                $(this).prop('checked', true);
            }
        });
    }
}

// 5. Connect the Salesforce 'Next' button to your save function
connection.on('clickedNext', save);
