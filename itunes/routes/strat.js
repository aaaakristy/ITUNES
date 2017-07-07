var express = require('express');
var mysql = require('mysql');
//var router = express.Router();
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

var ziptechJson;

app.use(bodyParser.json());

var pool = mysql.createPool({
    host: "uwb00034.ute.fedex.com",
    user: "interns",
    password: "interns123",
    database: 'ITUNESDB',
    insecureAuth: true,
    multipleStatements: true

});


/////////////////////////////////
//////Upload zip tech files//////
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({ //multer settings
    storage: storage,
    fileFilter: function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

/** API path that will upload the files */
app.post('/uploadZipTechAssign', function(req, res) {
    console.log("Successful post request made to uploadZipTechAssign");
    var exceltojson;
    upload(req, res, function(err) {
        if (err) {
            res.json({
                error_code: 1,
                err_desc: err
            });
            console.log("error was thrown");
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.json({
                error_code: 1,
                err_desc: "No file passed"
            });
            console.log("no req file found");
            return;
        }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        console.log(req.file.path);
        try {
            exceltojson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders: true
            }, function(err, result) {
                if (err) {
                    return res.json({
                        error_code: 1,
                        err_desc: err,
                        data: null
                    });
                }
                res.json({
                    error_code: 0,
                    err_desc: null,
                    data: result
                });
                //upload the json file to the database
                ziptechJson = result;
                uploadZipTechAssignToServer(result);

            });
        } catch (e) {
            res.json({
                error_code: 1,
                err_desc: "Corupted excel file"
            });
        }
    })

});
//////uplaod file ends///////

function uploadZipTechAssignToServer(data) {
    console.log("inside uploadZipTechAssignToServer");
    console.log(ziptechJson);
    var query = "";
    var val;
    var zip;
    var systype;
    var emp;
    for (var key in data) {

        val = data[key];
        zip = val.zip;
        systype = val.systype;
        emp = val.emp;
        console.log(val.emp);
        console.log(val.systype);
        console.log(val.zip);


        query += "insert into zipTechAssign (zip, systemType, employeeID) values (" + zip + "," + "'" + systype + "'" + "," + emp + ")" + ";";
    }
    console.log(query);
    // pool.getConnection(function(err, connection) {
    //   if (err) {
    //              throw err;
    //          }
    //          else if (connection) {
    //              connection.query("insert into zipTechAssign (zip, systemType, employeeID) values (" + queryArray[indexCount] + ")", function (err, rows, fields) {
    //                connection.release();
    //                if (err) {
    //                      throw err;
    //                  }
    //              })
    //          }
    //          else {
    //              console.log("No connection", null);
    //          }
    //          console.log("inside getconnection");
    //      });

    pool.getConnection(function(err, connection) {
        if (err) throw err;
        else if (connection) {
            connection.query(query, function(err, rows, fields) {
                if (err) throw err;
                console.log("zipTechAssign Data Successfully injected to database");
                connection.release();
            })
        } else {
            console.log("No connection", null);
        }
        console.log("inside getconnection");
    });
    connection.end();

}



app.get("/strat", function(req, res) {
    console.log("Successful GET Request to /strat");
    res.sendFile("/opt/fedex/web/secure/public/itunes/views/strat.html");
});

app.post("/strat", function(req, res) {
    console.log("Successful POST Request to /strat");
    res.json();
});

app.post("/strat/getallprojects", function(req, res) {
    console.log("Successful POST Request to /strat/getallprojects");
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query("select * from projects", function(err, rows) {
            if (err) throw err;
            console.log("Successfully selected Project data");
            connection.release();
            res.send(rows);
        });
        //connection.end();
    });
});

app.post("/strat/getallforecast", function(req, res) {
    console.log("Successful POST Request to /strat/getallforecast");
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query("select * from forecast", function(err, rows) {
            if (err) throw err;
            console.log("Successfully selected forecast data");
            res.send(rows);
            connection.release();
        });
        //connection.end();
    });
});

app.post("/strat/addaddress", function(req, res) {
    console.log("Successful POST Request to /strat");
    res.json();
});

//uploads the project information to sql server
//project information stored in url
//project information mannually entered by user
app.post('/strat/uploadProjectToServer', function(req, res) {
    var name = "" + req.query.name;
    var totalDevices = "" + req.query.totalDevices;
    var tsr = "" + req.query.tsr;
    var dni = "" + req.query.dni;
    var query = "'" + name + "'" + "," + totalDevices + ',' + tsr + ',' + dni;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query("insert into projects (project_name, total_devices, estimated_tsr_hours, estimated_dni_hours) values (" + query + ")", function(err, rows) {
            if (err) throw err;
            console.log("Successfully inserted Project data");
            connection.release();
        });
        //connection.end();
    });
});


module.exports = app;