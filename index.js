// tells your application to bring in all the functions of express and make them available
const express = require('express');

// init express app
const app = express();


// SERVER SIDE

// add api endpoint
// If a GET request (app.get()...) is made to your server at the baseurl, send the message:
app.get("/", (request, response) => {
    response.send("thank you for the request");
});

// add a port to listen to
app.listen(3030, () => {
    console.log("go to http://localhost:3030");
});
