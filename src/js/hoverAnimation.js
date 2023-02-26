export const hoverAnimation = (wrapper, dist=20) => {

    const elements = Array.from(wrapper.children);
    let offsetX = 0;
    let offsetY = 0;

    elements.forEach(element => {
        element.addEventListener('mousemove', e => {
            offsetX = ((e.offsetX - element.offsetWidth / 2) * 100) / (element.offsetWidth / 2) / 100 * dist;
            offsetY = ((e.offsetY - element.offsetHeight / 2) * 100) / (element.offsetHeight / 2) / 100 * dist;
            wrapper.style.setProperty('--bg-translation', `translate(${offsetX}%, ${offsetY}%)`);
        });
    });
    
}