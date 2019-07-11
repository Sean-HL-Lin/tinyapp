const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

function userLookup (tarEmail) {
  for (let item in users) {
    if (users[item].email === tarEmail) {
      return users[item]
    }
  }
  return false
}

function generateRandomString() {
  const choice = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = '';
  for(let i = 1; i <= 6; i ++) {
    result += choice[Math.floor(Math.random() * choice.length)];
  }  
  return result;
}  

function urlsForUser(id) {
  let result = {};
  for (let i in urlDatabase) {
    if(urlDatabase[i].userID === id) {
      result[i] = urlDatabase[i];
    }
  }
  return result;
}

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
}

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.set('view engine', 'ejs')


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
     fres.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  const displayURLS = urlsForUser(id);
  res.render('urls_index',{urls: displayURLS, user: users[req.cookies["user_id"]]});
});

app.get("/urls/new", (req, res) => {
  console.log(req.cookies['user_id'])
  if (!req.cookies['user_id']) {
    res.redirect('/urls')
  }
  res.render("urls_new", {user: users[req.cookies["user_id"]]});
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, URL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]]};
  res.render('urls_show.ejs', templateVars);
});

app.post("/urls", (req, res) => {
  const shorturl = generateRandomString();
  urlDatabase[shorturl] =  {longURL:req.body.longURL, userID: req.cookies["user_id"]}
  res.redirect('/urls');///////
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(`${longURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.cookies['user_id']
  if (urlDatabase[req.params.shortURL].userID === id) {
    delete urlDatabase[req.params.shortURL]
    res.redirect('/urls');
  }
  res.status(400)
  res.send('you have no access to delete the url')
})

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongURL
  res.redirect(`/urls/${req.params.shortURL}`)
} )

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
})

app.get('/register', (req, res) => {
  res.render('register', {user: req.cookies["user_id"]})
})

app.post('/register', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  if (!email || !password || userLookup(email)) {
    res.status(400);
    res.send('something is wrong');
  }
  users[id] = {id, email, password};
  res.cookie('user_id', id);
  res.redirect('/urls');
})

app.get('/login', (req, res) => {
  res.render('login', {user: users[req.cookies["user_id"]]})
})

app.post('/login', (req, res) => {
  const userEmail = req.body.email
  const id = userLookup(userEmail).id
  
  if (users[id] && users[id].password === req.body.password) {
    res.cookie('user_id', id);
    res.redirect('/urls')
  }
  res.status(400);
  res.send('something is wrong');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
