const Watchinfo = () => {
    console.log('Watchinfo function executed');
    if (document.getElementById('watchinfo-div')) return;

    const secondary = document.querySelector('[id="secondary-inner"]');

    const createDiv = document.createElement('div');
    createDiv.id = 'watchinfo-div';
    createDiv.style.display = 'flex';
    createDiv.style.flexDirection = 'column';
    createDiv.style.alignItems = 'center';
    createDiv.style.justifyContent = 'flex-start'; // 'center'; 임시 조치
    createDiv.style.width = '100%';
    createDiv.style.height = '100px';
    createDiv.style.backgroundColor = '#272727';
    createDiv.style.margin = '10px 0 20px 0';
    createDiv.style.borderRadius = '8px';

    createDiv.style.transition = 'height 0.3s ease-in-out';

    const headerDiv = document.createElement('div');
    headerDiv.style.width = '100%';
    headerDiv.style.height = '100px';
    headerDiv.style.display = 'flex';
    headerDiv.style.flexDirection = 'row';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.justifyContent = 'center';


    const span = document.createElement('span');
    span.textContent = document.querySelector('h1.title yt-formatted-string') == (undefined || null) ?
        "No Title Found" :
        document.querySelector('h1.title yt-formatted-string')?.innerHTML.length > 22 ?
            document.querySelector('h1.title yt-formatted-string')?.innerHTML.slice(0, 22) + '...' :
            document.querySelector('h1.title yt-formatted-string')?.innerHTML;

    span.style.color = '#f1f1f1';
    span.style.width = '60%';
    span.style.height = '100px';
    span.style.display = 'flex';
    span.style.flexDirection = 'column';
    span.style.justifyContent = 'center';
    span.style.alignItems = 'center';
    span.style.fontSize = '13px';
    span.style.margin = '0 10px 0 20px';


    const infoButtonDiv = document.createElement('div');
    infoButtonDiv.style.width = '40%';
    infoButtonDiv.style.height = '100px';
    infoButtonDiv.style.display = 'flex';
    infoButtonDiv.style.flexDirection = 'column';
    infoButtonDiv.style.justifyContent = 'center';
    infoButtonDiv.style.alignItems = 'center';

    const infoButton = document.createElement('button');
    infoButton.id = "infoButton"
    infoButton.style.width = '100%';
    infoButton.style.height = '100%';
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
    videoInfoDiv.innerText = 'test div';
    videoInfoDiv.style.color = '#FFFF';

    videoInfoDiv.style.transition = 'height 0.3s ease-in-out';

    infoButton.onclick = () => {
        const isOpening = infoButton.classList.toggle('is-toggled');
        if (isOpening) {
            createDiv.style.height = '500px';
            setTimeout(() => {
                if (document.getElementById('watchinfo-div').offsetHeight >= 110) {
                    createDiv.appendChild(videoInfoDiv);
                    videoInfoDiv.style.height = '400px'
                };
            }, 100)
        } else {
            createDiv.style.height = '100px';
            setTimeout(() => {
                if (document.getElementById('watchinfo-div').offsetHeight <= 110) document.getElementById('videoInfoDiv').remove();
            }, 290)
        }
    };

    document.head.appendChild(infoStyle);
    createDiv.appendChild(headerDiv);
    headerDiv.appendChild(span);
    headerDiv.appendChild(infoButtonDiv);
    infoButtonDiv.appendChild(infoButton)

    if (secondary) {
        secondary.insertAdjacentElement('afterbegin', createDiv);
    } else {
        console.error('secondary-inner div not found');
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
            Watchinfo();
        }, 1500);
    } else {
        removeWatchinfo();
    }
};

window.addEventListener("yt-navigate-finish", handleNavigation);

console.log('watch.js loaded and navigation listeners attached.');