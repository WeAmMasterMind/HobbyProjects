const express = require("express");
const main = express.Router();

module.exports = main;

main.get("/highscores", function(req, res){
    query = "SELECT * FROM users ORDER BY user_score DESC limit 5";

    global.db.all(query, 
        function (err, result) {
            if (err) {
                next(err); 
            } else {
                res.render("highscores.ejs", {scores: result});
            }
        }
    );
});

main.post("/save", function(req,res) {
    query = "INSERT INTO users (user_name, user_score) VALUES ( ?,? );";
    query_parameters = [req.body.name, req.body.final_score];

    global.db.run(query, query_parameters,
        function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/highscores");
            }
        }
    );
});
