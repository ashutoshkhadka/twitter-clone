// Globals

var cropper;
var timer;
var selectedUsers = [];

$("#postTextarea, #replyTextarea").keyup(event => {
    var textBox = $(event.target);
    var value = textBox.val().trim();
    var isModal = textBox.parents(".modal").length == 1;
    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if (submitButton.length == 0) {
        return alert("No submit btn found");
    }

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }
    submitButton.prop("disabled", false);
})

$("#deletePostModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitDeletePostButton").data("id", postId);

})

$("#submitDeletePostButton").click((event) => {
    var postId = $(event.target).data("id");
    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",
        success: (data, status, xhr) => {
            if (xhr.status != 202) {
                alert("Could not delete Post");
                return;
            }
            location.reload();
        }
    })
});

$("#replyModal").on("show.bs.modal", (event) => {
    modalButtonHandler(event, "#submitReplyButton");
    $.get("/api/posts/" + postId, results => {
        outputPosts(results.postData, $("#originalPostContainer"));
    })
})
$("#confirmPinModal").on("show.bs.modal", (event) => modalButtonHandler(event, "#pinPostButton"));
$("#confirmUnpinModal").on("show.bs.modal", (event) => modalButtonHandler(event, "#unpinPostButton"));


$("#pinPostButton").click((event) => {
    var postId = $(event.target).data("id");
    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: true },
        success: (data, status, xhr) => {
            if (xhr.status != 204) {
                alert("Could not pin the Post");
                return;
            }
            location.reload();
        }
    })
});

function modalButtonHandler(event, buttonId) {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $(buttonId).data("id", postId);
}

$("#unpinPostButton").click((event) => {
    var postId = $(event.target).data("id");
    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: false },
        success: (data, status, xhr) => {
            if (xhr.status != 204) {
                alert("Could not pin the Post");
                return;
            }
            location.reload();
        }
    })
});

$("#filePhoto").change(function () {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("imagePreview");
            image.src = e.target.result;

            if (cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false
            });
        }
        reader.readAsDataURL(this.files[0]);
    }
})

$("#coverPhoto").change(function () {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("coverPhotoPreview");
            image.src = e.target.result;

            if (cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false
            });
        }
        reader.readAsDataURL(this.files[0]);
    }
})

$("#imageUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();
    if (canvas == null) {
        alert("cropped canvas not found");
    }
    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/profilePicture",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                location.reload();
            }
        })
    });
})

$("#coverPhotoUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();
    if (canvas == null) {
        alert("cropped canvas not found");
    }
    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/coverPhoto",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                location.reload();
            }
        })
    });
})

// clearing the modal
$("#replyModal").on("hidden.bs.modal", () => { $("#originalPostContainer").html("") })

$(document).on("click", ".likeButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if (postId == undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || "")

            if (postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
                emitNotification(postData.postedBy);
            } else {
                button.removeClass("active");
            }


        }
    })
})

$(document).on("click", ".retweetButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if (postId == undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {

            button.find("span").text(postData.retweetUsers.length || "")

            if (postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active");
                emitNotification(postData.postedBy);
            } else {
                button.removeClass("active");
            }

        }
    })
})


$(document).on("click", ".followButton", (event) => {
    var button = $(event.target)
    var userId = button.data().user;

    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => {

            if (xhr.status == 404) {
                console.log(404);
            }
            var followersLabel = $('#followersValue');
            var difference = 1;
            if (data.following && data.following.includes(userId)) {
                button.addClass("following");
                button.text("Following");
                emitNotification(userId);
            } else {
                button.removeClass("following");
                button.text("Follow");
                difference = -1;
            }
            if (followersLabel.length != 0) {
                var followers = parseInt(followersLabel.text());
                followersLabel.text(followers + difference);
            }

        }
    })
})

