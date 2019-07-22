$body = $("body");

var apiUrl = 'https://1iisrt638h.execute-api.ap-southeast-1.amazonaws.com/beta'

$(document).ready(function () {

    if (!$.session.get('fosho_type') || $.session.get('fosho_type') != "admin") {
        console.log("The user is not admin.")
        window.location.replace("index.html")
    }

    if ($.session.get('fosho_name') && $.session.get('fosho_name') != "") {
        $('.user-title').html('Welcome ' + $.session.get('fosho_name'))
    } else {
        $('.user-title').html('Welcome User')
    }

    var selectedCategory = 'STANDUPS'
    var videosCatalogue = {}, channelsCatalogue = {}
    var videos = {
        STANDUPS: [], DESI: [], TRAILERS: [], FUNNY: [], CHILL: [], ANIMATION: [], EXPLORE: [], TRIPPY: [], LEARN: [],
        SPORTS: [], LIFESTYLE: [], FITNESS: [], FILMLET: [], MEMES: []
    }

    var channels = {
        STANDUPS: [], DESI: [], TRAILERS: [], FUNNY: [], CHILL: [], ANIMATION: [], EXPLORE: [], TRIPPY: [], LEARN: [],
        SPORTS: [], LIFESTYLE: [], FITNESS: [], FILMLET: [], MEMES: []
    }

    var categories = {
        STANDUPS: 2, DESI: 3, TRAILERS: 4, FUNNY: 5, CHILL: 6, ANIMATION: 7, EXPLORE: 8, TRIPPY: 9, LEARN: 10, SPORTS: 11,
        LIFESTYLE: 12, FITNESS: 13, FILMLET: 14, MEMES: 15
    }

    var languages = ['HINDI', 'ENGLISH']

    Object.keys(categories).forEach(function (category, index) {
        if (index == 0) {
            $('#category-dropdown-button').text(category)
            $('#approve-category-dropdown-button').text(category)
            $('#approve-category-dropdown-button').data('selectedCategory', category)
        }

        $('#category-dropdown-items').append(
            $('<a>').val(category).text(category).addClass('dropdown-item').attr('id', 'category-' + category)
        )
        $('#approve-category-dropdown-items').append(
            $('<a>').val(category).text(category).addClass('dropdown-item').attr('id', 'approve-category-' + category)
        )

        $("#category-" + category).click(function (event) {
            console.log("event.target.value in category click:", event.target.value)
            selectedCategory = event.target.value
            var currentCategory = event.target.value
            if (videos[currentCategory].length == 0) {
                getCuratedVideosFromRemote(selectedCategory)
            } else {
                populateVideosInListView(selectedCategory, true)
            }
        })
    })

    languages.forEach(function (language, index) {
        if (index == 0) {
            $('#approve-language-dropdown-button').text(language)
            $('#approve-language-dropdown-button').data('selectedLanguage', language)
        }
        $('#approve-language-dropdown-items').append(
            $('<a>').val(language).text(language).addClass('dropdown-item').attr('id', 'language-' + language)
        )
    })

    function getCuratedVideosFromRemote(category) {
        var categoryToFetch = category
        if (!categoryToFetch) {
            categoryToFetch = selectedCategory
        }
        $.ajax({
            url: apiUrl + '/getcuratedvideos?category=' + categories[categoryToFetch],
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            crossDomain: true,
            success: function (data) {
                if (data && data.result && data.result.videos && data.result.videos.length > 0
                    && data.result.channels && data.result.channels.length > 0 && data.result.videos[0] != null) {
                    for (var videoIndex = 0; videoIndex < data.result.videos.length; videoIndex++) {
                        addVideoInVideosMap(data.result.videos[videoIndex], categoryToFetch)
                    }
                    for (var channelIndex = 0; channelIndex < data.result.channels.length; channelIndex++) {
                        console.log("channelIndex:", channelIndex)
                        addChannelInChannelsMap(data.result.channels[channelIndex], categoryToFetch)
                    }
                    videos[categoryToFetch] = data.result.videos
                    channels[categoryToFetch] = data.result.channels

                    console.log(videosCatalogue)
                    console.log(channelsCatalogue)
                } else {
                    console.log("No videos present for the selected category.")
                    alert("Sorry, no videos present for tis category. Please select another category.")
                }

                populateVideosInListView(categoryToFetch, true)
            },
            error: function (error) {
                alert("Please reload the page.")
            }
        })
    }

    function addVideoInVideosMap(videoItem, category) {
        if (!videosCatalogue[videoItem['id']]) {
            videosCatalogue[videoItem['id']] = videoItem
        }
    }

    function addChannelInChannelsMap(channelItem, category) {
        if (!channelsCatalogue[channelItem['id']]) {
            channelsCatalogue[channelItem['id']] = channelItem
        }
    }

    getCuratedVideosFromRemote()

    $('#category-dropdown-items a').click(function (event) {
        $('#category-dropdown-button').text(event.target.value)
    })

    $('#approve-category-dropdown-items a').click(function (event) {
        $('#approve-category-dropdown-button').text(event.target.value)
        $('#approve-category-dropdown-button').data('selectedCategory', event.target.value)
    })

    $('#approve-language-dropdown-items a').click(function (event) {
        $('#approve-language-dropdown-button').text(event.target.value)
        $('#approve-language-dropdown-button').data('selectedLanguage', event.target.value)
    })

    /** Event when the youtube modal is shown. */
    $('#youtubeModal').on('show.bs.modal', function (event) {
        var relatedElement = $(event.relatedTarget)
        var videoId = relatedElement.data('video-id')
        console.log("videoId:", videoId)
        $('#modal-video').attr('src', 'https://www.youtube.com/embed/' + videoId)
    })

    /** Event when the youtube modal disappears. */
    $('#youtubeModal').on('hide.bs.modal', function (event) {
        $('#modal-video').attr('src', '')
    })

    /** Event when the approve-video modal is shown. */
    $('#approveVideoModal').on('show.bs.modal', function (event) {
        console.log("event.relatedTarget:", event.relatedTarget)
        var relatedElement = $(event.relatedTarget)
        var videoId = relatedElement.data('video-id')
        console.log("videoId:", videoId)
        $('#btn-approve-modal-approve-video').data('video-id', videoId)
        $('#approve-category-dropdown-button').text(selectedCategory)
        $('#approve-category-dropdown-button').data('selectedCategory', selectedCategory)
        if (videosCatalogue[videoId] && videosCatalogue[videoId]['language']) {
            $('#approve-language-dropdown-button').text(videosCatalogue[videoId]['language'])
            $('#approve-language-dropdown-button').data('selectedLanguage', videosCatalogue[videoId]['language'])
        }
    })

    /** Event when the reject-video modal is shown. */
    $('#removeVideoModal').on('show.bs.modal', function (event) {
        console.log("event.relatedTarget:", event.relatedTarget)
        var relatedElement = $(event.relatedTarget)
        var videoId = relatedElement.data('video-id')
        console.log("videoId:", videoId)
        $('#btn-reject-modal-reject-video').data('video-id', videoId)
    })

    /** Event when the injestion pipeline modal is shown. */
    $('#injesion-pipeline-modal').on('show.bs.modal', function (event) {
        console.log("Injestion Pipeline modal is opened.")

        $.ajax({
            url: apiUrl + '/getverifiedcuratedvideoscount',
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            crossDomain: true,
            success: function (response) {
                if (response.statusCode == 200 && response.result && response.result.success) {
                    var categoriesCount = response.result.categoriesCount
                    $('#injestion-pipeline-table').empty()
                    var thead = $('<thead>').addClass('thead-dark')
                    var headRow = $('<tr>').append($('<th/>').attr('scope', "col").html("Category")).append($('<th/>').attr('scope', "col").html("Number Of Videos"))
                    thead.append(headRow)
                    $('#injestion-pipeline-table').append(thead)
                    Object.keys(categories).forEach(function (category) {
                        var categoryCount = categoriesCount[String(categories[category])]
                        var row = $('<tr>').append($('<td/>').attr('scope', "row").html(category)).append($('<td/>').attr('scope', "col").html(categoryCount))
                        $('#injestion-pipeline-table').append(row)
                    })
                    console.log("response.result.categoriesCount:", response.result.categoriesCount)
                }

            },
            error: function (event) {

            }
        })
    })

    /** Event when the approve button in the approve modal is clicked. */
    $('#btn-approve-modal-approve-video').click(function (event) {
        console.log("$(this).data('video-id'):", $(this).data('video-id'))
        console.log("selectedCategory:", $('#approve-category-dropdown-button').data('selectedCategory'))
        console.log("selectedlanguage:", $('#approve-language-dropdown-button').data('selectedLanguage'))
        var videoIdInApproveModal = $(this).data('video-id')

        $.post({
            url: apiUrl + '/modifyincuratedlist',
            dataType: 'json',
            contentType: 'application/json',
            crossDomain: true,
            data: JSON.stringify({
                'videoId': $(this).data('video-id'),
                'channelId': getChannelIdForVideo($(this).data('video-id'), selectedCategory),
                'category': categories[$('#approve-category-dropdown-button').data('selectedCategory')],
                'language': $('#approve-language-dropdown-button').data('selectedLanguage')
            }),
            success: function (response) {
                console.log("Response:", JSON.stringify(response))
                console.log("response.statusCode:", response.statusCode)
                console.log("response.result.added:", response.result.added)
                if (response.statusCode == 200 && response.result && response.result.added) {
                    console.log("response added is true")
                    removeVideoFromAllCategories(videoIdInApproveModal)
                    populateVideosInListView(selectedCategory, true)
                }
                $('#approveVideoModal').modal('hide')

                if (response.statusCode == 200 && response.result && response.result.added) {
                    $.toast({
                        title: "Video Approval Successful",
                        content: response.result.message,
                        type: "success",
                        delay: 2000
                    })
                } else {
                    $.toast({
                        title: "Video Approval Not Successful",
                        content: response.result.reason,
                        type: "error",
                        delay: 2000
                    })
                }
            },
            error: function (error) {
                $('#approveVideoModal').modal('hide')
                $.toast({
                    title: "Error in the API. Please reload.",
                    type: "error",
                    delay: 2000
                })
                console.log("Error in the post request:", error)
            }
        })
    })

    /** Event when the reject button in the reject modal is clicked. */
    $('#btn-reject-modal-reject-video').click(function (event) {
        var videoIdInRejectModal = $(this).data('video-id')
        console.log("$(this).data('video-id'):", $(this).data('video-id'))
        console.log("selectedCategory:", $('#approve-category-dropdown-button').data('selectedCategory'))
        console.log("selectedlanguage:", $('#approve-language-dropdown-button').data('selectedLanguage'))

        $.post({
            url: apiUrl + '/deletefromuncuratedlist',
            dataType: 'json',
            contentType: 'application/json',
            crossDomain: true,
            data: JSON.stringify({
                'videoId': $(this).data('video-id'),
                'userCurated': $.cookie('fosho_user_name')
            }),
            success: function (response) {
                console.log("Response:", JSON.stringify(response))
                console.log("response.statusCode:", response.statusCode)
                console.log("response.result.deleted:", response.result.deleted)
                if (response.statusCode == 200 && response.result && response.result.deleted) {
                    console.log("response deleted is true")
                    removeVideoFromAllCategories(videoIdInRejectModal)
                    populateVideosInListView(selectedCategory, true)
                }
                $('#removeVideoModal').modal('hide')
                if (response.statusCode == 200 && response.result && response.result.deleted) {
                    $.toast({
                        title: "Video Removal Successful",
                        content: response.result.message,
                        type: "success",
                        delay: 2000
                    })
                } else {
                    $.toast({
                        title: "Video Removal Not Successful",
                        content: response.result.reason,
                        type: "error",
                        delay: 2000
                    })
                }
            },
            error: function (error) {
                console.log("Error in the post request:", error)
                $('#removeVideoModal').modal('hide')
                $.toast({
                    title: "Error in the API. Please reload.",
                    type: "error",
                    delay: 2000
                })
            }
        })
    })

    $('#btn-start-injestion-pipeline').click(function (event) {
        $.post({
            url: apiUrl + '/startinjestionpipeline',
            dataType: 'json',
            contentType: 'application/json',
            crossDomain: true,
            success: function (response) {
                $('#injesion-pipeline-modal').modal('hide')
                if (response && response.statusCode && response.statusCode == 200 && response.result && response.result.added) {
                    console.log("injestion pipeline ran successfully.")
                    $('#injesion-pipeline-modal').modal('hide')
                    $.toast({
                        title: "Injestion Pipeline Started",
                        content: response.result.message,
                        type: "success",
                        delay: 2000
                    })
                } else if (response && response.statusCode && response.statusCode == 200 && response.result) {
                    $.toast({
                        title: "Error in Starting the Injestion Pipeline",
                        content: response.result.message,
                        type: "error",
                        delay: 2000
                    })
                } else {
                    $.toast({
                        title: "Error in Starting the Injestion Pipeline",
                        type: "error",
                        delay: 2000
                    })
                }
            },
            error: function (error) {
                console.log("Error in the start pipeline API:", error)
                $('#injesion-pipeline-modal').modal('hide')
                $('#injesion-pipeline-modal').modal('hide')
                $.toast({
                    title: "Error in Starting the Injestion Pipeline",
                    type: "error",
                    delay: 2000
                })
            }

        })
    })

    $('#btn-logout-yes').click(function (event) {
        $.session.clear()
        window.location.replace("index.html")
    })

    function getChannelIdForVideo(videoId) {
        return videosCatalogue[videoId]['channelId']
    }

    function removeVideoFromAllCategories(videoId) {
        console.log("videoId in removeVideoFromAllCategories:", videoId)
        console.log("videosCatalogue in removeVideoFromAllCategories:", videosCatalogue)
        console.log("videosCatalogue[videoId] in removeVideoFromAllCategories:", videosCatalogue[videoId])

        var categories = videosCatalogue[videoId]['categories']

        if (categories && categories.length > 0) {
            categories.forEach(function (category) {
                console.log("category of", videoId, "is:", category)
                if (videos[category] && videos[category].length > 0) {
                    for (var videoIndex = 0; videoIndex < videos[category].length; videoIndex++) {
                        if (videos[category][videoIndex]['id'] == videoId) {
                            videos[category].splice(videoIndex, 1)
                            console.log("video", videoId, "removed from category", category)
                        }
                    }
                }
            })
        }

        delete videosCatalogue[videoId]
    }

    function populateVideosInListView(category, removeAllElements) {

        var categoryVideos
        if (removeAllElements) {
            $('.video-list').empty()
        }

        categoryVideos = videos[category]

        for (var videoIndex = 0; videoIndex < categoryVideos.length; videoIndex++) {
            var videoItem = categoryVideos[videoIndex]
            var thumbnailImage = $('<img />', {
                'src': videoItem['thumbnail']['url'],
                'alt': 'Sorry, Image is not available.'
            }).addClass('media-object');
            var thumbnail = $('<a />', {
                'href': '#bannerformodal',
                'data-toggle': 'modal',
                'data-target': '#youtubeModal',
                'data-video-id': videoItem['id']
            }).addClass('pull-left').html(thumbnailImage).val(videoItem['id'])
            var titleHeading = $('<h4 />', {
                'data-toggle': 'modal',
                'data-target': '#youtubeModal',
                'data-video-id': videoItem['id']
            }).addClass('media-heading').html(videoItem['title']).val(videoItem['id'])
            var publishDateSpan = $('<span />').append($('<b />').html('Publish Date: ')).append(videoItem['publishedAt'])
            var approveBtn = $('<button />', {
                'data-toggle': 'modal',
                'data-target': '#approveVideoModal',
                'data-video-id': videoItem['id']
            }).addClass('btn btn-success approve-video').html('Approve').val(videoItem['id'])
            var rejectBtn = $('<button />', {
                'data-toggle': 'modal',
                'data-target': '#removeVideoModal',
                'data-video-id': videoItem['id']
            }).addClass('btn btn-danger reject-video').html('Reject').val(videoItem['id'])
            var channelDiv = $('<div />').append($('<b />').html('Channel: ')).append(videoItem['channelId'])
            var viewCountDiv = $('<div />').append($('<b />').html('View Count: ')).append(videoItem['viewCount'])
            var listBodyDiv = $('<div />').addClass('media-body video-body')
                .append(titleHeading).append(publishDateSpan).append(rejectBtn).append(approveBtn)
                .append(channelDiv).append(viewCountDiv)
            var listElement = $('<li />').addClass('media').append(thumbnail).append(listBodyDiv)
            $('.video-list').append(listElement)
        }
    }
})