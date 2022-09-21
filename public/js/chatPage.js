var typing = false;
var lastTypingTime;


$(document).ready(() => {

    socket.emit("join room", chatId);
    
    socket.on("typing", () => {
        console.log("typing");
        $(".typingDots").show()
    });
    
    socket.on("stop typing", () => {
        $(".typingDots").hide();
    });

    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data));

    });
    $.get(`/api/chats/${chatId}/messages`, messages => {
        var messageHtmlArray = [];
        var lastSenderId = "";
        messages.forEach((message, index) => {
            messageHtmlArray.push(createMessageHtml(message, messages[index + 1], lastSenderId));
            lastSenderId = message.sender._id;
        });
        addMessageHtmlToPage(messageHtmlArray.join(""));
        scrollToBottom(true);
        markAllMessageAsRead();

        $(".loadingSpinnerContainer").remove();
        $(".chatContainer").css("visibility", "visible");
    });

})

$("#chatNameButton").click((event) => {
    var name = $("#chatNameTextbox").val();
    $.ajax({
        url: `/api/chats/` + chatId,
        type: "PUT",
        data: {
            chatName: name
        },
        success: (data, status, xhr) => {
            if (xhr.status != 204) {
                alert("Could not update chat name");
                return;
            }
            location.reload();
        }
    })
});

$(".sendMessageButton").click(() => {
    messageSubmitted();
});

$(".inputTextbox").keydown((event) => {
    updateTyping();
    if (event.which === 13 && !event.shiftKey) {
        messageSubmitted();
        return false;
    }
});

function updateTyping() {

    if (!connected) return;

    if (!typing) {
        typing = true;
        socket.emit("typing", chatId);
    }

    lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
        var timeNow = new Date().getTime();
        diff = timeNow - lastTypingTime;
        if (diff >= timerLength && typing) {
            socket.emit("stop typing", chatId);
            typing = false;
        }
    }, timerLength);
}

function messageSubmitted() {
    var content = $(".inputTextbox").val().trim();
    if (content != "") {
        sendMessage(content);
        $(".inputTextbox").val("");
        socket.emit("stop typing", chatId);
        typing = false;
        scrollToBottom(true);
    }
}
function sendMessage(content) {
    $.post("/api/messages/",
        {
            content: content,
            chatId: chatId
        },
        (data, status, xhr) => {
            
            if (xhr.status != 201) {
                alert("Could not send message");
                $(".chatMessages").append(data);
                return;
            }

            addChatMessageHtml(data);
            
            if (connected) {
                socket.emit("new message", data);
            }
        })
}

function addChatMessageHtml(message) {
    if (!message || !message._id) {
        alert("Message is not valid");
        return;
    }
    var messageDiv = createMessageHtml(message, null, "");
    addMessageHtmlToPage(messageDiv);
    scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {
    var sender = message.sender;
    var senderName = sender.firstName + " " + sender.lastName;
    var isFirst = message.sender._id != lastSenderId;
    var nextSenderId = nextMessage != null ? nextMessage.sender._id : "";
    var isLast = message.sender._id != nextSenderId;
    var isMine = sender._id == userLoggedIn._id;
    var className = isMine ? "mine" : "theirs";
    var nameElement = "";
    var imgContainer = "";
    var profileImg = "";
    if (isFirst) {
        className += " first";
        if (!isMine) {
            nameElement = `<span class='senderName'>${senderName}</span>`;
        }
    }
    if (isLast) {
        className += " last";
        profileImg = `<img src='${message.sender.profilePic}'/>`;
    }

    if (!isMine) {
        imgContainer = `<div class='imageContainer'>${profileImg}</div>`;
    }

    return `<li class='message ${className}'>
            ${imgContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function addMessageHtmlToPage(html) {
    $(".chatMessages").append(html);
}

function scrollToBottom(animated) {
    var container = $(".chatMessages");
    var scrollHeight = container[0].scrollHeight;
    if (animated) {
        container.animate({ scrollTop: scrollHeight }, "slow");
    } else {
        container.scrollTop(scrollHeight);
    }
}

function markAllMessageAsRead() {
    $.ajax({
        url: `/api/chats/${chatId}/messages/markAsRead`,
        type: "PUT",
        success: ()=>{
            refreshMessagesBadge();
        }
    })
}