$(document).ready(function () {

    if ($.session.get("fosho_type") && $.session.get("fosho_username") && $.session.get("fosho_token")) {
        redirectToPage()
    }

    $('#submit-button').click(function () {
        var url = "https://1iisrt638h.execute-api.ap-southeast-1.amazonaws.com/beta"
        var resource = "/login"
        var username = $('#login').val()
        var password = $('#password').val()
        console.log("username:", username)
        console.log("password:", password)
        if (!username || username == "" || !password || password == "") {
            $.toast({
                title: "Incomplete Field",
                content: "Please supply the username and password.",
                type: "error",
                delay: 2000
            })
            return
        }
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

                if (response.statusCode == 200 && response.result && response.result.token) {
                    $.session.set("fosho_username", response.result.username)
                    $.session.set("fosho_name", response.result.name)
                    $.session.set("fosho_type", response.result.type)
                    $.session.set("fosho_token", response.result.token)

                    redirectToPage()
                } else {
                    $.toast({
                        title: "Login is not successful.",
                        content: "Please make sure that the username/password is correct.",
                        type: "error",
                        delay: 2000
                    })
                }
            },
            error: function (error) {
                console.log("Error in the post request:", error)
                $.toast({
                    title: "Error in login API.",
                    content: "Please make sure that the internet connection is active.",
                    type: "error",
                    delay: 2000
                })
            }
        })
    })

    function redirectToPage() {
        if ($.session.get("fosho_type") == "admin") {
            window.location.replace("admin.html")
        } else if ($.session.get("fosho_type") == "curator") {
            window.location.replace("curator.html")
        }
    }
})