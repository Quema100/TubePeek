const getYouTubeVideoInfo = () => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const videoId = new URLSearchParams(window.location.search).get('v');
        xhr.open("GET", videoId ? `https://www.youtube.com/watch?v=${videoId}` : window.location.href.split('&')[0], true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const html = xhr.responseText;

                const jsonString = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
                if (!jsonString || !jsonString[1]) {
                    console.error('ytInitialPlayerResponse is not found.');
                    return;
                }

                try {
                    const playerResponse = JSON.parse(jsonString[1]);
                    if (playerResponse.videoDetails?.author.includes('- Topic')) return;

                    const channelId = playerResponse.videoDetails?.channelId;
                    if (!channelId) {
                        console.error('Unable to retrieve channel ID.');
                        return;
                    }

                    const NowVideo = playerResponse.videoDetails?.title;

                    const videosUrl = `https://www.youtube.com/channel/${channelId}/videos`;

                    const shortsUrl = `https://www.youtube.com/channel/${channelId}/shorts`;

                    Promise.all([
                        getChannelLatestVideos(videosUrl).catch(() => null),
                        getChannelLatestShorts(shortsUrl).catch(() => null)
                    ]).then(([videoData, shortsData]) => {
                        resolve({
                            NowVideo: NowVideo,
                            LatestVideo: videoData,
                            LatestShort: shortsData
                        });
                    });

                } catch (e) {
                    console.error('ytInitialPlayerResponse JSON parse failed:', e);
                }
            } else {
                console.error('Failed to fetch channel videos page. Status code:', xhr1.status);
            }

        };

        xhr.onerror = () => {
            console.error('Network error while requesting this video page.');
        };

        xhr.send();
    })
};

const getChannelLatestVideos = (videosUrl) => {
    let LatestVideoList = []
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", videosUrl, true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const videosHtml = xhr.responseText;

                const dataMatch = videosHtml.match(/var ytInitialData = (\{.+?\});<\/script>/s)
                    || videosHtml.match(/window\["ytInitialData"\] = (\{.+?\});<\/script>/s);

                if (!dataMatch || !dataMatch[1]) {
                    console.error('ytInitialData is not found.');
                    return;
                }

                try {
                    const ytInitialData = JSON.parse(dataMatch[1]);
                    const channelPFP = ytInitialData.header?.pageHeaderRenderer.content
                        ?.pageHeaderViewModel.image.decoratedAvatarViewModel.avatar.avatarViewModel.image
                        ?.sources[ytInitialData.header?.pageHeaderRenderer.content?.pageHeaderViewModel.image.decoratedAvatarViewModel.avatar.avatarViewModel.image?.sources.length - 1].url;
                    const channelName = ytInitialData.metadata?.channelMetadataRenderer.title;
                    const channelUrl = ytInitialData.metadata?.channelMetadataRenderer.vanityChannelUrl;
                    const subscriberCount = ytInitialData.header?.pageHeaderRenderer.content
                        ?.pageHeaderViewModel?.metadata?.contentMetadataViewModel
                        ?.metadataRows[1]?.metadataParts[0]?.accessibilityLabel || document.querySelector('#owner-sub-count')?.innerText?.trim() || 'Unknown Subscribers';
                    const tabs = ytInitialData.contents?.twoColumnBrowseResultsRenderer?.tabs
                        || ytInitialData.contents?.singleColumnBrowseResultsRenderer?.tabs;

                    if (!tabs) {
                        reject('Failed to find tab information.');
                        return;
                    }

                    const videosTab = tabs.find(tab => {
                        const title = tab.tabRenderer?.title?.toLowerCase();
                        return title === '동영상' || title === 'videos' || title === '動画';
                    })?.tabRenderer;

                    if (!videosTab) {
                        reject('Failed to find the Videos tab.');
                        return;
                    }

                    const richGridRenderer = videosTab.content?.richGridRenderer?.contents || [];

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
                        reject('richGridRenderer.contents is Empty.');
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

        xhr.onerror = () => {
            console.error('Network error while requesting channel videos page.');
        };

        xhr.send();
    });
};

