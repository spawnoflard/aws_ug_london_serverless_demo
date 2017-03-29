'use strict'
const uuid = require('node-uuid');

const RESTAURANTS_TABLE = ( process.env.RESTAURANTS_TABLE ? process.env.RESTAURANTS_TABLE : "lab_restaurants" );

module.exports = {
    // performs a DynamoDB Scan operation to extract all of the records in the table
    getRestaurants: function(filters, ddbClient, callback) {
        ddbClient.scan({ TableName: RESTAURANTS_TABLE }, function(err, data) {
            if (err) {
                console.log(err);
                callback(500, {
                    message: "Could not load restaurants"
                }).end();
            } else {
                callback(200, data['Items']);
            }
        })
    },

    // Create a new restaurant in the database.
    createRestaurant: function(data, ddbClient, callback) {
        if (!data.name) {
            callback(400, {
                message: "Restaurant name is mandatory"
            });
        }

        let restaurant = {};
        restaurant["id"] = uuid.v4();
        
        restaurant["name"] = data.name;
        restaurant["address"] = ( data.address ? data.address : "n/a" );
        restaurant["phone"] = ( data.phone ? data.phone : "n/a" );
        restaurant["rating"] = -1 // default NULL value

        ddbClient.put({
            TableName: RESTAURANTS_TABLE,
            Item: restaurant
        }, function(err, data) {
            if (err) {
                console.log(err);
                callback(500, {
                    message: "Could not create restaurant"
                });
            } else {
                callback(201, restaurant);
            }
        });
    },

    // Extracts a specific restaurant from the databsae. If an invalid restaurantId is sent
    // we will returna 400 status code. If the parameter value is valid but we cannot find 
    // that restaurant in our database we return a 404
    getRestaurant: function(restaurantId, ddbClient, callback) {
        if (!restaurantId) {
            callback(400, {
                message: "Invalid restaurant ID"
            });
        }
        ddbClient.get({ 
            TableName: RESTAURANTS_TABLE,
            Key: {
                id: restaurantId
            } 
        }, function(err, data) {
            if (err) {
                console.log(err);
                callback(500, {
                    message: "Could not load restaurant"
                });
            } else {
                if (data['Item']) {
                    callback(200, data['Item']);
                } else {
                    callback(404, {
                        message: "The restaurant does not exist"
                    });
                }
            }
        });
    }
}