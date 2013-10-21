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
    var params = req.query,
        cols = [
            params.mDataProp_0,
            params.mDataProp_1,
            params.mDataProp_2,
            params.mDataProp_3
        ],
        iDisplayLength = params.iDisplayLength,
        iDisplayStart = params.iDisplayStart,
        iSortCol_0 = params.iSortCol_0,
        sSortDir_0 = params.sSortDir_0,
        sEcho = params.sEcho;

    var sortCol = cols[iSortCol_0],
        sortDir = (sSortDir_0 === 'desc') ? '-' + sortCol: sortCol;

    var q1 = BookModel.find(),
        q2 = BookModel.find().sort(sortDir).limit(iDisplayLength).skip(iDisplayStart);

    q1.execFind(function (err, books) {
        var iTotalRecords = books.length;

        q2.execFind(function (err, books) {
            if (!err) {
                res.send({
                    sEcho: parseInt(sEcho, 10),
                    iTotalRecords: iTotalRecords,
                    iTotalDisplayRecords: iTotalRecords,
                    aaData: books
                });
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
