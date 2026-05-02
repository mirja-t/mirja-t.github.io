// Copy and style headlines with shadow DOM effects
export const copyHeadlines = async () => {
    const shadowHeadlines = [];

    const headlines = document.querySelectorAll("h1, h2");
    headlines.forEach((h) => {
        let tagName = h.tagName.toLocaleLowerCase();

        // Get translated text
        let text = h.textContent; // fallback to original
        let dataI18nKey = h.getAttribute("data-i18n");

        let style = document.createElement("style");
        style.textContent = `
            h1, h2 {
                font-family: 'CamingoDos', 'Fira Sans Condensed', sans-serif;
                font-weight: 700;
                line-height: 1.1;
                margin: 0;
            }
            h1 {
                font-size: calc(2.25em + 1vw);
            }
            h2 {
                font-size: 1.75em;
            }
            @media screen and (min-width: 1680px) {
                h2 {
                    font-size: calc( 2em + 0.5vw );
                }
            }`;

        let parent = h.parentNode;
        let container = document.createElement("div");
        container.setAttribute("class", "shadowHeadline");

        let shadowHl = document.createElement(tagName);
        h.className === "invers" && shadowHl.classList.add("invers");
        shadowHl.setAttribute("data-i18n", dataI18nKey);
        shadowHl.textContent = text;

        let shadowRoot = container.attachShadow({ mode: "open" });
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(shadowHl);
        parent.prepend(container);
        shadowHeadlines.push(shadowHl);
    });
    return shadowHeadlines;
};
