const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikidb", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true});

const articleSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	}
});

const Article = mongoose.model("article", articleSchema);

app.get("/", (req, res) => {
	res.send("Hello");
});

app.get("/articles", (req, res) => {
	Article.find({}, {title: 1}, (err, results) => {
		if (err) {
			console.log(err);
		} else {
			console.log(results);
			res.send(results);
		}
	});
});

app.post("/articles", (req, res) => {
	const newArticle = new Article ({
		title: req.body.title,
		content: req.body.content
	});

	newArticle.save();
});

app.get("/articles/:title", (req, res) => {
	const title = req.params.title;
	Article.find({title: title}, (err, results) => {
		if (err) {
			console.log(err);
		} else if (results) {
			console.log(results);
			res.send(results);
		} else {
			res.send("404");
		}
	});
});


let port = process.env.PORT;
if (port == null | port == "") {
	port = 3000;
}

app.listen(port, () => {
	console.log(`Server started on port ${port}.`)
});

