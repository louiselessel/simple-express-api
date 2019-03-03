// tells your application to bring in all the functions of express and make them available
const express = require('express');

// SET UP nedb
// step 1: path - helps us handle path variables
const path = require('path');
// step 2:
// Type 3: Persistent datastore with automatic loading
const Datastore = require('nedb');
// step 3: get the path to our nedb instance =/db)
const pathToData = path.resolve(__dirname, "db/db")
// step 4: define db by creating a new Datastore and setting the path to our "pathToData"
const db = new Datastore({ filename: pathToData});
// step 5: load database
db.loadDatabase();


//--------------------------


// init express app
const app = express();

// Handling JSON data. Puts it in request.body
// express, whenever a post request comes in whether from a form or via API call, handle it as json and make it easy to grab from the request
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({extended:true})); // to support URL-encoded bodies

// add some demo data in json
/*let myData = [
    {id:1, color:"red", x:50, y: 200},
    {id:2, color:"orange", x:100, y: 200},
    {id:3, color:"yellow", x:150, y: 200},
    {id:4, color:"green", x:200, y: 200},
    {id:5, color:"blue", x:250, y: 200},
    {id:6, color:"purple", x:300, y: 200}
];*/

// SERVER SIDE STUFF ---------------------

// add initial api endpoint
// If a GET request (app.get()...) is made to your server at the baseurl, send the message:
app.get("/", (request, response) => {
    response.send("thank you for the request");
});

// GET - /api
/*app.get("/api",(request, response) =>{
    response.json(myData);
});*/
app.get("/api", (request, response) => {    
    // db references our nedb instance
    // we use "find" and an empty search {} to give us back all the data in the db
    db.find({}, function (err, docs) {
        if(err){
            return err;
        } 
        // like before we send the json response
        response.json(docs);
    });
});

// POST - /api
/*app.post("/api", (request, response) => {
    // create a random ID to reference your data later on
    let randomId = Math.floor(Math.random()*1000);
    // Take our data from request.body and add the randomId to it as an id property
    const newData = Object.assign({id: randomId}, request.body);
    // push this newData object into myData
    myData.push(newData);
    // return the updated data
    response.json(myData)
});*/
app.post("/api", (request, response) => {
    // add unix timestamp
    const unixTimeCreated = new Date().getTime();
    // add our unix time as a "created" property and add it to our request.body
    const newData = Object.assign({"created": unixTimeCreated}, request.body)

    // add in our data object to our database using .insert()
    db.insert(newData, (err, docs) =>{
        if(err){
            return err;
        }
        response.json(docs);
    });
})

// PUT - /api
/*app.put("/api/:id", (request, response)=> {
    // we get the id of the item we want from request.params.id ==> this matches the :id of the URL parameter
    // Step 1: get id from request
    const selectedItemId = request.params.id;
    // Step 2: get the update to the data
    const updatedDataProperties = request.body

    // Step 3: now find the item in our myData
    let selectedItem = myData.find(item => {
        return item.id === Number(selectedItemId)
    });

    // Step 4: if our data is undefined - can't be found - then send a 404 error and send this message
    if(selectedItem == undefined){
        response.status(404).send("oops! we couldn't find that data!");
    }

    // Step 5: for the properties in the incoming json, update our selected object 
    for(p in updatedDataProperties){
        selectedItem[p] = updatedDataProperties[p]
    }

    // Step 6: update myData with the updated data
    myData = myData.map(item => {
        if(item.id == Number(selectedItemId) ){
            return selectedItem
        } else {
            return item
        }
    });

    // Step 7: send back our new myData
    response.json(myData)
});*/
// PUT - /api
app.put("/api/:id", (request, response)=> {
    // we get the id of the item we want from request.params.id ==> this matches the :id of the URL parameter
    const selectedItemId = request.params.id;
    const updatedDataProperties = request.body

    
   // Set an existing field's value
   db.update({ _id: selectedItemId  }, { $set: updatedDataProperties }, (err, numReplaced) => {
       if(err){
           response.status(404).send("uh oh! something went wrong on update");
       }
        // redirect to "GET" all the latest data
        response.redirect("/api")
   });

});

// DELETE - /api
/*app.delete('/api/:id', (request, response) => {
    // we get the id of the item we want from request.params.id ==> this matches the :id of the URL parameter
    const selectedItemId = request.params.id;

    // use the .filter() function to return all values not matching that id and overwrite myData
    myData = myData.filter(item => {
        return item.id !== Number(selectedItemId)
    })

    response.json(myData);
});*/
app.delete('/api/:id', (request, response) => {
    // we get the id of the item we want from request.params.id ==> this matches the :id of the URL parameter
    const selectedItemId = request.params.id;

    db.remove({ _id: selectedItemId }, {}, function (err, numRemoved) {
        if(err){
           response.status(404).send("uh oh! something went wrong on delete");
          }
         // numRemoved = 1
         response.redirect("/api")
      });

})


// add a port to listen to
app.listen(3030, () => {
    console.log("go to http://localhost:3030");
});
