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

$("#markNotificationsAsRead").click(()=> markNotificationAsOpened());