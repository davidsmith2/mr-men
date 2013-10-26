var express = require('express'),
    path = require('path'),
    mongoose = require('mongoose'),
    cons = require('consolidate');

var app = express(),
    databaseUrl = 'mongodb://localhost/mr_men_database';

app.engine('dust', cons.dust);

app.configure(function () {
    app.set('view engine', 'dust');
    app.set('views', __dirname + '/views');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(
        express.static(
            path.join(
                __dirname, 'public'
            )
        )
    );
    app.use(
        express.errorHandler({
            dumpExceptions: true,
            showStack: true
        })
    );
});

var port = 4712;

app.listen(port, function () {
    console.log('Express server listening on port %d in %s mode', port, app.settings.env);
});

var db = mongoose.connect(databaseUrl);

var Book = new mongoose.Schema({
    image: String,
    title: String,
    author: String,
    number: Number,
    publicationDate: Date
});

var BookModel = mongoose.model('Book', Book);

app.get('/', function (req, res) {
    res.render('index', {
        title: 'Mr. Men Books'
    });
});

app.get('/books', function (req, res) {
    var cols = ['title', 'author', 'number', 'publicationDate'],
        iDisplayLength = req.query.iDisplayLength,
        iDisplayStart = req.query.iDisplayStart,
        iSortCol_0 = req.query.iSortCol_0,
        sSortDir_0 = req.query.sSortDir_0,
        sEcho = req.query.sEcho;

    var q1 = BookModel.find();

    q1.execFind(function (err, books) {
        var total = books.length;
        var sortCol = cols[iSortCol_0];
        var sortDir = (sSortDir_0 === 'desc') ? '-' : '';
        var q2 = BookModel
            .find()
            .sort(sortDir + sortCol)
            .limit(iDisplayLength)
            .skip(iDisplayStart);

        q2.execFind(function (err, books) {
            var map = {};

            if (!err) {
                map.sEcho = parseInt(sEcho, 10);
                map.iTotalRecords = total;
                map.iTotalDisplayRecords = total;
                map.aaData = books;
                res.send(map);
            } else {
                return console.log(err);
            }
        });
    });
});

app.get('/api', function (req, res) {
    return res.send('API is running');
});

app.get('/api/books', getBooks);

function getBooks (req, res) {
    return BookModel.find(function (err, books) {
        if (!err) {
            return res.send(books);
        } else {
            return console.log(err);
        }
    });
}

app.post('/api/books', addBook);

function addBook (req, res) {
    var book = new BookModel({
        title: req.body.title,
        author: req.body.author,
        number: req.body.number,
        publicationDate: req.body.publicationDate
    });

    book.save(function (err) {
        if (!err) {
            return console.log('created');
        } else {
            return console.log(err);
        }
    });

    return res.send(book);
}
