document.addEventListener('DOMContentLoaded', function () {

    const socket = io.connect('http://localhost:5000');

    const message = document.getElementById('message');
    const send_message = document.getElementById('send_message');
    const chatroom = document.getElementById('chatroom');
    const usersList = document.getElementById('users-list');
    const nickName = document.getElementById('nick-input');
    const modal = document.getElementById("nick-container");
    const applyNickButton = document.getElementById("apply-nick-button");

    initUserInputListeners();
    initSocketListeners();

    function initUserInputListeners() {

        send_message.addEventListener('click', function () {
            if (message.value !== '') {
                socket.emit('new_message', {message: message.value})
            }
        });

        message.addEventListener('keypress', function (pressedKeyCode) {
            if (pressedKeyCode.key === 'Enter' && message.value !== '') {
                socket.emit('new_message', {message: message.value});
            } else if (message.value !== '') {
                socket.emit('typing');
            }
        });

        message.addEventListener('input', function () {
            const isMessageEmpty = message.value === '';
            const command = isMessageEmpty ? 'add' : 'remove';
            send_message.classList[command]('disabled');
            if (isMessageEmpty) {
                document.getElementById('feedback').innerHTML = '';
            }
        });


        nickName.addEventListener('keypress', function (pressedKeyCode) {
            if (pressedKeyCode.key === 'Enter') {
                jointToChatroom();
            }
        });

        nickName.addEventListener('input', function () {
            const isMessageEmpty = nickName.value === '';
            const command = isMessageEmpty ? 'add' : 'remove';
            applyNickButton.classList[command]('disabled');
        });

        applyNickButton.addEventListener('click', function () {
            if (nickName.value !== '') {
                jointToChatroom();
            }
        });
    }

    function initSocketListeners() {

        socket.on("new_message", (data) => {
            document.getElementById('feedback').innerHTML = '';
            var currentMessage = message.value;
            if (data.message === currentMessage) {
                message.value = '';
            }

            let textContainerClasses = 'corner-left';
            if (nickName.value === data.username) {
                textContainerClasses = 'corner-right self-text'
            }
            chatroom.innerHTML += `
                        <div>
                            <div class="chat-text-container ${textContainerClasses}">
                              <p style='color:${data.color}' class="chat-text user-nickname">${data.username}</p>
                              <p class="chat-text">${data.message}</p>
                              <p class="chat-timeStamp">${data.time}</p>
                            </div>
                        </div>
                        `;

            chatroom.scrollTop = chatroom.scrollHeight - chatroom.clientHeight;
        });

        socket.on('typing', (data) => {
            document.getElementById('feedback').innerHTML = "<p><i>" + data.username + " is typing a message..." + "</i></p>";
        });
    }


    function jointToChatroom() {
        modal.style.display = "none";
        const blurredElements = document.querySelectorAll('.blurred');
        blurredElements.forEach((element) => {
            element.classList.remove('blurred');
        });
        socket.emit('change_username', {nickName: nickName.value});
        socket.on('get users', data => {
            let domContent = '';
            for (let i = 0; i < data.length; i++) {
                domContent += `<li class="list-item" style="color: ${data[i].color}">${data[i].username}</li>`;
            }
            usersList.innerHTML = domContent;
        })
    }
});