const getChannelLatestShorts = (videosUrl) => {
    let LatestVideoList = []
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", videosUrl, true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const videosHtml = xhr.responseText;

                const dataMatch = videosHtml.match(/var ytInitialData = (\{.+?\});<\/script>/s)
                    || videosHtml.match(/window\["ytInitialData"\] = (\{.+?\});<\/script>/s);

                if (!dataMatch || !dataMatch[1]) {
                    console.error('ytInitialData is not found.');
                    return;
                }

                try {
                    const ytInitialData = JSON.parse(dataMatch[1]);
                    const channelPFP = ytInitialData.header?.pageHeaderRenderer.content
                        ?.pageHeaderViewModel.image.decoratedAvatarViewModel.avatar.avatarViewModel.image
                        ?.sources[ytInitialData.header?.pageHeaderRenderer.content?.pageHeaderViewModel.image.decoratedAvatarViewModel.avatar.avatarViewModel.image?.sources.length - 1].url;
                    const channelName = ytInitialData.metadata?.channelMetadataRenderer.title;
                    const channelUrl = ytInitialData.metadata?.channelMetadataRenderer.vanityChannelUrl;
                    const subscriberCount = ytInitialData.header?.pageHeaderRenderer.content
                        ?.pageHeaderViewModel?.metadata?.contentMetadataViewModel
                        ?.metadataRows[1]?.metadataParts[0]?.accessibilityLabel || document.querySelector('#owner-sub-count')?.innerText?.trim() || 'Unknown Subscribers';
                    const tabs = ytInitialData.contents?.twoColumnBrowseResultsRenderer?.tabs
                        || ytInitialData.contents?.singleColumnBrowseResultsRenderer?.tabs;
                    if (!tabs) {
                        reject('Failed to find tab information.');
                        return;
                    }

                    const shortsTab = tabs.find(tab => {
                        const title = tab.tabRenderer?.title?.toLowerCase();
                        return title === 'shorts' || title === 'ショート';
                    })?.tabRenderer;

                    if (!shortsTab) {
                        reject('Failed to find the Shorts tab.');
                        return;
                    }

                    const richGridRenderer = shortsTab.content?.richGridRenderer?.contents || [];
                    if (richGridRenderer.length > 0) {
                        richGridRenderer.forEach(item => {
                            const video = item.richItemRenderer?.content?.shortsLockupViewModel;
                            if (!video) return;
                            const title = video.overlayMetadata?.primaryText?.content;
                            const videoThumbnail = video.thumbnailViewModel?.thumbnailViewModel?.image?.sources[video.thumbnailViewModel?.thumbnailViewModel?.image?.sources.length - 1].url
                            const videoId = video.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
                            const url = `https://www.youtube.com/shorts/${videoId}`;
                            const views = video.overlayMetadata.secondaryText.content || 'no info';
                            LatestVideoList.push({ title, videoThumbnail, url, views });
                        });

                    } else {
                        reject('richGridRenderer.contents is Empty.');
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

        xhr.onerror = () => {
            console.error('Network error while requesting channel videos page.');
        };

        xhr.send();
    });
};

const sessions = async (data = null) => {
    if (!localStorage.getItem('session')) {
        localStorage.setItem('session', 'videos');
    }

    if (data) {
        localStorage.setItem('session', data)
    }
}

/**
 * @param {JSON} LatestVideo
 * @param {HTMLDivElement} createDiv
 * @param {HTMLDivElement} LatestVideos
 * @param {HTMLDivElement} LatestShorts
 * @param {HTMLDivElement} LatestVideoInfoDiv
 */
