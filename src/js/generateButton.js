export const generateButton = function(wrapper) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('viewBox', `0 0 ${wrapper.offsetWidth} ${wrapper.offsetHeight}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('class', 'button-border');
    const outerRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    const innerRect = document.createElementNS('http://www.w3.org/2000/svg','rect');

    const pathAttributes = {
        fill: 'transparent',
        stroke: '#E6007E',
        'stroke-dashoffset': wrapper.offsetHeight*2 + wrapper.offsetWidth*2,
        'stroke-dasharray': wrapper.offsetHeight*2 + wrapper.offsetWidth*2,
    }

    const pathAttributesOuter = {
        id: 'outerrect',
        x: 0,
        y: 0,
        width: wrapper.offsetWidth,
        height: wrapper.offsetHeight,   
        'stroke-width': 2,
    }

    const pathAttributesInner = {
        id: 'innerrect',
        x: 3,
        y: 3,
        width: wrapper.offsetWidth - 6,
        height: wrapper.offsetHeight - 6,
        'stroke-width': 3,
            
    }

    function setAttributes(node, config) {
        for(let attr in config) {
            node.setAttribute(attr, config[attr])
        }
    }

    function hoverSvg(e) {
        e.type==='mouseover' ? wrapper.classList.add('hover') : wrapper.classList.remove('hover');
    }

    function initSvg() {
        setAttributes(outerRect, pathAttributes);
        setAttributes(innerRect, pathAttributes);
        setAttributes(outerRect, pathAttributesOuter);
        outerRect.setAttribute('stroke-width', 2);
        setAttributes(innerRect, pathAttributesInner);
    }
    initSvg();

    svg.appendChild(outerRect);
    svg.appendChild(innerRect);

    wrapper.appendChild(svg);

    wrapper.addEventListener('resize', initSvg);
    wrapper.addEventListener('mouseover', hoverSvg);
    wrapper.addEventListener('mouseout', hoverSvg);
}