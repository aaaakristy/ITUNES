var express = require('express');
var app = express();

app.get("//stratover",function(req,res){
  console.log("Successful GET Request to /stratover");
  res.sendFile("/opt/fedex/web/secure/public/itunes/views/stratover.html");
});

module.exports = app;