const videosUI = async (colors, createDiv, LatestVideo, LatestVideos, LatestShorts, LatestVideoInfoDiv) => {
    createDiv.style.height = '600px';
    LatestVideoInfoDiv.style.overflowY = 'auto';
    LatestVideoInfoDiv.style.overflowX = 'hidden';
    LatestVideoInfoDiv.style.flexDirection = 'column';

    await sessions('videos');
    await createVideoList(colors, LatestVideo.LatestVideoList, LatestVideoInfoDiv);
    LatestVideos.style.background = colors.gradientionbg;
    LatestShorts.style.background = 'transparent';
}

/**
 * @param {JSON} LatestShort
 * @param {HTMLDivElement} createDiv
 * @param {HTMLDivElement} LatestVideos
 * @param {HTMLDivElement} LatestShorts
 * @param {HTMLDivElement} LatestVideoInfoDiv
 */
const shortsUI = async (colors, createDiv, LatestShort, LatestVideos, LatestShorts, LatestVideoInfoDiv) => {
    createDiv.style.height = '470px';
    LatestVideoInfoDiv.style.overflowX = 'auto';
    LatestVideoInfoDiv.style.overflowY = 'hidden';
    LatestVideoInfoDiv.style.flexDirection = 'row';

    await sessions('shorts');
    await createShortList(colors, LatestShort.LatestVideoList, LatestVideoInfoDiv);
    LatestShorts.style.background = colors.gradientionbg;
    LatestVideos.style.background = 'transparent';
}

/**
 * @param {Array} LatestVideoList
 * @param {HTMLDivElement} LatestVideoInfoDiv
 */
const createVideoList = async (colors, LatestVideoList, LatestVideoInfoDiv) => {
    LatestVideoInfoDiv.replaceChildren();
    for (let i = 0; i < LatestVideoList.length; i++) {
        const LatestVideo = document.createElement('div');
        LatestVideo.style.width = '90%';
        LatestVideo.style.height = '100px';
        LatestVideo.style.margin = '10px 20px';
        LatestVideo.style.display = 'flex';
        LatestVideo.style.flexDirection = 'row';
        LatestVideo.style.alignItems = 'center';
        LatestVideo.style.justifyContent = 'flex-start';
        LatestVideo.style.cursor = 'pointer';

        const videoThumbnail = document.createElement('img');
        videoThumbnail.src = LatestVideoList[i].videoThumbnail;
        videoThumbnail.style.width = 'auto';
        videoThumbnail.style.height = '80px';
        videoThumbnail.style.borderRadius = '12px';

        const videoTitleAndETCinfoDiv = document.createElement('div')
        videoTitleAndETCinfoDiv.style.width = '55%';
        videoTitleAndETCinfoDiv.style.height = '80px';
        videoTitleAndETCinfoDiv.style.margin = '0 0 0 15px';
        videoTitleAndETCinfoDiv.style.display = 'flex';
        videoTitleAndETCinfoDiv.style.flexDirection = 'column';
        videoTitleAndETCinfoDiv.style.alignItems = 'center';
        videoTitleAndETCinfoDiv.style.justifyContent = 'center';

        const videoTitle = document.createElement('a');
        videoTitle.style.width = '100%';
        videoTitle.style.minHeight = '35%';
        videoTitle.style.height = 'auto';
        videoTitle.style.maxHeight = '45%';
        videoTitle.style.margin = '5px 0';
        videoTitle.innerText = LatestVideoList[i].title == (undefined || null) ?
            "No Title Found" :
            (function () {
                const cleanStr = LatestVideoList[i].title.replace(/(?<=[^\w\s가-힣])\s+(?=[^\w\s가-힣])/g, '');
                const strArr = [...cleanStr];
                if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(cleanStr)) {
                    return strArr.length > 20 ? strArr.slice(0, 20).join('') + '...' : cleanStr;
                }
                else if (/[가-힣]/.test(cleanStr) && !/[a-zA-Z]/.test(cleanStr)) {
                    return strArr.length > 22 ? strArr.slice(0, 22).join('') + '...' : cleanStr;
                }
                else if (/[a-zA-Z]/.test(cleanStr) && !/[가-힣]/.test(cleanStr)) {
                    return strArr.length > 33 ? strArr.slice(0, 36).join('') + '...' : cleanStr;
                }
                else {
                    return strArr.length > 24 ? strArr.slice(0, 24).join('') + '...' : cleanStr;
                }
            })();
        videoTitle.style.color = colors.text;
        videoTitle.style.display = 'flex';
        videoTitle.style.alignItems = 'center';
        videoTitle.style.justifyContent = 'flex-start';
        videoTitle.style.fontSize = '13px';

        const videolength = document.createElement('a');
        videolength.style.width = '100%';
        videolength.style.height = '10px';
        videolength.innerText = `video Length: ${LatestVideoList[i].videolength}`
        videolength.style.color = colors.text;
        videolength.style.display = 'flex';
        videolength.style.alignItems = 'center';
        videolength.style.justifyContent = 'flex-start';

        const videoETC = document.createElement('a');
        videoETC.style.width = '100%';
        videoETC.style.height = '20px';
        videoETC.innerText = `${LatestVideoList[i].views} • ${LatestVideoList[i].published}`
        videoETC.style.color = colors.text;
        videoETC.style.display = 'flex';
        videoETC.style.alignItems = 'center';
        videoETC.style.justifyContent = 'flex-start';

        LatestVideo.onclick = () => window.location.href = LatestVideoList[i].url;

        LatestVideoInfoDiv.appendChild(LatestVideo);
        LatestVideo.appendChild(videoThumbnail);
        LatestVideo.appendChild(videoTitleAndETCinfoDiv);
        videoTitleAndETCinfoDiv.appendChild(videoTitle);
        videoTitleAndETCinfoDiv.appendChild(videolength);
        videoTitleAndETCinfoDiv.appendChild(videoETC);
    }
}

