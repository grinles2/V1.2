const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const Database = require("@replit/database");
const db = new Database();
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
var users = {};
var rooms = {};
app.get("/", (req, res) => {
  loggedIn = req.cookies.loggedIn;
  username = req.cookies.username;
  if(loggedIn == "true"){
    db.list().then(keys => {
      if(keys.includes(username)){
        res.render("chat.html",{name:username});
      } else{
        res.redirect("/logout");
      }
    });
  } else{
    res.redirect("/login");
  }
});
app.get("/rooms/:room", (req, res) => {
  room = req.params.room;
  loggedIn = req.cookies.loggedIn;
  username = req.cookies.username;
  if(loggedIn == "true"){
    username in db.list().then(keys => {
      if(keys.includes(username)){
        res.render("room.html",{name:username, room:room});
      } else{
        res.redirect("/logout");
      }
    });
  } else{
    res.redirect("/login");
  }
});
app.get("/login", (req, res) => {
  loggedIn = req.cookies.loggedIn;
  if(loggedIn == "true"){
    res.redirect("/");
  } else{
    res.render("login.html");
  }
})
app.get("/signup", (req, res) => {
  loggedIn = req.cookies.loggedIn;
  if(loggedIn == "true"){
    res.redirect("/");
  } else{
    res.render("signup.html");
  }
});
app.post("/loginsubmit", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  db.list().then(keys => {
    if(keys.includes(username)){
      db.get(username).then(value => {
        if(password == value){
          res.cookie("loggedIn", "true");
          res.cookie("username", username);
          console.log("Пользователь Успешно Зашёл Пользователь: " + username);;

          
          const fs = require('node:fs');
          const content = 'Пользователь Зашёл->' + username + ';';
          fs.appendFile('log.txt', content, err => {
            if (err) {
              console.error(err);
            } else {
            }
          });
          res.redirect("/");
        } else{
          res.render("message.html", {message:"Неправильный Пароль."});
        }
      });
    } else{
      res.render("message.html", {message:"Аккаунт не найден."});
    }
  });
});
app.post("/createaccount", (req, res) => {
  var newusername = req.body.newusername;
  newpassword = req.body.newpassword;
  letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  cap_letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  allchars = letters.concat(cap_letters, numbers, ['_']);
  goodusername = true;
  for(let i of newusername){
    if(!allchars.includes(i)){
      goodusername = false;
    }
  }
  if(goodusername){
    db.list().then(keys => {
      if(keys.includes(newusername)){
        res.render("message.html", {message:"Имя пользователя,занято"});
      } else if(newusername == ""){
        res.render("message.html", {message:"Пожалуйста выберите Имя-Пользователя"});
      } else if(newpassword == ""){
        res.render("message.html", {message:"Пожалуйста придумайте пароль."});
      } else{
        db.set(newusername, newpassword).then(() => console.log("Новый Аккаунт создан"));
        console.log("Имя Пользователя" + newusername);
        console.log("Пароль" + newpassword);

        const fs = require('node:fs');
        const content = 'Новый Аккаунт Создан-->  ' + newusername + '\n';
        fs.appendFile('log.txt' , content, err => {
          if (err) {
            console.error(err);
          } else {
          }
        });
        
        
        res.cookie("loggedIn", "true");
        res.cookie("username", newusername);
        res.redirect("/");
      }
    });
  } else{
    res.render("message.html", {message:"Имя-Пользователя может содержать только букв,цифры и нижнии подчёркивания"});
  }
});
app.get("/logout", (req, res) => {
  res.cookie("loggedIn", "false");
  res.clearCookie("username");
  res.redirect("/");
  });;

io.on('connection', (socket) => {
  socket.on("chat message", msg => {
    io.emit("chat message", msg);
  });
  socket.on("room chat message", msg => {
    io.emit("room chat message", msg);
  });
  socket.on("name", name => {
    if(name.name){
      io.emit("newroomuser", name);
      if(!Object.keys(rooms).includes(name.room)) rooms[name.room] = {};
      rooms[name.room][socket.id] = name.name;
    } else{
      io.emit("newuser", name);
      users[socket.id] = name;
    }
  });
  socket.on("disconnect", () => {
    for(i of Object.keys(rooms)){
      if(Object.keys(rooms[i]).includes(socket.id)){
        io.emit("roomuserleft", {message:`${rooms[i][socket.id]} left`, room:i});
        delete rooms[i][socket.id];
        return;
      }
    }
    if(!Object.keys(users).includes(socket.id)) return;
    io.emit("left", `${users[socket.id]} left`);
    delete users[socket.id];
  });
  socket.on("other", html => {
    io.emit("html", html);
  });
});
function getUsers(){
  db.list().then(keys => {
    console.log(keys);
  });
}
app.get("/*", (req, res) => {
  res.render("404.html");
});
server.listen(3000, () => {
  console.log('Сервер Был Успешно Запущен');
  
  const fs = require('node:fs');
  const content = 'Сервер Успешно Запущен'+ ';';
  fs.appendFile('log.txt', content, err => {
    if (err) {
      console.error(err);
    } else {
    }
  });
});