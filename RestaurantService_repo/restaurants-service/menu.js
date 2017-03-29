'use strict'
const uuid = require('node-uuid');

const MENU_TABLE = ( process.env.MENUS_TABLE ? process.env.MENUS_TABLE : "lab_menu_item" );

module.exports = {
    // performs a DynamoDB Scan operation to extract all of the records in the table
    getRestaurantMenu: function(restaurantId, ddbClient, callback) {
        if (!restaurantId) {
            callback(400, {
                message: "Invalid restaurant ID"
            });
        }
        ddbClient.query({
            TableName: MENU_TABLE,
            KeyConditions: {
                restaurant_id: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [ restaurantId]
                }
            }
        }, function(err, data) {
            if (err) {
                console.log(err);
                callback(500, {
                    message: "Could not load restaurant menu"
                });
            } else {
                callback(200, data['Items']);
            }
        });
    },

    // Create a new menu item in the database.
    createMenuItem: function(restaurantId, data, ddbClient, callback) {
        if (!data.name || !data.description) {
            callback(400, {
                message: "Name and description are mandatory fields"
            });
        }

        let menuItem = {};
        menuItem["id"] = uuid.v4();
        menuItem["restaurant_id"] = restaurantId;
        menuItem["name"] = data.name;
        menuItem["description"] = data.description;
        
        ddbClient.put({
            TableName: MENU_TABLE,
            Item: menuItem
        }, function(err, data) {
            if (err) {
                console.log(err);
                callback(500, {
                    message: "Could not create menu item"
                });
            } else {
                callback(201, menuItem);
            }
        });
    },

    getMenuItem: function(restaurantId, menuItemId, ddbClient, callback) {
        if (!restaurantId || !menuItemId) {
            callback(400, {
                message: "Invalid restaurant or menu item ID"
            });
        }
        ddbClient.get({ 
            TableName: MENU_TABLE,
            Key: {
                restaurant_id: restaurantId,
                id: menuItemId
            }
        }, function(err, data) {
            if (err) {
                console.log(err);
                callback(500, {
                    message: "Could not load menu item"
                });
            } else {
                if (data['Item']) {
                    callback(200, data['Item']);
                } else {
                    callback(404, {
                        message: "The menu item does not exist"
                    });
                }
            }
        });
    }
}