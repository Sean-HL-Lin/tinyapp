const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  const choice = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = '';
  for(let i = 1; i <= 6; i ++) {
    result += choice[Math.floor(Math.random() * choice.length)];
  }
  return result;
}



const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs')


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  res.render('urls_index',{urls: urlDatabase});
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show.ejs', templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  const shorturl = generateRandomString();
  urlDatabase[shorturl] =  req.body.longURL;
  res.send();
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
