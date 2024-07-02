var express = require('express');
const session = require('express-session');
//var ejs=require('ejs');
var path = require('path');
var app = express();

app.use(session({ secret: 'prognoz', resave: false, saveUninitialized: true }));

app.use('/Images', express.static('Images'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

var mysql = require('mysql');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Divya@1234",
    database: "studentdb"
})

function ensureAuthenticated(req, res, next) {            //route level middleware
    if (req.session && req.session.authenticated) {
        next();
    } else {
        res.send(`
        <script>
        alert("Please log in to access this page.");
        window.location.href='/login';
        </script>
        `);
    }
}

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/home.html');
})

app.get('/register', function (req, res) {
    res.sendFile(__dirname + '/registration.html');
})

app.post("/submit-data", function (req, res) {
    var sid = req.body.sid;
    var sname = req.body.sname;
    var lname = req.body.lname;
    var email = req.body.email;
    var age = req.body.age;
    var city = req.body.city;
    var state = req.body.state;
    var country = req.body.country;
    var marks = req.body.marks;

    conn.connect(function (err) {
        var sql = "insert into student(sid,sname,lname,email,age,city,state,country,marks) values(" + sid + ",'" + sname + "','" + lname + "','" + email + "'," + age + ",'" + city + "','" + state + "','" + country + "'," + marks + ")";
        conn.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Record Inserted");
            res.redirect('/register');
        })
    })
})

app.get('/update', ensureAuthenticated, function (req, res) {
    res.sendFile(__dirname + '/update.html');
})

app.post("/update-data", ensureAuthenticated, function (req, res) {
    var sid = req.body.sid;
    var sname = req.body.sname;
    var email = req.body.email;
    var age = req.body.age;
    var city = req.body.city;
    var state = req.body.state;
    var country = req.body.country;
    var marks = req.body.marks;

    conn.connect(function (err) {
        var sql = "update student set sname='" + sname + "',email='" + email + "',age=" + age + ",city='" + city + "',state='" + state + "',country='" + country + "',marks=" + marks + " where sid=" + sid + "";
        conn.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Record Updated");
            res.redirect('/update');
        })
    })
})

app.get('/delete', ensureAuthenticated, function (req, res) {
    res.sendFile(__dirname + '/delete.html');
})

app.post("/delete-data", ensureAuthenticated, function (req, res) {
    var sid = req.body.sid;
    conn.connect(function (err) {
        var sql = "delete from student where sid=" + sid + "";
        conn.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Record Deleted");
            res.redirect('/delete');
        })
    })
})

app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/login.html');
});

app.post('/login-data', function (req, res) {
    var username = req.body.name;
    var password = req.body.pwd;
    if (username && password) {      //selects all fields from the login table where the username and password match the provided values.
        conn.query('SELECT * FROM login WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results.length > 0) {     //checks if the query returned any rows, meaning there is a matching user
                req.session.authenticated = true;
                res.redirect('/');
            } else {
                res.send(`
                <script>
                alert("Incorrect Username or Password!");
                window.location.href='/login';
                </script>
                `);
            }
            res.end();
        });
    }
});

app.get('/', function (req, res) {
    if (req.session && req.session.authenticated) {
        res.send('Welcome back');
    } else {
        res.redirect('/login');
    }
    res.end();
});

app.get('/contactus', function (req, res) {
    res.sendFile(__dirname + '/contactus.html')
});

app.get('/batch-info', function (req, res) {
    res.sendFile(__dirname + '/batchinfo.html')
});

app.post("/batch-info", function (req, res) {
    var bid = req.body.bid;
    var sid = req.body.sid;
    var bname = req.body.bname;
    var course = req.body.course;
    conn.connect(function (err) {
        var sql = "update batchinfo set bid=" + bid + ",bname='" + bname + "',course='" + course + "' where sid=" + sid + "";
        conn.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Batchinfo Details Inserted");
            res.redirect('/batch-info');
        })
    })
})

app.get('/batch-modify', function (req, res) {
    res.sendFile(__dirname + '/batchupdate.html')
});

app.post("/batch-up", function (req, res) {
    var bid = req.body.bid;
    var sid = req.body.sid;
    var bname = req.body.bname;
    var course = req.body.course;
    var batchstartdate = req.body.batchstartdate;
    conn.connect(function (err) {
        var sql = "update batchinfo set sid=" + sid + ",bname='" + bname + "',course='" + course + "',batchstartdate='" + batchstartdate + "' where bid=" + bid + "";
        conn.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Batchinfo Details Updated");
            res.redirect('/batch-modify');
        })
    })
})

app.get('/batch-remove', function (req, res) {
    res.sendFile(__dirname + '/batchinfodlt.html')
});

app.post("/batch-dlt", function (req, res) {
    var bid = req.body.bid;
    conn.connect(function (err) {
        var sql = "delete from batchinfo where bid=" + bid + "";
        conn.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Batchinfo Details Deleted");
            res.redirect('/batch-remove');
        })
    })
})

app.get('/markattendance', function (req, res) {
    res.sendFile(__dirname + '/attendance.html')
});

app.post('/attendance', function (req, res) {
    var bid = req.body.bid;
    var sid = req.body.sid;
    var status = req.body.status;
    conn.connect(function (err) {
        var sql = "update attendance set sid=" + sid + ",status='" + status + "' where bid=" + bid + "";
        conn.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Attendance Marked");
            res.redirect('/markattendance');
        })
    })
})

app.get('/modify-attendance', function (req, res) {
    res.sendFile(__dirname + '/att_update.html')
});

app.post('/att-update', function (req, res) {
    var bid = req.body.bid;
    var sid = req.body.sid;
    var status = req.body.status;
    var DateofAttendance = req.body.DateofAttendance;
    conn.connect(function (err) {
        var sql = "update attendance set sid=" + sid + ",status='" + status + "',DateofAttendance='" + DateofAttendance + "' where bid=" + bid + "";
        conn.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Attendance Updated");
            res.redirect('/modify-attendance');
        })
    })
})

app.get('/remove-attendance', function (req, res) {
    res.sendFile(__dirname + '/att_dlt.html')
});

app.post('/att-dlt', function (req, res) {
    var bid = req.body.bid;
    conn.connect(function (err) {
        var sql = "delete from attendance where bid=" + bid + "";
        conn.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Attendance Removed");
            res.redirect('/remove-attendance');
        })
    })
})

app.get('/test4', ensureAuthenticated, function (req, res) {
    var sql = "select * from student";
    conn.query(sql, function (err, rows) {
        if (err) throw err;
        res.render('select', {
            studs: rows
        });
    });
});

app.get('/batch', function (req, res) {
    var sql = "select * from batchinfo";
    conn.query(sql, function (err, rows) {
        if (err) throw err;
        res.render('batch', {
            studs: rows
        });
    });
});

app.get('/attend', function (req, res) {
    var sql = "select Bid,Sid,sname,status,DateofAttendance from student join attendance using (sid)";
    conn.query(sql, function (err, rows) {
        if (err) throw err;
        res.render('attend', {
            studs: rows
        });
    });
});

app.listen(4000);
console.log("Server started with port 4000");