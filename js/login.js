$(document).ready(function () {
    $('#submit-button').click(function () {
        var url = "https://1iisrt638h.execute-api.ap-southeast-1.amazonaws.com/beta"
        var resource = "/login"
        var username = $('#login').val()
        var password = $('#password').val()
        console.log("username:", username)
        console.log("password:", password)
        $.post({
            url: url + resource,
            dataType: 'json',
            contentType: 'application/json',
            crossDomain: true,
            data: JSON.stringify({
                'username': username,
                'password': password
            }),
            success: function (response) {
                console.log("Response:", JSON.stringify(response))
            },
            error: function (error) {
                console.log("Error in the post request:", error)
            }
        })
    })
})