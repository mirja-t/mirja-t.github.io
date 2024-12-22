const template = document.createElement('template');
template.innerHTML = `
    <style>
        .mousefollow {
            --offset: -5%;
            position: relative;
            z-index: 0;
            display: inline-block;
            line-height: 0;
        }
        .mousefollow:after {
            content: '';
            position: absolute;
            display: block;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            transform: scale(0.99) translate(var(--offset), var(--offset));
            transform-origin: center;
            transition: all 0.5s ease;
            border-radius: 50%;
            z-index: 0;
            background-color: transparent;
            border: 2px solid var(--color-secondary);
        }
        .mousefollow:hover:after {
            transform: scale(1.1) var(--bg-translation);
            transition: all .05s ease;
            background-color: var(--color-secondary);
        }
        .link-content {
            position: relative;
            z-index: 1;
            display: inline-block;
        } 
    </style>
    <a href="#" target="_self" title="" name="link" class="mousefollow">
        <slot class="link-content"></slot>
    </a>
    
`;
export default class LinkMousefollow extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        const href = this.getAttribute('href') || '#';
        const target = this.getAttribute('target') || '_self';
        const title = this.getAttribute('title') || '';
        const offset = this.getAttribute('offset') || '-5%';
        shadow.appendChild(template.content.cloneNode(true));
        this.link = shadow.querySelector('a');

        this.content = shadow.querySelector('.link-content');
        this.link.setAttribute('href', href) 
        this.link.setAttribute('target', target) 
        this.link.setAttribute('title', title);
        this.link.setAttribute("style", `--offset: ${offset}`);
        this.hoverAnimation(offset);
    }
    
    hoverAnimation = function(offset, dist = 20) {
        let offsetX = offset;
        let offsetY = offset;
        const element = this.link;
        
        element.addEventListener('mousemove', e => {
            offsetX = ((e.offsetX - element.offsetWidth / 2) * 100) / (element.offsetWidth / 2) / 100 * dist;
            offsetY = ((e.offsetY - element.offsetHeight / 2) * 100) / (element.offsetHeight / 2) / 100 * dist;
            element.style.setProperty('--bg-translation', `translate(${offsetX}%, ${offsetY}%)`);
        });
    }
}
