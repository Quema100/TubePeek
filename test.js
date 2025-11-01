(() => {
    const xhr1 = new XMLHttpRequest();
    xhr1.open("GET", window.location.href, true);
    xhr1.onload = () => {
        if (xhr1.status >= 200 && xhr1.status < 300) {
            const html = xhr1.responseText;

            const jsonString = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
            if (!jsonString || !jsonString[1]) {
                console.error('ytInitialPlayerResponse is not found.');
                return;
            }

            try {
                const playerResponse = JSON.parse(jsonString[1]);
                console.log('Player Response:', playerResponse);

                if (playerResponse.videoDetails?.author.includes('- Topic')) return;

                const channelId = playerResponse.videoDetails?.channelId;
                if (!channelId) {
                    console.error('Unable to retrieve channel ID.');
                    return;
                }

                const NowVideo = playerResponse.videoDetails?.title;

                const videosUrl = `https://www.youtube.com/channel/${channelId}/videos`;

                getChannelLatestVideos(videosUrl).then(data => {
                    console.log({ NowVideo, ...data })
                })

            } catch (e) {
                console.error('ytInitialPlayerResponse JSON parse failed:', e);
            }
        } else {
            console.error('Failed to fetch channel videos page. Status code:', xhr1.status);
        }

    };

    xhr1.onerror = () => {
        console.error('Network error while requesting this vieo page.');
    };

    xhr1.send();
})();

const getChannelLatestVideos = (videosUrl) => {
    let LatestVideoList = []
    return new Promise((resolve, reject) => {
        const xhr2 = new XMLHttpRequest();
        xhr2.open("GET", videosUrl, true);
        xhr2.onload = () => {
            if (xhr2.status >= 200 && xhr2.status < 300) {
                const videosHtml = xhr2.responseText;

                const dataMatch = videosHtml.match(/var ytInitialData = (\{.+?\});<\/script>/s)
                    || videosHtml.match(/window\["ytInitialData"\] = (\{.+?\});<\/script>/s);

                if (!dataMatch || !dataMatch[1]) {
                    console.error('ytInitialData is not found.');
                    return;
                }

                try {
                    const ytInitialData = JSON.parse(dataMatch[1]);

                    console.log("ytInitialData", ytInitialData)

                    const channelPFP = ytInitialData.header?.pageHeaderRenderer.content?.pageHeaderViewModel.image.decoratedAvatarViewModel.avatar.avatarViewModel.image?.sources[ytInitialData.header?.pageHeaderRenderer.content?.pageHeaderViewModel.image.decoratedAvatarViewModel.avatar.avatarViewModel.image?.sources.length - 1].url;
                    const channelName = ytInitialData.metadata?.channelMetadataRenderer.title;
                    const channelUrl = ytInitialData.metadata?.channelMetadataRenderer.vanityChannelUrl;
                    const subscriberCount = ytInitialData.header?.pageHeaderRenderer.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows[1]?.metadataParts[0]?.accessibilityLabel || document.querySelector('#owner-sub-count')?.innerText?.trim() || 'Unknown Subscribers';
                    const tabs = ytInitialData.contents?.twoColumnBrowseResultsRenderer?.tabs
                        || ytInitialData.contents?.singleColumnBrowseResultsRenderer?.tabs;

                    console.log(tabs)

                    if (!tabs) {
                        console.error('Failed to find tab information.');
                        return;
                    }

                    const videosTab = tabs.find(tab => {
                        const title = tab.tabRenderer?.title?.toLowerCase();
                        return title === '동영상' || title === 'videos' || title === '動画';
                    })?.tabRenderer;

                    if (!videosTab) {
                        console.error('Failed to find the Videos tab.');
                        return;
                    }

                    const richGridRenderer = videosTab.content?.richGridRenderer?.contents || [];

                    console.log(richGridRenderer)
                    if (richGridRenderer.length > 0) {
                        richGridRenderer.forEach(item => {
                            const video = item.richItemRenderer?.content?.videoRenderer;
                            if (!video) return;
                            const title = video.title.runs[0].text;
                            const videoThumbnail = video.thumbnail?.thumbnails[video.thumbnail?.thumbnails.length - 1].url
                            const videoId = video.videoId;
                            const url = `https://www.youtube.com/watch?v=${videoId}`;
                            const published = video.publishedTimeText?.simpleText || 'no info';
                            const views = video.viewCountText?.simpleText || 'no info';
                            const videolength = video.lengthText?.accessibility.accessibilityData.label;

                            LatestVideoList.push({ title, videoThumbnail, url, published, views, videolength });
                        });

                    } else {
                        console.error('richGridRenderer.contents is Empty.');
                        return;
                    }


                    resolve({ channelPFP, channelName, subscriberCount, channelUrl, LatestVideoList })
                } catch (e) {
                    console.error('ytInitialData JSON parse failed:', e);
                }
            } else {
                console.error('Failed to fetch channel videos page. Status code:', xhr2.status);
            }
        };

        xhr2.onerror = () => {
            console.error('Network error while requesting channel videos page.');
        };

        xhr2.send();
    });
};