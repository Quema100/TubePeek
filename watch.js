const getYouTubeVideoInfo = () => {
    return new Promise((resolve, reject) => {
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

                    console.log(playerResponse)

                    if (playerResponse.videoDetails?.author.includes('- Topic')) return;

                    const channelId = playerResponse.videoDetails?.channelId;
                    if (!channelId) {
                        console.error('Unable to retrieve channel ID.');
                        return;
                    }

                    const NowVideo = playerResponse.videoDetails?.title;

                    const videosUrl = `https://www.youtube.com/channel/${channelId}/videos`;

                    getChannelLatestVideos(videosUrl).then(data => {
                        resolve({ NowVideo, ...data })
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
    })
};

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
                    console.log(ytInitialData)
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

const Watchinfo = async () => {
    console.log('Watchinfo function executed');
    if (document.getElementById('watchinfo-div')) return;

    const isDarkMode = document.documentElement.hasAttribute('dark')
        || document.querySelector('ytd-app')?.hasAttribute('dark');

    const colors = {
        bg: isDarkMode ? '#1f1f1f' : '#f9f9f9',
        header: isDarkMode ? '#272727' : '#f1f1f1',
        text: isDarkMode ? '#f1f1f1' : '#121212',
        subText: isDarkMode ? '#ffffff96' : '#555',
        hoverArrow: isDarkMode ? '#f1f1f1' : '#121212',
        arrow: isDarkMode ? '#aaa' : '#555'
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
        const { NowVideo, channelPFP, channelName, subscriberCount, channelUrl, LatestVideoList } = data;

        console.log(data)

        const TitleA = document.createElement('a')

        TitleA.textContent = NowVideo == (undefined || null) ?
            "No Title Found" :
            /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(NowVideo)?
            [...NowVideo.replace(/(?<=[^\w\s가-힣])\s+(?=[^\w\s가-힣])/g, '')].slice(0, 20).join('') + '...' :
            [...NowVideo.replace(/(?<=[^\w\s가-힣])\s+(?=[^\w\s가-힣])/g, '')].length > 25 ?
                [...NowVideo.replace(/(?<=[^\w\s가-힣])\s+(?=[^\w\s가-힣])/g, '')].slice(0, 25).join('') + '...' :
                NowVideo;

        TitleA.style.color = colors.text;
        TitleA.style.width = '100%';
        TitleA.style.height = '50px';
        TitleA.style.fontSize = '14.5px';
        TitleA.style.display = 'flex';
        TitleA.style.alignItems = 'center';


        const channelinfoDiv = document.createElement('div');
        channelinfoDiv.id = 'channelinfoDiv';
        channelinfoDiv.style.width = '70%';
        channelinfoDiv.style.height = '50px';
        channelinfoDiv.style.display = 'flex';
        channelinfoDiv.style.flexDirection = 'row';
        channelinfoDiv.style.justifyContent = 'flex-start';
        channelinfoDiv.style.alignItems = 'center';
        channelinfoDiv.style.cursor = 'pointer';
        channelinfoDiv.style.margin = '0 auto 0 0';

        const channelImg = document.createElement('img');
        channelImg.src = channelPFP;
        channelImg.style.width = '35px';
        channelImg.style.height = '35px';
        channelImg.style.marginBottom = '10px';
        channelImg.style.borderRadius = '50%';

        const channelinfo = document.createElement('div');
        channelinfo.style.width = '100%';
        channelinfo.style.height = '50px';
        channelinfo.style.display = 'flex';
        channelinfo.style.flexDirection = 'column';
        channelinfo.style.alignItems = 'center';
        channelinfo.style.justifyContent = 'center';
        channelinfo.style.margin = '0 10px'


        const channel_Name = document.createElement('a');
        channel_Name.innerText = channelName;
        channel_Name.style.width = '100%';
        channel_Name.style.height = '25px';
        channel_Name.style.color = colors.text;
        channel_Name.style.fontSize = '11px';
        channel_Name.style.display = 'flex';
        channel_Name.style.alignItems = 'center';

        const channelSub = document.createElement('a');
        channelSub.innerText = subscriberCount;
        channelSub.style.width = '100%';
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

        const LatestDivTitle = document.createElement('a');
        LatestDivTitle.id = 'LatestDivTitle';
        LatestDivTitle.style.width = '90%';
        LatestDivTitle.style.height = '20px';
        LatestDivTitle.innerText = 'LatestVideos';
        LatestDivTitle.style.display = 'flex';
        LatestDivTitle.style.justifyContent = 'flex-start';
        LatestDivTitle.style.alignItems = 'center';
        LatestDivTitle.style.fontSize = '15px';
        LatestDivTitle.style.color = colors.text;
        LatestDivTitle.style.margin = '10px 20px 0'

        const LatestVideoInfoDiv = document.createElement('div');
        LatestVideoInfoDiv.id = 'LatestVideoInfoDiv';
        LatestVideoInfoDiv.style.width = '100%';
        LatestVideoInfoDiv.style.height = '480px'
        LatestVideoInfoDiv.style.display = 'flex';
        LatestVideoInfoDiv.style.flexDirection = 'column';
        LatestVideoInfoDiv.style.justifyContent = 'flex-start';
        LatestVideoInfoDiv.style.alignItems = 'center';
        LatestVideoInfoDiv.style.margin = '10px 0';
        LatestVideoInfoDiv.style.overflowY = 'scroll';
        LatestVideoInfoDiv.style.scrollbarWidth = 'thin';

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
            videoTitle.style.height = '35%';
            videoTitle.style.maxHeight = '45%';
            videoTitle.style.margin = '5px 0';
            videoTitle.innerText = LatestVideoList[i].title.length < 32
                ? LatestVideoList[i].title
                : LatestVideoList[i].title.slice(0, 32) + '...';
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

        channelinfoDiv.onclick = () => window.location.href = channelUrl;


        infoButton.onclick = () => {
            const isOpening = infoButton.classList.toggle('is-toggled');
            if (isOpening) {
                createDiv.style.height = '600px';
                setTimeout(() => headerDiv.style.borderRadius = '12px 12px 0 0', 100)
                setTimeout(() => {
                    const watchInfoDiv = document.getElementById('watchinfo-div');
                    if (watchInfoDiv && watchInfoDiv.offsetHeight >= 110) {
                        createDiv.appendChild(LatestDivTitle);
                        createDiv.appendChild(LatestVideoInfoDiv);
                    };
                }, 250)
            } else {
                createDiv.style.height = '100px';
                setTimeout(() => {
                    const watchInfoDiv = document.getElementById('watchinfo-div');
                    if (watchInfoDiv && watchInfoDiv.offsetHeight <= 130) {
                        document.getElementById('LatestVideoInfoDiv').remove();
                        document.getElementById('LatestDivTitle').remove()
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
        channelinfo.appendChild(channel_Name);
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