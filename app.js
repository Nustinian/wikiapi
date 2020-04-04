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

app.get("/", (_req, res) => {
	res.send("Hello");
});

app.route("/articles")
    .get((_req, res) => {
	    Article.find(
            {},
            {_id: 0, __v: 0},
            (err, results) => {
		        if (err) {
                    console.log(err);
                    res.send(err);
    		    } else if (results.length != 0) {
    			    res.send(results);
		        } else {
                    res.status(404);
                    res.send({error: "No articles found."});
                }
            }
        )
    })
    .post((req, res) => {
        Article.find(
            {title: req.body.title},
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.send({error: err});
                } else if (results.length != 0) {
                    res.send(
                        {
                            message: `Article ${req.body.title} already exists.`,
                            article: results
                        }
                    );
                } else {
                    const newArticle = new Article ({
                        title: req.body.title,
                        content: req.body.content
                    });
                    newArticle.save();
                    res.redirect('/articles');
                }
            }
        );
    })
    .delete((_req, res) => {
        mongoose.connection.db.dropCollection('articles', (err, result) => {
            if (err) {
                console.log(err);
                res.send({error: err});
            } else {
                console.log(result);
                res.send({message: "Successfully deleted articles."});
            }
        });
    });

app.route("/articles/:title")
    .get((req, res) => {
        const title = req.params.title;
        Article.find(
            {title: title},
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.send({error: err});
                } else if (results.length != 0) {
                    res.send(results);
                } else {
                    res.status(404);
                    res.send({error: "Article not found."});
                }
            }
        );
    })
    .put((req, res) => {
        const title = req.params.title;
        Article.updateOne(
            {title: title},
            {
                title: title,
                content: req.body.content
            },
            {"upsert": true},
            (err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/articles");
                }
            }
        );
    })
    .patch((req, res) => {
        Article.find(
            {title: req.params.title},
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.send({error: err});
                } else if (results.length == 0) {
                    console.log("Could not find article.");
                    res.status(404);
                    res.send({error: "Could not find article."});
                } else {
                    if (req.body.title) {
                        Article.find(
                            {title: req.body.title},
                            (err, results) => {
                                if (err) {
                                    console.log(err);
                                    res.send({error: err});
                                } else if (results.length == 0) {
                                    Article.updateOne(
                                        {title: req.params.title},
                                        {$set: req.body},
                                        (err) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("Successfully patched article.");
                                                res.redirect("/articles");
                                            }
                                        }
                                    )
                                } else {
                                    res.status(400);
                                    res.send({error: `Article with title ${req.body.title} already exists.`});
                                }
                            }
                        );
                    }
                }
            }
        );
    })
    .delete((req, res) => {
        Article.deleteOne(
            {title: req.params.title},
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.send({error: err});
                } else {
                    console.log(results);
                    res.redirect("/articles");
                }
            }
        );
    });

let port = process.env.PORT;
if (port == null | port == "") {
	port = 3000;
}

app.listen(port, () => {
	console.log(`Server started on port ${port}.`)
});

