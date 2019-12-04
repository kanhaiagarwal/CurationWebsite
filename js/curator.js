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
    var selectedChannel = undefined
    var videosCatalogue = {}, channelsCatalogue = {}

    var videos = {
        STANDUPS: { channels: {} }, DESI: { channels: {} }, TRAILERS: { channels: {} }, FUNNY: { channels: {} }, CHILL: { channels: {} }, ANIMATION: { channels: {} },
        EXPLORE: { channels: {} }, TRIPPY: { channels: {} }, LEARN: { channels: {} }, SPORTS: { channels: {} }, LIFESTYLE: { channels: {} }, FITNESS: { channels: {} },
        FILMLET: { channels: {} }, MEMES: { channels: {} }, BAKCHODI: { channels: {} }, EXTREME_SPORTS: { channels: {} }, CRICKET: { channels: {} }, FOOTBALL: { channels: {} },
        FOOD: { channels: {} }, LUXURY: { channels: {} }, ODDLY_SATISFYING: { channels: {} }, ART: { channels: {} }, HISTORY: { channels: {} }, CUTIE_PIE: { channels: {} }
    }

    var channels = {
        STANDUPS: { channels: [], nextToken: undefined }, DESI: { channels: [], nextToken: undefined }, TRAILERS: { channels: [], nextToken: undefined },
        FUNNY: { channels: [], nextToken: undefined }, CHILL: { channels: [], nextToken: undefined }, ANIMATION: { channels: [], nextToken: undefined },
        EXPLORE: { channels: [], nextToken: undefined }, TRIPPY: { channels: [], nextToken: undefined }, LEARN: { channels: [], nextToken: undefined },
        SPORTS: { channels: [], nextToken: undefined }, LIFESTYLE: { channels: [], nextToken: undefined }, FITNESS: { channels: [], nextToken: undefined },
        FILMLET: { channels: [], nextToken: undefined }, MEMES: { channels: [], nextToken: undefined }, BAKCHODI: { channels: [], nextToken: undefined },
        EXTREME_SPORTS: { channels: [], nextToken: undefined }, CRICKET: { channels: [], nextToken: undefined }, FOOTBALL: { channels: [], nextToken: undefined },
        FOOD: { channels: [], nextToken: undefined }, LUXURY: { channels: [], nextToken: undefined }, ODDLY_SATISFYING: { channels: [], nextToken: undefined },
        ART: { channels: [], nextToken: undefined }, HISTORY: { channels: [], nextToken: undefined }, CUTIE_PIE: { channels: [], nextToken: undefined }
    }

    var categories = {
        STANDUPS: 2, DESI: 3, TRAILERS: 4, FUNNY: 5, CHILL: 6, ANIMATION: 7, EXPLORE: 8, TRIPPY: 9, LEARN: 10, SPORTS: 11,
        LIFESTYLE: 12, FITNESS: 13, FILMLET: 14, MEMES: 15, BAKCHODI: 16, EXTREME_SPORTS: 17, CRICKET: 18, FOOTBALL: 19, FOOD: 20,
        LUXURY: 21, ODDLY_SATISFYING: 22, ART: 23, HISTORY: 24, CUTIE_PIE: 25
    }

    var allNextTokens = {
        STANDUPS: undefined, DESI: undefined, TRAILERS: undefined, FUNNY: undefined, CHILL: undefined, ANIMATION: undefined, EXPLORE: undefined, TRIPPY: undefined, LEARN: undefined, SPORTS: undefined,
        LIFESTYLE: undefined, FITNESS: undefined, FILMLET: undefined, MEMES: undefined, BAKCHODI: undefined, EXTREME_SPORTS: undefined, CRICKET: undefined, FOOTBALL: undefined, FOOD: undefined,
        LUXURY: undefined, ODDLY_SATISFYING: undefined, ART: undefined, HISTORY: undefined, CUTIE_PIE: undefined
    }

    var languages = ['HINDI', 'ENGLISH', 'ALL']

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

            $('.video-list').empty()

            if (channels[currentCategory]['channels'].length == 0) {
                getChannelsForCategory(currentCategory)
            } else {
                populateChannelsInDropdown(currentCategory, true)
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

    /** Event on scrolling to the bottom of the page. */
    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 1
            && $('#category-dropdown-items').is(':hidden') && $('#channels-dropdown-items').is(':hidden')) {
            if (videos[selectedCategory]['channels'][selectedChannel] && videos[selectedCategory]['channels'][selectedChannel]['nextToken']) {
                getUncuratedVideosForChannelAndCategoryFromRemote(
                    selectedCategory,
                    selectedChannel,
                    videos[selectedCategory]['channels'][selectedChannel]['nextToken']
                )
            }
        }
    });

    getChannelsForCategory(selectedCategory)

    function getChannelsForCategory(category, nextToken) {

        let categoryToFetch = category, fetchUrl

        // Check if the loading modal is already open.
        if (!$('#loading-modal').hasClass('in')) {
            $('#loading-modal').modal('show')
        }

        if (!categoryToFetch) {
            categoryToFetch = selectedCategory
        }

        fetchUrl = apiUrl + '/getallchannelsbycategory?category=' + categories[categoryToFetch]

        if (nextToken) {
            fetchUrl = fetchUrl + '&nextToken=' + nextToken
        }

        $.ajax({
            url: fetchUrl,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            crossDomain: true,
            success: function (data) {
                if (data && data.result && data.result.channels && data.result.channels.length > 0 && data.result.channels[0]) {
                    for (var channelIndex = 0; channelIndex < data.result.channels.length; channelIndex++) {
                        channels[categoryToFetch]['channels'].push(data.result.channels[channelIndex])
                        if (!videos[categoryToFetch]['channels'][data.result.channels[channelIndex]['id']]) {
                            videos[categoryToFetch]['channels'][data.result.channels[channelIndex]['id']] = { 'list': [], nextToken: undefined }
                        }
                        addChannelInChannelsMap(data.result.channels[channelIndex], categoryToFetch)
                    }
                }

                if (data && data.result && data.result.nextToken) {
                    getChannelsForCategory(categoryToFetch, data.result.nextToken)
                } else {
                    console.log("nextToken is not present.")
                    populateChannelsInDropdown(category, true)
                    setTimeout(function () {
                        $('#loading-modal').modal('hide')
                    }, 500)
                }
            }, error: function (error) {
                setTimeout(function () {
                    $('#loading-modal').modal('hide')
                }, 500)
                alert("Error in a query. Please reload the page.")
            }
        })
    }

    function getUncuratedVideosForChannelAndCategoryFromRemote(category, channelId, nextToken) {
        let categoryToFetch = category, channelToFetch = channelId, fetchUrl
        if (!categoryToFetch) {
            categoryToFetch = selectedCategory
        }
        if (!channelToFetch) {
            channelToFetch = channel
        }
        fetchUrl = apiUrl + '/getuncuratedvideosbycategoryandchannel?category=' + categories[categoryToFetch] + '&channelId=' + channelToFetch
        if (nextToken) {
            fetchUrl = fetchUrl + '&nextToken=' + nextToken
        }
        if (!$('#loading-modal').hasClass('in')) {
            $('#loading-modal').modal('show')
        }
        $.ajax({
            url: fetchUrl,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            crossDomain: true,
            success: function (data) {
                console.log("data:", data)

                if (data && data.result && data.result.videos && data.result.videos.length > 0 && data.result.videos[0]) {
                    let videosFetched = data.result.videos

                    if (!videos[categoryToFetch]['channels'][channelId]) {
                        videos[categoryToFetch]['channels'][channelId] = {}
                        videos[categoryToFetch]['channels'][channelId]['list'] = []
                        videos[categoryToFetch]['channels'][channelId]['nextToken'] = undefined
                    }

                    if (!videos[categoryToFetch]['channels'][channelId]['list']) {
                        videos[categoryToFetch]['channels'][channelId]['list'] = []
                    }

                    if (!videos[categoryToFetch]['channels'][channelId]['nextToken']) {
                        videos[categoryToFetch]['channels'][channelId]['nextToken'] = undefined
                    }

                    for (var videoIndex = 0; videoIndex < videosFetched.length; videoIndex++) {
                        videos[categoryToFetch]['channels'][channelId]['list'].push(videosFetched[videoIndex])
                        addVideoInVideosMap(videosFetched[videoIndex], categoryToFetch)
                    }

                    if (data.result.nextToken) {
                        videos[categoryToFetch]['channels'][channelId]['nextToken'] = data.result.nextToken
                    } else {
                        videos[categoryToFetch]['channels'][channelId]['nextToken'] = undefined
                    }
                }

                populateVideosInListView(categoryToFetch, channelToFetch, true)

                setTimeout(function () {
                    $('#loading-modal').modal('hide')
                }, 500)
            },
            error: function (error) {
                console.log("Error in fetching the videos for the category and channel.")
                setTimeout(function () {
                    $('#loading-modal').modal('hide')
                }, 500)
                alert("please reload the page")
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

    // getUncuratedVideosFromRemote()

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
                'userCurated': $.session.get('fosho_username')
            }),
            success: function (response) {
                console.log("Response:", JSON.stringify(response))
                console.log("response.statusCode:", response.statusCode)
                console.log("response.result.added:", response.result.added)
                if (response.statusCode == 200 && response.result && response.result.added) {
                    console.log("response added is true")
                    removeVideoFromAllCategories(videoIdInApproveModal)
                    populateVideosInListView(selectedCategory, selectedChannel, true)
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
                    populateVideosInListView(selectedCategory, selectedChannel, true)
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

        var removeCategories = videosCatalogue[videoId]['categories']
        var channelId = videosCatalogue[videoId]['channelId']

        if (removeCategories && removeCategories.length > 0) {
            removeCategories.forEach(function (category) {
                if (videos[category] && videos[category]['channels'] && videos[category]['channels'][channelId]
                    && videos[category]['channels'][channelId]['list'] && videos[category]['channels'][channelId]['list'].length > 0) {
                    for (var videoIndex = 0; videoIndex < videos[category]['channels'][channelId]['list'].length; videoIndex++) {
                        console.log("video:", videos[category]['channels'][channelId]['list'][videoIndex])
                        if (videos[category]['channels'][channelId]['list'][videoIndex]['id'] == videoId) {
                            console.log("found the videoid inside the videos")
                            videos[category]['channels'][channelId]['list'].splice(videoIndex, 1)
                            console.log("video", videoId, "removed from category", category)
                        }
                    }
                }
            })
        }

        delete videosCatalogue[videoId]
    }

    function populateVideosInListView(category, channelFilter, removeAllElements) {
        console.log('inside populateVideosInListView')

        var categoryVideos
        if (removeAllElements) {
            $('.video-list').empty()
        }

        categoryVideos = getVideosWithChannelFilter(category, channelFilter)

        console.log("categoryVideos:", categoryVideos)
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
        return videos[category]['channels'][channelFilter]['list']
    }

    function populateChannelsInDropdown(category, removeAllElements) {

        var categoryChannels = channels[category]['channels']

        if (removeAllElements) {
            $('#channels-dropdown-items').empty()
            $('#channels-dropdown-items').append($('<a />').val('no-selection').attr('id', 'channel-no-selection').text('##Select A Channel'))
            $('#channels-dropdown-items').append($('<div />').addClass('dropdown-divider'))
            $('#channels-dropdown-button').text('##Select A Channel')
        }

        for (var channelIndex = 0; channelIndex < categoryChannels.length; channelIndex++) {
            var channelItem = categoryChannels[channelIndex]
            var channelTitle = channelItem['title']
            var channelId = channelItem['id']

            if (channelIndex == 0 && !removeAllElements) {
                $('#channels-dropdown-button').text(channelTitle)
            }

            if (!videos[category]['channels'][channelId]) {
                videos[category]['channels'][channelId] = {}
                videos[category]['channels'][channelId]['list'] = []
                videos[category]['channels'][channelId]['nextToken'] = undefined
            }

            $('#channels-dropdown-items')
                .append($('<a>').val(channelId).text(channelTitle).addClass('dropdown-item').attr('id', 'channel-' + channelId))
                .attr('data-channel-name', channelTitle)

            $('#channel-' + channelId).click(function (event) {
                $('#channels-dropdown-button').text(event.target.text)
                selectedChannel = event.target.value
                if (videos[selectedCategory]['channels'][selectedChannel]['list'] && videos[selectedCategory]['channels'][selectedChannel]['list'].length > 0) {
                    populateVideosInListView(selectedCategory, event.target.value, true)
                } else {
                    getUncuratedVideosForChannelAndCategoryFromRemote(selectedCategory, selectedChannel)
                }
            })
        }

        $('#channel-no-selection').click(function () {
            $('#channels-dropdown-button').text('##Select A Channel')
            $('.video-list').empty()
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