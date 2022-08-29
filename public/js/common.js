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

$("#replyModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);
    $.get("/api/posts/" + postId, results => {
        outputPosts(results.postData, $("#originalPostContainer"));
    })
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
        console.log("is Modal");
    }

    $.post("/api/posts", data, postData => {

        if (postData.replyTo) {
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
    if (postData.postedBy._id == userLoggedIn._id) {
        button = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal">
                        <i class='fas fa-times'></i>
                    </button>`;
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