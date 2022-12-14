$(document).ready(() => {
    if (selectedTab === "replies") {
        loadReplies();
    } else {
        loadPosts();
    }
})

function loadPosts() {
    $.get("/api/posts", { postedBy: profileUserId, isReply: false }, results => {
        outputPosts(results, $(".postsContainer"));
    })
    
    $.get("/api/posts", { postedBy: profileUserId, pinned: true }, results => {
        outputPinnedPosts(results, $(".pinnedPostContainer"));
    })
}

function loadReplies() {
    $.get("/api/posts", { postedBy: profileUserId, isReply: true }, results => {
        outputPosts(results, $(".postsContainer"));
    })
}

function outputPinnedPosts(results, container) {

    if (results.length == 0) {
        container.hide();
        return;
    }

    container.html("");

    results.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    })
}