"use strict";

// Initialize Postmonger session
var connection = new Postmonger.Session();
var payload = {};

/*
 * 🔥 Step 1: Stop spinner + initialize
 */
$(window).ready(function () {
    connection.trigger("ready");              // REQUIRED
    connection.trigger("requestTokens");      // Optional but good
    connection.trigger("requestEndpoints");   // Optional
});

/*
 * 🔥 Step 2: Initialize activity
 */
connection.on("initActivity", function (data) {
    console.log("initActivity:", data);

    if (data) {
        payload = data;
    }

    hydrateFromExistingPayload();
});

/*
 * 🔥 Step 3: Save configuration
 */
function save() {
    var endpointUrl = ($("#endpointUrl").val() || "").trim();

    if (!endpointUrl) {
        alert("Please enter endpoint URL");
        return;
    }

    // Ensure structure exists
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};

    // ✅ ONLY store endpointUrl
    payload.arguments.execute.inArguments = [
        {
            endpointUrl: endpointUrl
        }
    ];

    payload.metaData = payload.metaData || {};
    payload.metaData.isConfigured = true;

    console.log("Saving payload:", JSON.stringify(payload, null, 2));

    connection.trigger("updateActivity", payload);
}

/*
 * 🔥 Step 4: Restore existing config
 */
function hydrateFromExistingPayload() {
    try {
        var existing = payload?.arguments?.execute?.inArguments;

        if (!existing || existing.length === 0) return;

        var args = existing[0];

        if (args.endpointUrl) {
            $("#endpointUrl").val(args.endpointUrl);
        }

    } catch (e) {
        console.warn("Hydration failed:", e);
    }
}

/*
 * 🔥 Step 5: Next button handler
 */
connection.on("clickedNext", save);

/*
 * 🔥 Step 6: Test Connection
 */
$("#testConnection").on("click", function () {
    var endpointUrl = ($("#endpointUrl").val() || "").trim();
    var $btn = $(this);
    var $result = $("#testResult");

    if (!endpointUrl) {
        $result.css({
            display: "block",
            backgroundColor: "#fef0e1",
            color: "#8c4b0a",
            border: "1px solid #f0ad4e"
        }).text("Please enter an endpoint URL first.");
        return;
    }

    $btn.prop("disabled", true).text("Testing...");

    $result.css({
        display: "block",
        backgroundColor: "#e8f4fd",
        color: "#032d60",
        border: "1px solid #1589ee"
    }).text("Sending test request...");

    $.ajax({
        url: "/test-endpoint",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            endpointUrl: endpointUrl
        }),
        success: function (data) {
            if (data.success) {
                $result.css({
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    border: "1px solid #28a745"
                }).html(
                    "<strong>Status " + data.status + "</strong><br>Response: " +
                    $("<span>").text(JSON.stringify(data.response)).html()
                );
            } else {
                $result.css({
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    border: "1px solid #dc3545"
                }).text("Error: " + (data.error || "Unknown error"));
            }
        },
        error: function (xhr) {
            $result.css({
                backgroundColor: "#f8d7da",
                color: "#721c24",
                border: "1px solid #dc3545"
            }).text("Request failed: " + xhr.statusText);
        },
        complete: function () {
            $btn.prop("disabled", false).text("Test Connection");
        }
    });
});
