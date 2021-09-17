
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:8100']
    }
});


app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

io.on('connection', (socket) => {
   
    console.log('a user connected');

    newConnections = io.sockets.server.engine.clientsCount
    console.log(newConnections)
    io.sockets.emit ('totalUsers', {newConnections});

    socket.on('join', (room) => {

        const clients = io.sockets.adapter.rooms.get(room);
        const numClients = clients ? clients.size : 0;

       if (numClients <= 1) { 
            socket.join(room);
            console.log(socket.id + ' has joined room: ' + room);
            console.log('number of connected users: ' +  numClients);
            io.in(room).emit('numClients', numClients);
       }
    })

    socket.on('create', (changes, room) => {
        console.log(changes);
        console.log(socket.id + ' has emited ' + changes + ' to ' + room);
        io.in(room).emit('create', changes);
    })

    socket.on('change', (newData, room) => {
        console.log(newData);
        io.to(room).emit('change', newData);
    })

    socket.on('leave', (room) => {
        socket.leave(room);
        const clients = io.sockets.adapter.rooms.get(room);
        const numClients = clients ? clients.size : 0;
        console.log(socket.id + ' has disconnected from room: ' + room);
        console.log('number of clients in the room: ' + numClients);
      });

    socket.on('disconnect', function() {
        console.log('user disconnected');
        newConnections = io.sockets.server.engine.clientsCount
        console.log(newConnections)
        io.sockets.emit ('totalUsers', {newConnections});
      });

});


http.listen(5000, () => {
    console.log('listening on *:5000');
  });