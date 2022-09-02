$(document).ready(() => {
    if (selectedTab === "following") {
        loadFollowing();
    } else {
        loadFollowers();
    }
})

function loadFollowing() {
    $.get(`/api/users/${profileUserId}/following`, { postedBy: profileUserId, isReply: false }, results => {
        outputUsers(results.following, $(".resultsContainer"));
    })
}

function loadFollowers() {
    $.get(`/api/users/${profileUserId}/followers`, { postedBy: profileUserId, isReply: false }, results => {
        outputUsers(results.followers, $(".resultsContainer"));
    })
}

function outputUsers(results, container) {
    container.html("");
    results.forEach(result => {
        var html = createUserHtml(result, true);
        container.append(html);
    });
    if (results.length == 0) {
        container.append(`<span class='noResultsFound'>No Results found.</span>`);
    }
}