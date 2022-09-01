// Globals
var timer;

$('#searchBox').keydown((event) => {

    clearTimeout(timer);
    var textBox = $(event.target);
    var value = textBox.val();
    var searchType = textBox.data().search;

    timer = setTimeout(() => {
        value = textBox.val().trim();
        if (value == "") {
            $(".resultsContainer").html("");
        } else {
            search(value, searchType);
        }
    }, 1000)
})

function search(searchTerm, searchType) {
    var url = searchType == "users" ? "/api/users" : "/api/posts";
    $.get(url, { search: searchTerm }, results => {

        if (searchType != "users") {
            outputPosts(results, $(".resultsContainer"));
        } else  {
            outputUsers(results, $(".resultsContainer"));
        }
    
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