$(document).on("click", ".post", (event) => {
    var element = $(event.target);
    var postId = getPostIdFromElement(element);

    if (postId !== undefined && !element.is("button")) {
        window.location.href = '/posts/' + postId;
    }
})

function getPostIdFromElement(element) {
    var isRoot = element.hasClass("post");
    var rootElement = isRoot ? element : element.closest(".post");
    return rootElement.data().id;
}

$("#submitPostButton, #submitReplyButton").click(() => {
    var button = $(event.target);
    var isModal = button.parents(".modal").length == 1;
    var textBox = isModal ? $("#replyTextarea") : $("#postTextarea");
    var data = {
        content: textBox.val()
    };

    if (isModal) {
        var id = button.data().id;

        if (id == null) alert("button id is null");

        data.replyTo = id;
    }

    $.post("/api/posts", data, postData => {

        if (postData.replyTo) {
            emitNotification(postData.replyTo.postedBy);
            location.reload();
        } else {
            var html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textBox.val("");
            button.prop("disabled", true);
        }
    })
})

function createPostHtml(postData, largeFont = false) {

    if (postData == null) return alert("Post Data is null")

    var isRetweet = postData.retweetData !== undefined;
    var retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;
    var postedBy = postData.postedBy;

    if (postedBy._id == undefined) return console.log("User not defined");

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timeStamp = timeDifference(new Date(), new Date(postData.createdAt));
    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    var largeFontClass = largeFont ? "largeFont" : "";
    var retweetText = '';
    var replyFlag = '';
    if (isRetweet) {
        retweetText = ` <span>
                        <i class='fas fa-retweet'></i>
                        Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                        </span>`;
    }
    if (postData.replyTo && postData.replyTo._id) {
        if (!postData.replyTo._id) {
            alert("ReplyTo is not populated");
        } else if (!postData.replyTo.postedBy._id) {
            alert("ReplyTo-postedBy is not populated");
        }
        var replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class="replyFlag">
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div> `;
    }

    var button = "";
    var pinnedPostText = "";
    if (postData.postedBy._id == userLoggedIn._id) {

        var pinnedClass = "";
        var dataTarget = "#confirmPinModal";
        if (postData.pinned === true) {
            pinnedPostText = "<i class = 'fas fa-thumbtack'></i><span>PinnedPost</span>";
            dataTarget = "#confirmUnpinModal";
            pinnedClass = "active";
        }

        button = `  <button class = 'pinButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class='fas fa-thumbtack'></i></button>
                    <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
    }

    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class ='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'/>
                    </div>
                    <div class='postContentContainer'>
                       <div class="pinnedPostText"> ${pinnedPostText}</div>
                        <div class='header'>
                            <a href="/profile/${postedBy.username}" class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timeStamp}</span>
                            ${button}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ""}
                                    </span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) return "Just now";
        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function outputPosts(results, container) {
    container.html("");

    if (!Array.isArray(results)) results = [results];
    results.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    })

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show</span>");
    }
}
function outputPostsWithReplies(results, container) {
    container.html("");

    if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPostHtml(results.replyTo);
        container.append(html);
    }

    var mainPostHtml = createPostHtml(results.postData, true);
    container.append(mainPostHtml);

    results.replies.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    })
}

$('#userSearchTextbox').keydown((event) => {

    clearTimeout(timer);
    var textBox = $(event.target);
    var value = textBox.val();

    if (value == "" && (event.which == 8 || event.keyCode == 8)) {
        selectedUsers.pop();
        updateSelectedUsers();
        $(".resultsContainer").html("");
        if (selectedUsers.length == 0) {
            $("#createChatButton").prop("disabled", true);
        }
        return;
    }


    timer = setTimeout(() => {
        value = textBox.val().trim();
        if (value == "") {
            $(".resultsContainer").html("");
        } else {
            searchUsers(value);
        }
    }, 1000)
})

function searchUsers(searchTerm) {
    $.get(`/api/users`, { search: searchTerm }, results => {
        outputSelectableUsers(results, $(".resultsContainer"));
    })
}


