var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var multer = require('multer');

// configure multer
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, 'images/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

var upload = multer({ //multer settings
                    storage: storage
                }).single('file');

app.use(cors());

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/howhowdb');
mongoose.connection.once('open', function() {
  // we're connected!
  console.log("Connected to db.");
});



var How = require('./app/models/how');







var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.post('/uploads', function(req, res) {
	console.log('UPLOADS: uploading something');
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            console.log('file uploaded: '+req.file.filename)
             res.json({error_code:0,err_desc:null,filename:req.file.filename});
        })
    });

router.route('/hows')
    // create a how (accessed at POST http://localhost:8080/howhow/api/hows)
    .post(function(req, res) {
        console.log('received POST. addHow.');
        var how = new How();      // create a new instance of the Bear model

        if(req.body.new_how == null)
        	console.log('req.body.new_how is null');

        var newHow = req.body.new_how;
        
        how.title = newHow.title;
        how.image_icon = newHow.image_icon;
        how.steps = newHow.steps || [];
        how.upvotes = 0;

        console.log("NEW howto", how);
        // save the bear and check for errors
        how.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'How created!' + how });
        });
    })
    .get(function(req, res) {
        How.find(function(err, hows) {
            if (err)
                res.send(err);

            res.json(hows);
        });
    });

router.route('/hows/search')
    .get(function(req, res) {
    	console.log("SEARCH: "+req.query.search_text);

        How.find({$text:{$search: req.query.search_text}}, function(err, how) {
            if (err)
            {
            	console.log('SEARCH: ERR:',err);
                res.send(err);
            }

            res.json(how);
        });
    })

router.route('/hows/:how_id')
    .get(function(req, res) {
        How.findById(req.params.how_id, function(err, how) {
            if (err)
                res.send(err);
            res.json(how);
        });
    })
    .put(function(req, res) {
        How.findById(req.params.how_id, function(err, how) {
            if (err)
                res.send(err);

	        var newHow = req.body.new_how;
        	console.log("UPDATE howto", newHow);
	        
	        how.title = newHow.title;
	        how.image_icon = newHow.image_icon;
        	how.steps = newHow.steps || [];
        	how.upvotes = newHow.upvotes || 0;

            // save the wiki
            how.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'How updated!' });
            });
        });
    })
    .delete(function(req, res) {
        How.remove({
            _id: req.params.how_id
        }, function(err, how) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/howhow/api', router);


// use folder to serve static content
app.use('/static', express.static('images'));




// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);