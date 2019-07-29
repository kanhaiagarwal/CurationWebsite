$body = $("body");

var apiUrl = 'https://1iisrt638h.execute-api.ap-southeast-1.amazonaws.com/beta'

$(document).ready(function () {

    $.cookie('fosho_user_name', 'rishabh')

    if (!$.session.get('fosho_type') || $.session.get('fosho_type') != "curator") {
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

    const categories = {
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
            let currentCategory = event.target.value
            if (videos[currentCategory].length == 0) {
                getUncuratedVideosFromRemote(selectedCategory)
            } else {
                populateVideosInListView(selectedCategory, true)
                populateChannelsInDropdown(selectedCategory, true)
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

    function getUncuratedVideosFromRemote(category) {
        let categoryToFetch = category
        if (!categoryToFetch) {
            categoryToFetch = selectedCategory
        }
        $.ajax({
            url: apiUrl + '/getuncuratedvideos?category=' + categories[categoryToFetch],
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            crossDomain: true,
            success: function (data) {
                if (data && data.result && data.result.videos && data.result.videos.length > 0
                    && data.result.channels && data.result.channels.length > 0 && data.result.videos[0] != null) {
                    for (var videoIndex = 0; videoIndex < data.result.videos.length; videoIndex++) {
                        console.log("videoIndex:", videoIndex)
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
                populateChannelsInDropdown(categoryToFetch, true)
            },
            error: function (error) {
                alert("Please reload the page.")
            }
        })
    }

    function addVideoInVideosMap(videoItem, category) {
        if (!videosCatalogue[videoItem['id']]) {
            videoItem['categories'] = []
            videoItem['categories'].push(category)
            videosCatalogue[videoItem['id']] = videoItem
        } else if (videosCatalogue[videoItem['id']] && videosCatalogue[videoItem['id']]['categories']
            && videosCatalogue[videoItem['id']]['categories'].indexOf(category) < 0) {
            videosCatalogue[videoItem['id']]['categories'].push(category)

        } else if (videosCatalogue[videoItem['id']] && !videosCatalogue[videoItem['id']]['categories']) {
            videosCatalogue[videoItem['id']]['categories'] = []
            videosCatalogue[videoItem['id']]['categories'].push(category)
        }
    }

    function addChannelInChannelsMap(channelItem, category) {
        if (!channelsCatalogue[channelItem['id']]) {
            channelItem['categories'] = []
            channelItem['categories'].push(category)
            channelsCatalogue[channelItem['id']] = channelItem
        } else if (channelsCatalogue[channelItem['id']] && channelsCatalogue[channelItem['id']]['categories']
            && channelsCatalogue[channelItem['id']]['categories'].indexOf(category) < 0) {
            channelsCatalogue[channelItem['id']]['categories'].push(category)

        } else if (channelsCatalogue[channelItem['id']] && !channelsCatalogue[channelItem['id']]['categories']) {
            channelsCatalogue[channelItem['id']]['categories'] = []
            channelsCatalogue[channelItem['id']]['categories'].push(category)
        }
    }

    getUncuratedVideosFromRemote()

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
    })

    /** Event when the reject-video modal is shown. */
    $('#removeVideoModal').on('show.bs.modal', function (event) {
        console.log("event.relatedTarget:", event.relatedTarget)
        var relatedElement = $(event.relatedTarget)
        var videoId = relatedElement.data('video-id')
        console.log("videoId:", videoId)
        $('#btn-reject-modal-reject-video').data('video-id', videoId)
    })

    $('#btn-approve-modal-approve-video').click(function (event) {
        console.log("$(this).data('video-id'):", $(this).data('video-id'))
        console.log("selectedCategory:", $('#approve-category-dropdown-button').data('selectedCategory'))
        console.log("selectedlanguage:", $('#approve-language-dropdown-button').data('selectedLanguage'))
        var videoIdInApproveModal = $(this).data('video-id')

        $.post({
            url: apiUrl + '/addincuratedlist',
            dataType: 'json',
            contentType: 'application/json',
            crossDomain: true,
            data: JSON.stringify({
                'videoId': $(this).data('video-id'),
                'channelId': getChannelIdForVideo($(this).data('video-id'), selectedCategory),
                'category': categories[$('#approve-category-dropdown-button').data('selectedCategory')],
                'language': $('#approve-language-dropdown-button').data('selectedLanguage'),
                'userCurated': $.session('fosho_username')
            }),
            success: function (response) {
                console.log("Response:", JSON.stringify(response))
                console.log("response.statusCode:", response.statusCode)
                console.log("response.result.added:", response.result.added)
                if (response.statusCode == 200 && response.result && response.result.added) {
                    console.log("response added is true")
                    removeVideoFromAllCategories(videoIdInApproveModal)
                    populateVideosInListView(selectedCategory, true)
                    populateChannelsInDropdown(selectedCategory, true)
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
                    populateChannelsInDropdown(selectedCategory, true)
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

    function populateVideosInListView(category, removeAllElements, channelFilter) {

        var categoryVideos
        if (removeAllElements) {
            $('.video-list').empty()
        }

        if (channelFilter) {
            categoryVideos = getVideosWithChannelFilter(category, channelFilter)
        } else {
            categoryVideos = videos[category]
        }

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
            var publishDateSpan = $('<span />').append($('<b />').html('Publish Date: ')).append(getDateFromTimestamp(videoItem['publishedAt']))
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
            var channelDiv = $('<div />').append($('<b />').html('Channel: ')).append(channelsCatalogue[videoItem['channelId']]['title'])
            var viewCountDiv = $('<div />').append($('<b />').html('View Count: ')).append(getDisplayViewCount(videoItem['viewCount']))
            var listBodyDiv = $('<div />').addClass('media-body video-body')
                .append(titleHeading).append(publishDateSpan).append(rejectBtn).append(approveBtn)
                .append(channelDiv).append(viewCountDiv)
            var listElement = $('<li />').addClass('media').append(thumbnail).append(listBodyDiv)
            $('.video-list').append(listElement)
        }
    }

    function getVideosWithChannelFilter(category, channelFilter) {
        var allCategoryVideos = videos[category]
        var filteredVideos = []

        for (var videoIndex = 0; videoIndex < allCategoryVideos.length; videoIndex++) {
            if (allCategoryVideos[videoIndex]['channelId'] == channelFilter) {
                filteredVideos.push(allCategoryVideos[videoIndex])
            }
        }

        return filteredVideos
    }

    function populateChannelsInDropdown(category, removeAllElements) {

        var categoryChannels = channels[category]

        if (removeAllElements) {
            $('#channels-dropdown-items').empty()
            $('#channels-dropdown-items').append($('<a />').val('no-selection').attr('id', 'channel-no-selection').text('##No Channel Filter'))
            $('#channels-dropdown-items').append($('<div />').addClass('dropdown-divider'))
            $('#channels-dropdown-button').text('##No Channel Filter')
        }

        for (var channelIndex = 0; channelIndex < categoryChannels.length; channelIndex++) {
            var channelItem = categoryChannels[channelIndex]
            var channelTitle = channelItem['title']
            var channelId = channelItem['id']

            if (channelIndex == 0 && !removeAllElements) {
                $('#channels-dropdown-button').text(channelTitle)
            }

            $('#channels-dropdown-items')
                .append($('<a>').val(channelId).text(channelTitle).addClass('dropdown-item').attr('id', 'channel-' + channelId))
                .attr('data-channel-name', channelTitle)

            $('#channel-' + channelId).click(function (event) {
                $('#channels-dropdown-button').text(event.target.text)
                populateVideosInListView(selectedCategory, true, event.target.value)
            })
        }

        $('#channel-no-selection').click(function () {
            $('#channels-dropdown-button').text('##No Channel Filter')
            populateVideosInListView(selectedCategory, true)
        })
    }

    function getDateFromTimestamp(timestamp) {
        return String(new Date(timestamp).getDate()) + "/" + String(new Date(timestamp).getMonth()) + "/" + String(new Date(timestamp).getFullYear())
    }

    function getDisplayViewCount(viewCount) {
        if (parseInt(viewCount) / 1000000 >= 1) {
            return String(Math.round(parseInt(viewCount) / 1000000)) + "M"
        } else if (parseInt(viewCount) / 1000 >= 1) {
            return String(Math.round(parseInt(viewCount) / 1000)) + "K"
        } else {
            return String(viewCount)
        }
    }
})