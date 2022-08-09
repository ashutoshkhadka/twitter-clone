$("#postTextarea").keyup(event => {
    var textBox = $(event.target);
    var value = textBox.val().trim();

    var submitButton = $("#submitPostButton");
    if (submitButton.length == 0) {
        return alert("No submit btn found");
    }

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }
    submitButton.prop("disabled", false);
})