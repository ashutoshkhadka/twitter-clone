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

function createUserHtml(userData, showFollowButton) {
    var name = userData.firstName + " " + userData.lastName;
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    var followBtnText = isFollowing ? "Following" : "Follow";
    var buttonClass = isFollowing ? "followButton following" : "followButton";
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