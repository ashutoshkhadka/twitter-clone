$(document).ready(() => {
    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data));
    })
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