/**
 * @param {Array} LatestShortList
 * @param {HTMLDivElement} LatestVideoInfoDiv
 */
const createShortList = async (colors, LatestShortList, LatestVideoInfoDiv) => {
    LatestVideoInfoDiv.replaceChildren();
    for (let i = 0; i < LatestShortList.length; i++) {
        const LatestVideo = document.createElement('div');
        LatestVideo.style.width = '96px';
        LatestVideo.style.height = '90%';
        LatestVideo.style.margin = '10px 5px';
        LatestVideo.style.display = 'flex';
        LatestVideo.style.flexDirection = 'column';
        LatestVideo.style.alignItems = 'center';
        LatestVideo.style.justifyContent = 'flex-start';
        LatestVideo.style.cursor = 'pointer';

        const videoThumbnail = document.createElement('img');
        videoThumbnail.src = LatestShortList[i].videoThumbnail;
        videoThumbnail.style.width = 'auto';
        videoThumbnail.style.maxWidth = '96px';
        videoThumbnail.style.objectFit = 'cover';
        videoThumbnail.style.height = '170px';
        videoThumbnail.style.borderRadius = '12px';

        const videoTitleAndETCinfoDiv = document.createElement('div')
        videoTitleAndETCinfoDiv.style.width = '100%';
        videoTitleAndETCinfoDiv.style.height = '110px';
        videoTitleAndETCinfoDiv.style.display = 'flex';
        videoTitleAndETCinfoDiv.style.flexDirection = 'column';
        videoTitleAndETCinfoDiv.style.alignItems = 'center';
        videoTitleAndETCinfoDiv.style.justifyContent = 'center';

        const videoTitle = document.createElement('a');
        videoTitle.style.width = '100%';
        videoTitle.style.minHeight = '10%';
        videoTitle.style.height = 'auto';
        videoTitle.style.maxHeight = '90%';
        videoTitle.style.margin = '5px 0';
        videoTitle.innerText = LatestShortList[i].title == (undefined || null) ?
            "No Title Found" :
            (function () {
                const cleanStr = LatestShortList[i].title.replace(/(?<=[^\w\s가-힣])\s+(?=[^\w\s가-힣])/g, '');
                const strArr = [...cleanStr];
                if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(cleanStr)) {
                    return strArr.length > 20 ? strArr.slice(0, 20).join('') + '...' : cleanStr;
                }
                else if (/[가-힣]/.test(cleanStr) && !/[a-zA-Z]/.test(cleanStr)) {
                    return strArr.length > 22 ? strArr.slice(0, 22).join('') + '...' : cleanStr;
                }
                else if (/[a-zA-Z]/.test(cleanStr) && !/[가-힣]/.test(cleanStr)) {
                    return strArr.length > 33 ? strArr.slice(0, 36).join('') + '...' : cleanStr;
                }
                else {
                    return strArr.length > 24 ? strArr.slice(0, 24).join('') + '...' : cleanStr;
                }
            })();
        videoTitle.style.color = colors.text;
        videoTitle.style.display = 'flex';
        videoTitle.style.alignItems = 'center';
        videoTitle.style.justifyContent = 'flex-start';
        videoTitle.style.fontSize = '13px';

        const videoETC = document.createElement('a');
        videoETC.style.width = '100%';
        videoETC.style.height = '20px';
        videoETC.innerText = `${LatestShortList[i].views}`
        videoETC.style.color = colors.text;
        videoETC.style.display = 'flex';
        videoETC.style.alignItems = 'center';
        videoETC.style.justifyContent = 'flex-start';

        LatestVideo.onclick = () => window.location.href = LatestShortList[i].url;

        LatestVideoInfoDiv.appendChild(LatestVideo);
        LatestVideo.appendChild(videoThumbnail);
        LatestVideo.appendChild(videoTitleAndETCinfoDiv);
        videoTitleAndETCinfoDiv.appendChild(videoTitle);
        videoTitleAndETCinfoDiv.appendChild(videoETC);
    }
}

