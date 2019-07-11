const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const helpers = require('./helpers');

app.set('view engine', 'ejs');

//////////////// middlewares ////////////////////////////////
app.use(cookieSession({
  name: 'session',
  keys: ['ThisIsSecret!'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(bodyParser.urlencoded({ extended: true }));

const urlsForUser = function(id) {
  let result = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === id) {
      result[i] = urlDatabase[i];
    }
  }
  return result;
};


/////////////////////// databases //////////////////////////////
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};



///////////////////////////routes/////////////////////////////////////////

/////// basic tests//////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


/////////// urls' ////////////
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const displayURLS = urlsForUser(id);
  const templateVars = { urls: displayURLS, user: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});

//new form
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

//detailed url page
app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, URL: urlDatabase[req.params.id], user: users[req.session.user_id] };
  res.render('urls_show.ejs', templateVars);
});


//add new url
app.post("/urls", (req, res) => {
  const shorturl = helpers.generateRandomString();
  urlDatabase[shorturl] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect('/urls');
});

// delelte url
app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.session.user_id;
  if (urlDatabase[req.params.shortURL].userID === id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
  res.status(400);
  res.send('you have no access to delete the url');
});

// update url
app.post('/urls/:shortURL', (req, res) => {
  if (req.session.user_id && typeof users[req.session.user_id] === 'object') {
    urlDatabase[req.params.shortURL].longURL = req.body.newLongURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  }
  res.status(400);
  res.send('Authentication failed');
});

// access long url through short url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`${longURL}`);
});

///////Authentications////////////////
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = { user: req.session.user_id };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const id = helpers.generateRandomString();
  const user = helpers.getUserByEmail(email, users);
  if (!email || !password || typeof user === 'object') {
    res.status(400);
    res.send('something is wrong');
  }
  users[id] = { id, email, password };
  req.session.user_id = id;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  if (req.body.email && req.body.password) {
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    const user = helpers.getUserByEmail(userEmail,users);
    let id = '';
    if (typeof user === 'object') {
      id = helpers.getUserByEmail(userEmail,users).id;
    } else {
      id = 'noMatchedId';
    }
  
    if (typeof users[id] === 'object' && bcrypt.compareSync(userPassword, users[id].password)) {
      req.session.user_id = id;
      res.redirect('/urls');
    } else {
      res.status(400);
      res.send('No match email or wrong password');
    }
  } else {
    res.status(400);
    res.send("password or email can't be left empty");
  }
});


/////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
