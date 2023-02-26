import {debounce} from './utils';

export function stickyElement(container) {
    const parentSection = container.closest('section.section');
    const parentContainer = container.closest('.js-scrollcontainer');
    const stickyElements = container.querySelectorAll('.js-sticky');

    let offset = parentSection.getBoundingClientRect().top - parentContainer.getBoundingClientRect().top;
    let top = Array.from(stickyElements).map(el => el.getBoundingClientRect().top - parentSection.getBoundingClientRect().top + offset);

    function onScroll() {
        stickyElements.forEach((el, idx) => {
            el.style.transform = `translateY(${Math.min(el.parentElement.offsetHeight - el.offsetHeight, Math.max(0, parseInt(container.style.transform.match(/[0-9]+/g)) - top[idx]))}px)`;
        });
    }
    container.addEventListener('wheel', debounce(onScroll, 30));
}