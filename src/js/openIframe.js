

export const openProject = function(projectlinks) {

    function openIframe({currentTarget}) {
        const iframeWrapper = document.getElementById('project');
        const {id} = currentTarget;
        const iframe = iframeWrapper.querySelector('iframe');
        const lineWrapper = document.createElement('div');
        const closeBtn = document.createElement('div');
        closeBtn.classList.add('close');
        closeBtn.innerHTML = `<a href="javascript:void(0);" title="schließen"><span></span></a>`;
        lineWrapper.classList.add('line-wrapper');
        lineWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 50" style="enable-background:new 0 0 100 50;" preserveAspectRatio="none"><line stroke="#E6007E" x1="-0" y1="50" x2="100" y2="0"/></svg>`;
        iframeWrapper.prepend(lineWrapper);
        iframeWrapper.prepend(closeBtn);
        iframeWrapper.classList.add('active');
        iframe.src = `${id}.html`;

        closeBtn.addEventListener('click', closeIframe);

        function closeIframe() {
    
            iframeWrapper.classList.add('out');
            closeBtn.removeEventListener('click', closeIframe);
            closeBtn.remove();
        
            setTimeout(function() {
                lineWrapper.remove();
                iframeWrapper.classList.remove('active');
                iframeWrapper.classList.remove('out');
                iframe.src = '';
            }, 1000);
        }
    }

    projectlinks.forEach(link => link.addEventListener('click', openIframe));
    
}


