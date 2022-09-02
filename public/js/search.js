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