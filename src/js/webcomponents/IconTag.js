const template = document.createElement("template");
const sheet = new CSSStyleSheet();

let styleTextContent = `
    .icon-tag {
        border-radius: 0.75em;
        @extend %font-sans;
        border: 3px solid var(--color-secondary-light);
        margin: 0 0.125em;
        position: relative;
    }
    .icon-tag::after {
        content: "";
        position: absolute;
        left: 0;
        top: 100%;
        right: 0;
        background-color: var(--color-foreground);
        transition: transform 0.35s ease;
        height: 100%;
    }
    [class*="icon-prefix"] {
        padding-left: 1.5em;
    }
    [class*="icon-prefix"]::before {
        content: "";
        display: inline-block;
        width: 100%;
        height: 100%;
        background-image: image("/design", "icon-#{$icon}.svg");
        background-repeat: no-repeat;
        background-position: left 200%;
        background-size: contain;
        position: absolute;
        left: 0;    
        top: 100%;
    }
    :host([active]) .icon-tag::after {
        transform: translateY(-100%);
        transition: transform 0.25s ease 1s;
    }
`;
sheet.replaceSync(styleTextContent);
document.querySelectorAll("section").forEach((section) => {
    const observer = new MutationObserver(() => {
        const isActive = section.classList.contains("active");
        section.querySelectorAll("icon-tag").forEach((tag) => {
            tag.toggleAttribute("active", isActive);
        });
    });
    observer.observe(section, { attributes: true, attributeFilter: ["class"] });
});

export default class IconTag extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });

        // Get the icon attribute to determine the CSS class
        const icon = this.getAttribute("icon") || "";
        const iconClass = icon ? `icon-prefix-${icon}` : "";

        // Get the text content
        const textContent = this.textContent.trim(); // capture before clearing

        this.textContent = "";

        template.innerHTML = `
            
            <span class="icon-tag inverted-text-item">
                <span class="${iconClass}">${textContent}</span>
            </span>
        `;

        shadow.adoptedStyleSheets = [sheet];
        shadow.appendChild(template.content.cloneNode(true));
    }
}
