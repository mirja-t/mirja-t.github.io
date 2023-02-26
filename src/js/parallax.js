export function parallax(img, idx) {
    let offset;
    let factor = idx===0 ? 0.2 : 0.1;
    setTimeout(()=>{
        offset = img.getBoundingClientRect().top;
    },500);
    function isInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) ||
            rect.bottom >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) ||
            rect.top <= 0 && rect.bottom >= (window.innerHeight || document.documentElement.clientHeight)
        );
    }
    function parallaxScrolling() {
        if (!offset) return;
        const rect = img.getBoundingClientRect();
        if(!isInViewport(img)) return;
        const ankathete = -(window.scrollY - offset) * factor;
        img.style.marginTop = `${ankathete}px`;
        img.style.marginLeft = `-${ankathete / Math.tan(5)}px`;
    }

    document.addEventListener('wheel', parallaxScrolling);
}