const Watchinfo = async () => {
    console.log('Watchinfo function executed');
    if (document.getElementById('watchinfo-div')) return;
    if (!localStorage.getItem('session')) await sessions();

    const isDarkMode = document.documentElement.hasAttribute('dark')
        || document.querySelector('ytd-app')?.hasAttribute('dark');

    const colors = {
        bg: isDarkMode ? '#1f1f1f' : '#f9f9f9',
        header: isDarkMode ? '#272727' : '#f1f1f1',
        text: isDarkMode ? '#f1f1f1' : '#121212',
        subText: isDarkMode ? '#ffffff96' : '#555',
        hoverArrow: isDarkMode ? '#f1f1f1' : '#121212',
        arrow: isDarkMode ? '#aaa' : '#555',
        gradientionbg: isDarkMode ? 'linear-gradient( #383838, #1f1f1f)'
            : 'linear-gradient( #e6e6e6ff, #f9f9f9)'
    };

    const secondary = document.querySelector('[id="secondary"][class="style-scope ytd-watch-flexy"]');

    const createDiv = document.createElement('div');
    createDiv.id = 'watchinfo-div';
    createDiv.style.display = 'flex';
    createDiv.style.flexDirection = 'column';
    createDiv.style.alignItems = 'center';
    createDiv.style.justifyContent = 'flex-start';
    createDiv.style.width = '100%';
    createDiv.style.height = '100px';
    createDiv.style.backgroundColor = colors.bg;
    createDiv.style.margin = '10px 0 20px 0';
    createDiv.style.borderRadius = '12px';

    createDiv.style.transition = 'height 0.3s ease-in-out';

    const headerDiv = document.createElement('div');
    headerDiv.style.width = '100%';
    headerDiv.style.height = '100px';
    headerDiv.style.display = 'flex';
    headerDiv.style.flexDirection = 'row';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.justifyContent = 'center';
    headerDiv.style.backgroundColor = colors.header;
    headerDiv.style.borderRadius = '12px';


    const TitleWithChannelDiv = document.createElement('div');
    TitleWithChannelDiv.style.width = '70%';
    TitleWithChannelDiv.style.height = '100px';
    TitleWithChannelDiv.style.display = 'flex';
    TitleWithChannelDiv.style.flexDirection = 'column';
    TitleWithChannelDiv.style.justifyContent = 'center';
    TitleWithChannelDiv.style.alignItems = 'flex-start';
    TitleWithChannelDiv.style.fontSize = '15px';
    TitleWithChannelDiv.style.margin = '0 5px 0 20px';

    try {
        const data = await getYouTubeVideoInfo();
        const { NowVideo, LatestVideo, LatestShort } = data;

        console.log(data)

        const TitleA = document.createElement('a')


        TitleA.textContent = NowVideo == (undefined || null) ?
            "No Title Found" :
            (function () {
                const cleanStr = NowVideo.replace(/(?<=[^\w\s가-힣])\s+(?=[^\w\s가-힣])/g, '');
                const strArr = [...cleanStr];
                if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(cleanStr)) {
                    return strArr.length > 20 ? strArr.slice(0, 19).join('') + '...' : cleanStr;
                }
                else if (/[가-힣]/.test(cleanStr) && !/[a-zA-Z]/.test(cleanStr)) {
                    return strArr.length > 22 ? strArr.slice(0, 22).join('') + '...' : cleanStr;
                }
                else if (/[a-zA-Z]/.test(cleanStr) && !/[가-힣]/.test(cleanStr)) {
                    return strArr.length > 33 ? strArr.slice(0, 36).join('') + '...' : cleanStr;
                }
                else {
                    return strArr.length > 24 ? strArr.slice(0, 23).join('') + '...' : cleanStr;
                }
            })();

        TitleA.style.color = colors.text;
        TitleA.style.width = '100%';
        TitleA.style.height = 'auto';
        TitleA.style.maxHeight = '50px';
        TitleA.style.fontSize = '14px';

        TitleA.style.margin = 'auto';
        TitleA.style.display = 'flex';
        TitleA.style.alignItems = 'center';



        const channelinfoDiv = document.createElement('div');
        channelinfoDiv.id = 'channelinfoDiv';
        channelinfoDiv.style.width = '100%';
        channelinfoDiv.style.height = '50px';
        channelinfoDiv.style.display = 'flex';
        channelinfoDiv.style.flexDirection = 'row';
        channelinfoDiv.style.justifyContent = 'flex-start';
        channelinfoDiv.style.alignItems = 'center';
        channelinfoDiv.style.margin = '0 auto 0 0';

        const channelImg = document.createElement('img');
        channelImg.src = LatestVideo.channelPFP || LatestShort.channelPFP;
        channelImg.style.width = '35px';
        channelImg.style.height = '35px';
        channelImg.style.marginBottom = '10px';
        channelImg.style.borderRadius = '50%';
        channelImg.style.cursor = 'pointer';


        const channelinfo = document.createElement('div');
        channelinfo.style.width = '100%';
        channelinfo.style.height = '50px';
        channelinfo.style.display = 'flex';
        channelinfo.style.flexDirection = 'column';
        channelinfo.style.alignItems = 'flex-start';
        channelinfo.style.justifyContent = 'center';
        channelinfo.style.margin = '0 10px'


        const channelName = document.createElement('a');
        channelName.innerText = LatestVideo.channelName || LatestShort.channelName;
        channelName.style.maxWidth = '100%';
        channelName.style.width = 'auto';
        channelName.style.height = '25px';
        channelName.style.color = colors.text;
        channelName.style.fontSize = '11px';
        channelName.style.display = 'flex';
        channelName.style.alignItems = 'center';
        channelName.style.cursor = 'pointer';

        const channelSub = document.createElement('a');
        channelSub.innerText = LatestVideo.subscriberCount || LatestShort.subscriberCount;
        channelSub.style.maxWidth = '70%';
        channelSub.style.width = 'auto';
        channelSub.style.height = '25px';
        channelSub.style.color = colors.subText;
        channelSub.style.fontSize = '9px';

        const infoButtonDiv = document.createElement('div');
        infoButtonDiv.style.width = '15%';
        infoButtonDiv.style.height = '100px';
        infoButtonDiv.style.display = 'flex';
        infoButtonDiv.style.flexDirection = 'column';
        infoButtonDiv.style.justifyContent = 'center';
        infoButtonDiv.style.alignItems = 'center';
        infoButtonDiv.style.margin = '0 20px 0 10px';

        const infoButton = document.createElement('button');
        infoButton.id = "infoButton"
        infoButton.style.width = '50%';
        infoButton.style.height = '50%';
        infoButtonDiv.style.position = 'relative';
        infoButton.style.background = 'none';
        infoButton.style.border = 'none';
        infoButton.style.cursor = 'pointer';

        const infoStyle = document.createElement('style');
        infoStyle.id = 'infoStyle';
        infoStyle.textContent = `
            #infoButton:before {
                position: absolute;
                left: 50%;
                top: 50%;
                content: '';
                width: 10px; 
                height: 10px; 
                border-top: 2.5px solid ${colors.arrow}; 
                border-right: 2.5px solid ${colors.arrow}; 
                transform: translate(-50%, -50%) rotate(135deg);
                transition: all 0.2s ease-in-out;
            }

            #infoButton:hover:before {
                border-color: ${colors.hoverArrow};
            }

            #infoButton.is-toggled:before {
                transform: translate(-50%, -50%) rotate(-45deg); 
            }
        `;

        const LatestDiv = document.createElement('div');
        LatestDiv.id = 'LatestDiv';
        LatestDiv.style.width = '90%';
        LatestDiv.style.height = '20px';
        LatestDiv.style.display = 'flex';
        LatestDiv.style.justifyContent = 'flex-start';
        LatestDiv.style.alignItems = 'center';
        LatestDiv.style.fontSize = '15px';
        LatestDiv.style.color = colors.text;
        LatestDiv.style.margin = '10px 20px 0'

        const LatestVideos = document.createElement('a');
        LatestVideos.id = 'Latestvideos';
        LatestVideos.style.width = '15%';
        LatestVideos.style.height = '20px';
        LatestVideos.style.display = 'flex';
        LatestVideos.innerText = 'Videos'
        LatestVideos.style.justifyContent = 'flex-start';
        LatestVideos.style.alignItems = 'center';
        LatestVideos.style.borderRadius = '12px 12px 0 0'
        LatestVideos.style.fontSize = '13px';
        LatestVideos.style.color = colors.text;
        LatestVideos.style.cursor = 'pointer';
        LatestVideos.style.margin = '0 5px 0 0';
        LatestVideos.style.padding = '0 0 0 15px';

        const LatestShorts = document.createElement('a');
        LatestShorts.id = 'LatestShorts';
        LatestShorts.style.width = '15%';
        LatestShorts.style.height = '20px';
        LatestShorts.style.display = 'flex';
        LatestShorts.style.justifyContent = 'flex-start';
        LatestShorts.innerText = 'Shorts'
        LatestShorts.style.alignItems = 'center';
        LatestShorts.style.borderRadius = '12px 12px 0 0'
        LatestShorts.style.fontSize = '13px';
        LatestShorts.style.color = colors.text;
        LatestShorts.style.cursor = 'pointer';
        LatestShorts.style.margin = '0 0 0 5px';
        LatestShorts.style.padding = '0 0 0 15px';

        const LatestVideoInfoDiv = document.createElement('div');
        LatestVideoInfoDiv.id = 'LatestVideoInfoDiv';
        LatestVideoInfoDiv.style.width = '95%';
        LatestVideoInfoDiv.style.height = '480px'
        LatestVideoInfoDiv.style.display = 'flex';
        LatestVideoInfoDiv.style.justifyContent = 'flex-start';
        LatestVideoInfoDiv.style.alignItems = 'center';
        LatestVideoInfoDiv.style.margin = '10px';
        LatestVideoInfoDiv.style.scrollbarWidth = 'thin';

        channelImg.onclick = () => window.location.href = LatestVideo.channelUrl || LatestShort.channelUrl;
        channelName.onclick = () => window.location.href = LatestVideo.channelUrl || LatestShort.channelUrl;


        LatestVideos.onclick = async () => {
            if (localStorage.getItem('session') != 'videos')
                await videosUI(colors, createDiv, LatestVideo, LatestVideos, LatestShorts, LatestVideoInfoDiv);
        }

        LatestShorts.onclick = async () => {
            if (localStorage.getItem('session') != 'shorts')
                await shortsUI(colors, createDiv, LatestShort, LatestVideos, LatestShorts, LatestVideoInfoDiv);
        }


        infoButton.onclick = async () => {
            const isOpening = infoButton.classList.toggle('is-toggled');
            if (isOpening) {

                if (localStorage.getItem('session') == 'videos')
                    await videosUI(colors, createDiv, LatestVideo, LatestVideos, LatestShorts, LatestVideoInfoDiv);

                if (localStorage.getItem('session') == 'shorts')
                    LatestShort == null
                        ? await videosUI(colors, createDiv, LatestVideo, LatestVideos, LatestShorts, LatestVideoInfoDiv)
                        : await shortsUI(colors, createDiv, LatestShort, LatestVideos, LatestShorts, LatestVideoInfoDiv);

                setTimeout(() => headerDiv.style.borderRadius = '12px 12px 0 0', 100)
                setTimeout(() => {
                    const watchInfoDiv = document.getElementById('watchinfo-div');
                    if (watchInfoDiv && watchInfoDiv.offsetHeight >= 110) {
                        createDiv.appendChild(LatestDiv);
                        LatestDiv.appendChild(LatestVideos);
                        if (LatestShort) LatestDiv.appendChild(LatestShorts);
                        createDiv.appendChild(LatestVideoInfoDiv);
                    };
                }, 250)
            } else {
                createDiv.style.height = '100px';
                setTimeout(() => {
                    const watchInfoDiv = document.getElementById('watchinfo-div');
                    if (watchInfoDiv && watchInfoDiv.offsetHeight <= 140) {
                        LatestVideoInfoDiv.remove();
                        LatestDiv.remove();
                        headerDiv.style.borderRadius = '12px';
                    }
                }, 280)
            }
        };

        document.head.appendChild(infoStyle);
        createDiv.appendChild(headerDiv);
        headerDiv.appendChild(TitleWithChannelDiv);
        TitleWithChannelDiv.appendChild(TitleA);
        TitleWithChannelDiv.appendChild(channelinfoDiv);
        channelinfoDiv.appendChild(channelImg);
        channelinfoDiv.appendChild(channelinfo);
        channelinfo.appendChild(channelName);
        channelinfo.appendChild(channelSub);
        headerDiv.appendChild(infoButtonDiv);
        infoButtonDiv.appendChild(infoButton);

        if (secondary) {
            secondary.insertAdjacentElement('afterbegin', createDiv);
        } else {
            console.error('secondary-inner div not found');
        }
    } catch (e) {
        console.error('Failed to get YouTube video info:', e);
    }
}

const removeWatchinfo = () => {
    const style = document.getElementById('infoStyle');
    const div = document.getElementById('watchinfo-div');
    if (div && style) {
        style.remove();
        div.remove();
        console.log('watchinfo-div and infoStyle removed.');
    }
};

const handleNavigation = () => {
    if (location.pathname.includes('/watch')) {
        setTimeout(() => {
            removeWatchinfo();
            setTimeout(() => Watchinfo(), 100)
        }, 1000);
    } else {
        removeWatchinfo();
    }
};

window.addEventListener("yt-navigate-finish", handleNavigation);

console.log('watch.js loaded and navigation listeners attached.');