$body = $("body");

$(document).ready(function () {
    var categories = {
        STANDUPS: 2,
        DESI: 3,
        TRAILERS: 4,
        FUNNY: 5,
        CHILL: 6,
        ANIMATION: 7,
        EXPLORE: 8,
        TRIPPY: 9,
        LEARN: 10,
        SPORTS: 11,
        LIFESTYLE: 12,
        FITNESS: 13,
        FILMLET: 14,
        MEMES: 15
    }

    var languages = ['HINDI', 'ENGLISH']

    Object.keys(categories).forEach(function (category, index) {
        if (index == 0) {
            $('#category-dropdown-button').text(category)
            $('#approve-category-dropdown-button').text(category)
        }

        $('#category-dropdown-items').append(
            $('<a>').val(category).text(category).addClass('dropdown-item')
        )
        $('#approve-category-dropdown-items').append(
            $('<a>').val(category).text(category).addClass('dropdown-item')
        )
    })

    languages.forEach(function (language, index) {
        console.log("language:", language)
        if (index == 0) {
            $('#approve-language-dropdown-button').text(language)
        }
        $('#approve-language-dropdown-items').append(
            $('<a>').val(language).text(language).addClass('dropdown-item')
        )
    })

    $('#category-dropdown-items a').click(function (event) {
        $('#category-dropdown-button').text(event.target.value)
    })

    $('#approve-category-dropdown-items a').click(function (event) {
        console.log("Approve Category Clicked.")
        $('#approve-category-dropdown-button').text(event.target.value)
    })

    $('#approve-language-dropdown-items a').click(function (event) {
        console.log("Approve Language Clickked.")
        $('#approve-language-dropdown-button').text(event.target.value)
    })

    $('#youtubeModal').on('show.bs.modal', function (event) {
        $('#modal-video').attr('src', 'https://www.youtube.com/embed/EFg21zta1Ws')
    })

    $('#youtubeModal').on('hide.bs.modal', function (event) {
        $('#modal-video').attr('src', '')
    })
})