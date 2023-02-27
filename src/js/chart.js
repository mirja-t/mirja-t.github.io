import { detailsEn } from './chartData';

export const interactiveChart = function(svgChart) {

    const details = detailsEn;

    let svgScale = svgChart.getBoundingClientRect().width / svgChart.width.animVal.value;
    const svgElements = Array.from(svgChart.querySelectorAll('g#initial > g'));
    const initElements = Array.from(svgChart.getElementById('initial').children);
    let prevContainer = [];

    function clickElement(e) {
        e.stopPropagation();
        const {currentTarget} = e;
        if(prevContainer.length) {
            let prevElement = prevContainer[0];
            prevElement.classList.remove('active');
            prevContainer.shift();
            setTimeout(() => prevElement.remove(),500);
        }
        const newContainer = document.createElement('div');
        newContainer.classList.add('chart-details');
        setTimeout(() => newContainer.classList.add('active'), 50);
        newContainer.style.left = currentTarget.children[0].cx.animVal.value * svgScale + 'px';
        newContainer.style.top = currentTarget.children[0].cy.animVal.value * svgScale + 'px';
        newContainer.innerHTML = `<div><h6>${details[currentTarget.id].headline}</h6><p>${details[currentTarget.id].text}</p></div>`;
        prevContainer.push(newContainer);
        svgChart.parentElement.append(newContainer);
    }

    initElements.forEach(elem => {
        
        const node = elem.querySelector('circle').nodeName;
        const circles = elem.querySelectorAll(node);
        if(!circles.length) return;
        
        const left = circles[0].getAttribute('cx');
        const top = circles[0].getAttribute('cy');
        const icon = elem.querySelector('g');
        elem.style.transformOrigin = `${left}px ${top}px`;
        circles.forEach(circle => circle.style.transformOrigin = `${left}px ${top}px`);
        icon.style.transformOrigin = `${left}px ${top}px`;
        
    });
    
    svgElements.forEach(elem => elem.addEventListener("click", clickElement));    
    svgChart.addEventListener('mouseenter', () => {
        svgChart.classList.add('mouseover');
    });
    svgChart.addEventListener('mouseleave', () => {
        svgChart.classList.remove('mouseover');
    });
    window.addEventListener('resize', () => {
        svgScale = svgChart.getBoundingClientRect().width / svgChart.width.animVal.value;
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                svgChart.classList.add('init');
                setTimeout(() => svgChart.classList.remove('init'),2000);
            }
        });
    });    
    observer.observe(svgChart);
}