function outputSelectableUsers(results, container) {
    container.html("");
    results.forEach(result => {

        if (result._id == userLoggedIn._id || selectedUsers.some(user => user._id == result._id)) {
            return;
        }

        var html = createUserHtml(result, false);
        var element = $(html);
        element.click(() => userSelected(result))
        container.append(element);

    });
    if (results.length == 0) {
        container.append(`<span class='noResultsFound'>No Results found.</span>`);
    }
}

function userSelected(user) {
    selectedUsers.push(user);
    updateSelectedUsers();
    $("#userSearchTextbox").val("").focus();
    $(".resultsContainer").html("");
    $("#createChatButton").prop("disabled", false);
}

function updateSelectedUsers() {
    var elements = [];
    selectedUsers.forEach(user => {
        var name = user.firstName + " " + user.lastName;
        var userElement = $(`<span class='selectedUser'>${name}</span>`);
        elements.push(userElement);
    })
    $(".selectedUser").remove();
    $("#selectedUsers").prepend(elements);
}


function createUserHtml(userData, showFollowButton) {
    var name = userData.firstName + " " + userData.lastName;
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    var followBtnText = isFollowing ? "Following" : "Follow";
    var buttonClass = isFollowing ? "followButton following" : "followButton";
    var followButton = "";
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                <button class='${buttonClass}' data-user='${userData._id}'>${followBtnText}</button>
            </div>`
    }

    return `<div class='user'>
        <div class='userImageContainer'>
            <img src='${userData.profilePic}' />
        </div>
        <div class='userDetailsContainer'>
            <div class='header'>
                <a href='/profile/${userData.username}'>${name}</a>
                <span class='username'>@${userData.username}</span>
            </div>
        </div>
        ${followButton}
    </div>`;
}

$("#createChatButton").click(() => {
    var data = JSON.stringify(selectedUsers);
    $.post("/api/chats", { users: data }, chat => {
        if (!chat || !chat._id) {
            alert("Invalid chat response from server");
        }
        window.location.href = `/messages/${chat._id}`;
    });
})

function getChatName(chatData) {
    var chatName = chatData.chatName;
    if (!chatName) {
        var otherChatUsers = getOtherChatUsers(chatData.users);
        var namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
        chatName = namesArray.join(" , ");
    }
    return chatName;
}

function getOtherChatUsers(users) {
    if (users.length == 0) {
        return users;
    }
    return users.filter(user => user._id != userLoggedIn._id);
}

function messageReceived(newMessage) {
    console.log("inside Message Reciev")
    if ($(`[data-room=${newMessage.chat._id}]`).length == 0) {
        // Not on the chat page
        //Show popup notification
        refreshMessagesBadge();
        showMessagePopup(newMessage);
    } else {
        //chat Page
        addChatMessageHtml(newMessage);
    }
}


$(document).on("click", ".notification.active", (e) => {
    var container = $(e.target);
    var notificationId = container.data().id;
    var href = container.attr("href");
    e.preventDefault();
    var callback = () => window.location = href;
    markNotificationAsOpened(notificationId, callback)
})

function markNotificationAsOpened(notificationId = null, callback = null) {
    var url = notificationId != null ? `/api/notifications/${notificationId}/markAsOpened` : `/api/notifications/markAsOpened`;
    $.ajax({
        url: url,
        type: "PUT",
        success: (data, status, xhr) => {
            console.log("success");
            if (callback == null) {
                location.reload();
            } else {
                callback();
            }
        }
    })
}

function refreshMessagesBadge() {
    $.get("/api/chats", { unreadOnly: true }, results => {
        console.log("chats")
        console.log(results);
        var unreadMessages = results.length;
        if (unreadMessages > 0) {
            $("#messagesBadge").text(unreadMessages).addClass("active");
        } else {
            $("#messagesBadge").text("").removeClass("active");
        }
    })
}


function refreshNotificationBadge() {
    $.get("/api/notifications", { unreadOnly: true }, results => {
        var unreadNotifications = results.length;
        if (unreadNotifications > 0) {
            $("#notificationsBadge").text(unreadNotifications).addClass("active");
        } else {
            $("#notificationsBadge").text("").removeClass("active");
        }
    })
}

$(document).ready(() => {
    refreshMessagesBadge();
    refreshNotificationBadge();
})

function createNotificationHtml(notification) {
    var openedClass = notification.opened ? "" : "active";
    return `<a href='${getNotificationUrl(notification)}' class='resultListItem notification ${openedClass}' data-id='${notification._id}'>
                <div class='resultsImageContainer'>
                    <img src='${notification.userFrom.profilePic}'/>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                        <span class = 'ellipsis'> ${getNotificationText(notification)}
                        </span>
                </div>
            <a/>`;
}

function getNotificationText(notification) {
    var userFrom = notification.userFrom;
    if (!userFrom.firstName || !userFrom.lastName) {
        alert("UserFrom data not populated");
    }
    var userFromName = `${userFrom.firstName}  ${userFrom.lastName}`;
    var text;
    if (notification.notificationType == "retweet") {
        text = `${userFromName} retweeted one of your posts`;
    } else if (notification.notificationType == "postLike") {
        text = `${userFromName} liked one of your posts`;
    } else if (notification.notificationType == "reply") {
        text = `${userFromName} replied to one of your posts`;
    } else if (notification.notificationType == "follow") {
        text = `${userFromName} followed you`;
    }
    return `<span class='ellipsis'>${text}</span>`;
}

function getNotificationUrl(notification) {
    var url;
    if (notification.notificationType == "retweet" || notification.notificationType == "postLike" || notification.notificationType == "reply") {
        url = `/posts/${notification.entityId}`;
    } else if (notification.notificationType == "follow") {
        url = `/profile/${notification.entityId}`;
    }
    return url;
}

function showNotificationPopup(notification) {
    var html = createNotificationHtml(notification);
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");
    setTimeout(() => element.fadeOut(400), 5000);
}

function showMessagePopup(data) {
    if (!data.chat.latestMessage._id) {
        data.chat.latestMessage = data;
    }
    var html = createChatHtml(data.chat);
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");
    setTimeout(() => element.fadeOut(400), 5000);
}

function createChatHtml(chatData) {
    var chatName = getChatName(chatData);
    var image = getChatImageElement(chatData);
    var latestMessage = getLatestMessage(chatData.latestMessage);
    const IsMyMessage = chatData.latestMessage.sender._id == userLoggedIn._id;
    const haveISeenThis = chatData.latestMessage.readBy.includes(userLoggedIn._id);
    var activeClass = !chatData.latestMessage || IsMyMessage || haveISeenThis ? "" : "active";
    return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
        ${image}
        <div class='resultsDetailsContainer ellipsis'>
            <span class='heading' ellipsis>${chatName}</span>
            <span class='subtext'>${latestMessage}</span>
        </div>
    </a>`;
}

function getLatestMessage(latestMessage) {
    if (latestMessage != null) {
        console.log(latestMessage)
        return `${latestMessage.sender.firstName} ${latestMessage.sender.lastName}: ${latestMessage.content}`;
    } else {
        return `new chat`;
    }
}

function getChatImageElement(chatData) {
    var otherChatUsers = getOtherChatUsers(chatData.users);
    var groupChatClass = "";
    var chatImage = getUserChatImageElement(otherChatUsers[0]);
    if (otherChatUsers.length > 1) {
        groupChatClass = "groupChatImage";
        chatImage += getUserChatImageElement(otherChatUsers[1]);
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
    if (!user || !user.profilePic) {
        console.log("invalid User/User image")
        return;
    }
    return ` <img src="${user.profilePic}" alt="User's Profile Picture")/>`;

}
