import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let totalCorrect = 0; // to count the total score.
let currentQuestion = {};
let quiz = [];

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "admin",
  port: 5432,
});

db.connect();

db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows;
  }
  db.end();
});

//to get a random record from array.
async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  //setting the current question with the random array.
  currentQuestion = randomCountry;
}

//GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

//POST a new post
app.post("/submit", async (req, res) => {
  let answer = req.body.answer.trim(); //to get rid off any spaces in the beginnig & end.

  let isCorrect = false;
  //checking if the user entered capital is equal to the random question capital.
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion(); //setup the next question with country & capital pair.

  res.render("index.ejs", {
    //rendering the index.ejs passing over the new question.
    question: currentQuestion,
    //letting know the if the user was correct or not.
    wasCorrect: isCorrect,
    //passing the score.
    totalScore: totalCorrect,
  });
});

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
