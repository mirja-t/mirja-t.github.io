
export const copyHeadlines = (sections) => {

    sections.forEach((section, idx) => {
        // set invers class
        if(idx % 2 === 1) {
            section.querySelectorAll('h1, h2').forEach(h => h.classList.add('invers'));
        }
    });

    const headlines = document.querySelectorAll('h1, h2');
    headlines.forEach(h => {
        let tagName = h.tagName.toLocaleLowerCase();
        let text = h.innerHTML;
        let style = document.createElement('style');
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
            }
            h1.invers,
            h2.invers {
                color: white;
            }`

        let parent = h.parentNode;
        let container = document.createElement('div');
        container.setAttribute('class', 'shadowHeadline');

        let shadowHl = document.createElement(tagName);
        h.className==='invers' && shadowHl.classList.add('invers');
        shadowHl.innerHTML = text;

        let shadowRoot =  container.attachShadow({mode: 'open'});
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(shadowHl);
        parent.prepend(container);
    });
}
