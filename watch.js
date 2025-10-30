const getYouTubeVideoInfo = () => {
    let channelImgUrl;

    const getText = (selector) => document.querySelector(selector)?.innerText?.trim() || '정보 없음';
    const videoTitle = getText('h1.title yt-formatted-string');
    const channelName = getText('#channel-name a');
    const subscriberCount = getText('#owner-sub-count');
    const uploadDate = getText('#info-strings yt-formatted-string');
    const viewCount = getText('.view-count, #info #count yt-view-count-renderer span.view-count');

    const channelImgEl = document.querySelector('#owner #avatar img');

    if (channelImgEl) {
        channelImgUrl = channelImgEl.src;
        console.log(`Channer pfp URL: ${channelImgUrl}`);
    } else {
        console.log('Channel pfp not found.');
    }

    return { videoTitle, channelName, subscriberCount, uploadDate, viewCount, channelImgUrl }
}

const Watchinfo = () => {
    console.log('Watchinfo function executed');
    if (document.getElementById('watchinfo-div')) return;

    const secondary = document.querySelector('[id="secondary"][class="style-scope ytd-watch-flexy"]');

    const createDiv = document.createElement('div');
    createDiv.id = 'watchinfo-div';
    createDiv.style.display = 'flex';
    createDiv.style.flexDirection = 'column';
    createDiv.style.alignItems = 'center';
    createDiv.style.justifyContent = 'flex-start';
    createDiv.style.width = '100%';
    createDiv.style.height = '100px';
    createDiv.style.backgroundColor = '#1f1f1fff';
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
    headerDiv.style.backgroundColor = '#272727';
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

    const TitleA = document.createElement('a')

    TitleA.textContent = document.querySelector('h1.title yt-formatted-string') == (undefined || null) ?
        "No Title Found" :
        document.querySelector('h1.title yt-formatted-string')?.innerHTML.length > 23 ?
            document.querySelector('h1.title yt-formatted-string')?.innerHTML.slice(0, 23) + '...' :
            document.querySelector('h1.title yt-formatted-string')?.innerHTML;

    TitleA.style.color = '#f1f1f1';
    TitleA.style.width = '100%';
    TitleA.style.height = '50px';
    TitleA.style.fontSize = '15px';
    TitleA.style.display = 'flex';
    TitleA.style.alignItems = 'center';


    const { videoTitle, channelName, subscriberCount, uploadDate, viewCount, channelImgUrl } = getYouTubeVideoInfo()
    const linkElement = document.querySelector('#owner a');

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
    channelImg.src = channelImgUrl;
    channelImg.style.width = '35px';
    channelImg.style.height = '35px';
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
    channel_Name.style.color = '#FFFF'
    channel_Name.style.fontSize = '10px';
    channel_Name.style.display = 'flex';
    channel_Name.style.alignItems = 'center';

    const channelSub = document.createElement('a');
    channelSub.innerText = subscriberCount;
    channelSub.style.width = '100%';
    channelSub.style.height = '25px';
    channelSub.style.color = '#ffffff96';
    channelSub.style.fontSize = '8px';

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
            border-top: 2.5px solid #aaa; 
            border-right: 2.5px solid #aaa; 
            transform: translate(-50%, -50%) rotate(135deg);
            transition: all 0.2s ease-in-out;
        }

        #infoButton:hover:before {
            border-color: #f1f1f1;
        }

        #infoButton.is-toggled:before {
            transform: translate(-50%, -50%) rotate(-45deg); 
        }
    `;

    const videoInfoDiv = document.createElement('div');
    videoInfoDiv.id = 'videoInfoDiv';
    videoInfoDiv.style.width = '100%';
    videoInfoDiv.style.height = '400px'
    videoInfoDiv.style.display = 'flex';
    videoInfoDiv.style.flexDirection = 'column';
    videoInfoDiv.style.justifyContent = 'flex-start';
    videoInfoDiv.style.alignItems = 'center';

    channelinfoDiv.onclick = () => window.location.href = linkElement.href;


    infoButton.onclick = () => {
        const isOpening = infoButton.classList.toggle('is-toggled');
        if (isOpening) {
            createDiv.style.height = '500px';
            setTimeout(() => headerDiv.style.borderRadius = '12px 12px 0 0', 100)
            setTimeout(() => {
                if (document.getElementById('watchinfo-div').offsetHeight >= 110) {
                    createDiv.appendChild(videoInfoDiv);
                };
            }, 250)
        } else {
            createDiv.style.height = '100px';
            setTimeout(() => {
                if (document.getElementById('watchinfo-div').offsetHeight <= 130) {
                    document.getElementById('videoInfoDiv').remove();
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
}

const removeWatchinfo = () => {
    const style = document.getElementById('infoStyle');
    const div = document.getElementById('watchinfo-div');
    console.log(div)
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
        }, 1500);
    } else {
        removeWatchinfo();
    }
};

window.addEventListener("yt-navigate-finish", handleNavigation);

console.log('watch.js loaded and navigation listeners attached.');