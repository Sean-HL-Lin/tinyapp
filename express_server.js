const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));


function generateRandomString() {
  const choice = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = '';
  for(let i = 1; i <= 6; i ++) {
    result += choice[Math.floor(Math.random() * choice.length)];
  }  
  return result;
}  


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs')


// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  console.log(req.cookies["username"])
  res.render('urls_index',{urls: urlDatabase, username: req.cookies["username"]});
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {username: req.cookies["username"]});
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render('urls_show.ejs', templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  const shorturl = generateRandomString();
  urlDatabase[shorturl] =  req.body.longURL;
  res.send();///////
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {

  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls');
})

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongURL
  res.redirect(`/urls/${req.params.shortURL}`)
} )

app.post('/login', (req, res) => {
  const name = req.body.username;
  res.cookie('username',name)
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  console.log(req.body.username)
  res.clearCookie('username');
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
