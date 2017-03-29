'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

// Import resources
const restaurants = require('./restaurants');
const menu = require('./menu');

// TODO: Set the correct AWS region for your app
AWS.config.update({ region: 'us-west-2' });

// declare a new express app
const app = express();
app.use(bodyParser.json());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// The DocumentClient class allows us to interact with DynamoDB using normal objects. 
// Documentation for the class is available here: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html
const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**********************
 * Restaurant methods *
 **********************/

app.get('/restaurants', function(req, res) {
    restaurants.getRestaurants(null, dynamoDb, function(status, data) {
        res.status(status).json(data);
    });
});

app.post('/restaurants', function(req, res) {
    restaurants.createRestaurant(req.body, dynamoDb, function(status, data) {
        res.status(status).json(data);
    });
});

app.get('/restaurants/:restaurantId', function(req, res) {
    restaurants.getRestaurant(req.params.restaurantId, dynamoDb, function(status, data) {
        res.status(status).json(data);
    });
});


/***************************
 * Restaurant menu methods *
 ***************************/

app.get('/restaurants/:restaurantId/menu', function(req, res) {
    menu.getRestaurantMenu(req.params.restaurantId, dynamoDb, function(status, data) {
        res.status(status).json(data);
    });
});

app.post('/restaurants/:restaurantId/menu', function(req, res) {
    menu.createMenuItem(req.params.restaurantId, req.body, dynamoDb, function(status, data) {
        res.status(status).json(data);
    });
});

app.get('/restaurants/:restaurantId/menu/:itemId', function(req, res) {
    menu.getMenuItem(req.params.restaurantId, req.params.itemId, dynamoDb, function(status, data) {
        res.status(status).json(data);
    });
});

if (!process.env.RESTAURANTS_TABLE) {
    let server = app.listen(function() {
        let host = server.address().address;
        if (host == "::") {
            host = "localhost";
        }
        let port = server.address().port;
        console.log("Example app listening at http://%s:%s/restaurants", host, port);
    })
}

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from 
// this file
module.exports = app;
