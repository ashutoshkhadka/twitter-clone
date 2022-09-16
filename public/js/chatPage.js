$(document).ready(() => {
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
    if (event.which === 13 && !event.shiftKey) {
        messageSubmitted();
        return false;
    }
});

function messageSubmitted() {
    var content = $(".inputTextbox").val().trim();
    if (content != "") {
        sendMessage(content);
        $(".inputTextbox").val("");
    }
}

function sendMessage(content) {
    $.post("/api/messages/",
        {
            content: content,
            chatId: chatId
        },
        (data, status, xhr) => {
            addChatMessageHtml(data);
            if (xhr.status != 201) {
                alert("Could not send message");
                $(".chatMessages").append(data);
                return;
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