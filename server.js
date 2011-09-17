var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app),game = require("./game");
var redis = require("redis"),
    client = redis.createClient('9053','bass.redistogo.com');
    client.auth('8a474deedecdd539fd9737ee77abc2f7');
    client.on("error", function (err,info) {
       console.log(err);
    });

app.use(express.static(__dirname + '/'));
app.get('/', function(req, res){
    res.sendfile(__dirname + '/static/index.html');
});
app.listen(9090, "0.0.0.0");




function Info(symbol,room,stop)
{
    this.room = room;
    this.symbol = symbol;
}


  var currentRoom;
  var allGame=new Array();

  io.sockets.on('connection', function (socket) {
 client.get('X',function (err,res) {
           socket.emit('statsX',res);
        });
          client.get('O',function (err,res) {
            socket.emit('statsO',res);
        });

console.log("connected -------------");
    if (currentRoom==undefined){
       socket.join(socket.id);
       currentRoom=socket.id;
       allGame[currentRoom] = new Game();
       allGame[currentRoom].stop = true;
       socket.set('info', new Info("X", currentRoom),function () {socket.emit('player',"X");});
       socket.emit('info','Ok, wait for an other player to connect.');

    }else{
        var stop = false;
        socket.join(currentRoom);
        socket.set('info', new Info("O", currentRoom),function () {socket.emit('player',"O");});
        allGame[currentRoom].stop = false;
        socket.broadcast.to(currentRoom).emit('info','Game start ! Is is your turn to play !');
        socket.emit('info','Wait for X to play.');
        currentRoom = undefined;
    }

  socket.on('take', function (data) {
      socket.get('info',function (err, info) {
        console.log(info.room+"---------"+info.symbol);
        game = allGame[info.room];
        if (!game.stop)    {
            if (game.currentPlayer() != info.symbol){
                 socket.emit('info','Please Wait, it is not your turn.');
            }else{
                 var isValid = game.take(data.field,info.symbol);
                 if (isValid) {
                   draw(data.field,info.symbol,info.room)
                   game.stop = isFinished(info);
                   if (!game.stop) {
                    socket.emit('info','Ok, wait for next player to play.');
                    socket.broadcast.to(info.room).emit('info','Play !');
                   }
                 }else {
                   socket.emit('info','Invalid move.');
                 }
             }
            }
       });
    });



     function statsX() {
     var x = client.get('X',function (err,res) {
            io.sockets.emit('statsX',res);
        });
     }

     function statsO() {
        var o = client.get('O',function (err,res) {
        io.sockets.emit('statsO',res);
           });
     }
function isFinished(info) {
   game = allGame[info.room];
      var stop =false;

         if (game.isFinished()&&game.winner!=undefined ){
          stop = true;
          socket.broadcast.to(info.room).emit('info',"You loose !");
          socket.emit('info','Congratz ! You win the game ! ');
          client.incr( game.winner, function(res) {
            statsX();
            statsO();
          });
         } else if (game.isFinished()) {
          stop = true;
          io.sockets.in(info.room).emit('info',"No winner");
         }
          console.log(stop);
         return stop;
}
function draw(field,symbol,room) {
      io.sockets.in(room).emit('draw',{'field':field,'player':symbol});
  }

  socket.on('disconnect', function () {
        socket.get('info',function (err, info) {
        game = allGame[info.room];
        game.stop = true;
        socket.broadcast.to(info.room).emit('info','The other player have been deconnected !');
       });
  });
});
