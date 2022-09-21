$(document).ready(() => {
    $.get("/api/notifications", results => {
        outputNotificationList(results, $(".resultsContainer"))
    })
})

function outputNotificationList(notifications, container) {
    notifications.forEach(notification => {
        var html = createNotificationHtml(notification);
        container.append(html);
    });

    if (notifications.length == 0) {
        container.append(`<span class='noResultsFound'>No Results found.</span>`);
    }
}

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

$("#markNotificationsAsRead").click(()=> markNotificationAsOpened());