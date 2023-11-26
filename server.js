const express = require('express');
const app = express();
let randomColor = require('randomcolor');
const uuid = require('uuid');

app.disable('x-powered-by');
app.use(express.static('client'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

server = app.listen(process.env.PORT || 5000);

const io = require("socket.io")(server);

let users = [];
let connnections = [];

io.on('connection', (socket) => {
    connnections.push(socket);
    let color = randomColor();
    socket.username = 'Anonymous';
    socket.color = color;
    socket.on('change_username', data => {
        let id = uuid.v4();
        socket.id = id;
        socket.username = data.nickName;
        users.push({id, username: socket.username, color: socket.color});
        updateUsernames();
    });

    const updateUsernames = () => {
        io.sockets.emit('get users', users)
    };

    socket.on('new_message', (data) => {
        const currentTime = new Date();
        const hours = String(currentTime.getHours()).padStart(2, '0');
        const minutes = String(currentTime.getMinutes()).padStart(2, '0');
        const messageTimeStamp = hours + ':' + minutes;
        io.sockets.emit('new_message', {
            message: data.message,
            username: socket.username,
            color: socket.color,
            time: messageTimeStamp
        });
    });

    socket.on('typing', () => {
        socket.broadcast.emit('typing', {username: socket.username})
    });

    socket.on('disconnect', () => {
        if (!socket.username)
            return;
        let user = undefined;
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === socket.id) {
                user = users[i];
                break;
            }
        }
        users = users.filter(x => x !== user);
        updateUsernames();
        connnections.splice(connnections.indexOf(socket), 1);
    })
});
