$.get("/api/posts/" + postId, results => {
    outputPostsWithReplies(results, $(".postsContainer"));
})
