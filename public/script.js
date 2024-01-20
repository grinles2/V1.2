const socket = io();

const $main = document.querySelector("main");
const $people = document.getElementById("people");
const $textarea = document.querySelector("textarea");
const $button = document.getElementById("send");

$button.addEventListener("click", function(){
  if(!$textarea.value) {
    return;
  } else {
    for(var i of $textarea.value){
      if(i != " " && i != "\n"){
        if($textarea.value.length >= 300){
          alertmodal("", "Вы можете писать только 300 символов");
          return;
        }
        sendMessage();
        return;
      }
    }
  }
});

document.addEventListener("keydown", e => {
  if(e.key === "Enter" && (e.metaKey || e.ctrlKey)){
    if(!$textarea.value) {
      return;
    } else {
      for(var i of $textarea.value){
        if(i != " " && i != "\n"){
          if($textarea.value.length >= 300){
            alertmodal("", "Вы можете писать только 300 символов");
            return;
          }
          sendMessage();
          return;
        }
      }
    }
  }
});

function getTime(){
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  if(h > 12){
    h = h - 12;
    if(m < 10){
      m = "0" + String(m);
    } 
    d = String(h) + ":" + String(m) + " PM";
    return d;
  }
  else{
    if(m < 10){
      m = "0" + String(m);
    } 
    d = String(h) + ":" + String(m) + " AM";
    return d;
  }
}

function newRoom(){
  promptmodal("Новый Чат", "Напишите Имя Нового Чата:", ok="Создать", focus=true);
  okbtn.onclick = () => {
    if(!value){
      newRoom();
      return;
    }
    location.href = `/rooms/${encodeURI(value)}`;
  };
}