/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/headlines.js

const copyHeadlines = (sections) => {

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

;// CONCATENATED MODULE: ./src/js/chartData.js
const detailsDe = {
    xd: {
        headline: 'Adobe XD',
        text: 'Wireframing, Prototyping, Navigationskonzepte, Animationskonzepte, UI Design'
    },
    css: {
        headline: 'CSS3',
        text: 'kreative Umsetzung komplexer Designs, responsive Design, CSS-Animationen'
    },
    js: {
        headline: 'JavaScript',
        text: 'Vanilla JS, ES6, JavaScript PlugIns, Node.js Module, Algorithmen'
    },
    react: {
        headline: 'React',
        text: 'Webapplikationen, Single Page Applications, react-spring, Framer Motion'
    },
    sass: {
        headline: 'Sass',
        text: 'generischer Code, Funktionen, Mixins, Maps'
    },
    html: {
        headline: 'Headline',
        text: 'HTML5, semantisch, barrierearm'
    },
    ae: {
        headline: 'After Effects',
        text: 'Lottie Animationen, Hintergrund-Videos, basic Video-Editing'
    },
    ai: {
        headline: 'Illustrator',
        text: 'Logo- und Icondesign, Infografiken, Illustrationen'
    },
    ps: {
        headline: 'Photoshop',
        text: 'Bildbearbeitung, Hintergrundgrafiken, Photomontagen'
    },
    php: {
        headline: 'PHP',
        text: 'Grundkenntnisse'
    },
    mysql: {
        headline: 'MySQL',
        text: 'Grundkenntnisse'
    }
}
const detailsEn = {
    xd: {
        headline: 'Adobe XD',
        text: 'Wireframing, prototyping, navigation concepts, animation concepts, UI design'
    },
    css: {
        headline: 'CSS3',
        text: 'creative Implementation of complex designs, responsive design, CSS-animations'
    },
    js: {
        headline: 'JavaScript',
        text: 'Vanilla JS, ES6, JavaScript plugins, Node.js modules, algotithms'
    },
    react: {
        headline: 'React',
        text: 'webapllications, Single Page Applications, react-spring, Framer Motion'
    },
    sass: {
        headline: 'Sass',
        text: 'generic code, functions, mixins, maps'
    },
    html: {
        headline: 'Headline',
        text: 'HTML5, semantic, accessible'
    },
    ae: {
        headline: 'After Effects',
        text: 'Lottie animations, background videos, basic video-editing'
    },
    ai: {
        headline: 'Illustrator',
        text: 'Logo design and icon design, infographics, illustrations'
    },
    ps: {
        headline: 'Photoshop',
        text: 'image editing, background images, photomontages'
    },
    php: {
        headline: 'PHP',
        text: 'basic knowledge'
    },
    mysql: {
        headline: 'MySQL',
        text: 'basic knowledge'
    }
}
;// CONCATENATED MODULE: ./src/js/chart.js


const interactiveChart = function(svgChart) {

    const details = detailsEn;

    const svgScale = svgChart.getBoundingClientRect().width / svgChart.width.animVal.value;
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


;// CONCATENATED MODULE: ./src/js/fullpage.js
class Fullpage {
    constructor(wrapper, element, nav, config) {
        this._wrapper = wrapper || null;
        this._navElements = nav ? Array.from(nav.children) : null;
        this._breakpoint = config?.breakpoint || 0;
        this._onSectionChangeCallback = config?.onSectionChange || null;
        this._sections = Array.from(element.children);
        this._currentSectionNumber = 0;
        this._fullpageLayout = false;
        this._windowWidth = null;
        this._lastScrollPos = 0;
        this._scrollDirection = null;
        this._addEventListener();
        this._init();
    }

    _init() {
        this._fullpageLayout = this._getViewportSize();
        this._sections.forEach(section => {
            section.style.height = this._fullpageLayout ? window.innerHeight + 'px' : 'auto';
        });
        this._fullpageLayout ? this._wrapper.classList.add('fullpage') : this._wrapper.classList.remove('fullpage');
        this._setSectionActive(this._currentSectionNumber);
        this._windowWidth = window.innerWidth;
    }

    _resize() {
        if(window.innerWidth === this._windowWidth) return;
        
        this._sectionScrolling('', 'reset');
        this._sections.forEach((section, idx) => {
            this._contentScrolling(section, 'reset');
            this._setInviewClass(idx, 'reset')
        });
        this._init();
    }

    _getViewportSize() {
        return window.matchMedia(`(min-width: ${this._breakpoint}px)`).matches;
    }

    _getSectionNumber(str) {
        if(str==='logowrapper') return 0;
        return parseInt(str.match(/[0-9]+/)[0]);
    }
    
    _setScrollDirection() {
        this._scrollDirection = this._lastScrollPos < window.scrollY ? 'down' : 'up';
        this._lastScrollPos = window.scrollY;
    }

    _setInviewClass(sectionNumber, reset=false) {
        const contentElements = this._sections[sectionNumber].querySelectorAll('.content');
        if(contentElements) {
            contentElements.forEach(element => {
                reset ? element.classList.remove("inview") : element.classList.add("inview");
            });
        }
    }

    _setSectionClass(prev, next) {
        this._wrapper.classList.remove(`section-${prev}`);
        this._wrapper.classList.add(`section-${next}`);
        this._setDirectionClass(prev, next);
    }

    _setDirectionClass(prev, next) {
        const dir = prev > next ? 'up' : 'down';
        this._wrapper.classList.remove(`up`);
        this._wrapper.classList.remove(`down`);
        this._wrapper.classList.add(dir);
    }

    _setNavActive(nextSectionNumber) {
        this._navElements.forEach((el, idx) => {
            nextSectionNumber === idx ? el.classList.add('active') : el.classList.remove('active');
        });
    }

    _setSectionActive(nextSectionNumber) {
        this._sections.forEach((section, idx) => {
            nextSectionNumber === idx ? section.classList.add('active') : section.classList.remove('active');
        });
        this._setSectionClass(this._currentSectionNumber, nextSectionNumber);
        this._setDirectionClass(this._currentSectionNumber, nextSectionNumber);
        this._setNavActive(nextSectionNumber);
        this._currentSectionNumber = nextSectionNumber;

        // onSectionChange callback
        if(this._onSectionChangeCallback) {
            this._onSectionChangeCallback.forEach(fn => fn(this._currentSectionNumber));
        }
    }

    _leavesViewport(el) {
        const rect = el.getBoundingClientRect();
        return this._scrollDirection==="down" ? rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) : rect.top >= 0;
    }

    // event listener scroll
    _sectionScrolling(e, reset=false) {
        this._debounce(this._setScrollDirection(), 500);
        if(reset) {
            this._scrollToSection(0);
            window.scrollTo(0, 0);
            this._setSectionActive(0);
            // move sections
            this._sections.forEach(section => {
                section.style.transform = `translateY(0px)`;
            });
        }
        else if(!this._fullpageLayout) {
            let leaving = this._leavesViewport(this._sections[this._currentSectionNumber]);
            if(leaving) {
                let nextSectionNumber = this._scrollDirection==='down' ? Math.min(this._sections.length-1, this._currentSectionNumber+1) : Math.max(0, this._currentSectionNumber-1);
                this._setSectionActive(nextSectionNumber);
                
                // add inview class to content
                this._sections.forEach((_, idx) => {
                    this._setInviewClass(idx, nextSectionNumber !== idx);
                });
            }

            // add last-section class to main el if last section is active
            this._currentSectionNumber === this._sections.length-1 ? this._wrapper.classList.add('last-section') : this._wrapper.classList.remove('last-section');
        }
    }

    _contentScrolling(section, reset=false) {
        const container = section.querySelector('.js-scrollcontainer');
        if(container) {
            const content = container.querySelector('.content');
            if(!content) return;
            const overflow = content.offsetHeight - container.offsetHeight;
            const scrollbarTranslationRange = container.offsetHeight-container.offsetHeight*(container.offsetHeight / content.offsetHeight);
            let scrollHandle = null;
            let translateY = 0;
            let initScrollPos = 0;
            let scrollbarPos = 0;

            if(reset) {
                container.style.height = null;
                content.style.transform = null;
                content.onwheel = null;
                document.removeEventListener('mousedown', handleScrollbar);
                const scrollbar = section.querySelector('.scrollbar');
                if(scrollbar) scrollbar.remove();
            }
            else {
                if(overflow > 0) {
                    container.style.height = container.offsetHeight + 'px';
                    createScrollbar();
                    content.onwheel = handleScroll;
                    document.addEventListener('mousedown', handleScrollbar);
                }  
            }
            
            function handleScroll(e) {
                e.preventDefault();
                translateY = Math.min(1, Math.max(0, translateY - e.wheelDeltaY * 0.1 / 100));
                scrollSectionContent(content, translateY);
                moveScrollbar(scrollHandle, translateY);
            }  

            function handleScrollbar(e) {
                initScrollPos = e.clientY - scrollbarPos;
                scrollHandle.classList.add('dragging');
                document.onmousemove = function(event){
                    scrollbarPos = Math.max(0, Math.min(1, ((event.clientY - initScrollPos) / scrollbarTranslationRange) + translateY));
                    moveScrollbar(scrollHandle, scrollbarPos)
                    scrollSectionContent(content, scrollbarPos);
                };
                document.onmouseup = function(event) {
                    // stop moving when mouse button is released:
                    scrollHandle.classList.remove('dragging');
                    translateY = scrollbarPos;
                    document.onmouseup = null;
                    document.onmousemove = null;
                };
            } 

            function createScrollbar() {
                const scrollbarContainer = document.createElement('div');
                const scrollbarHandle = document.createElement('div');
                scrollbarContainer.classList.add('scrollbar');
                scrollbarHandle.classList.add('scrollbar-handle');
                scrollbarHandle.style.height = container.offsetHeight / content.offsetHeight * 100 + '%';
                container.append(scrollbarContainer);
                scrollbarContainer.append(scrollbarHandle);
                scrollHandle = scrollbarHandle;
            }

            // scrollbar position on scroll
            function moveScrollbar(el, progress) {
                el.style.transform = `translateY(${progress*(container.offsetHeight-el.offsetHeight)}px)`;
            }

            // inner section scrolling
            function scrollSectionContent(el, progress) {            
                el.style.transform = `translateY(${-progress * overflow}px)`;
            }  
        }     
    }

    _scrollToSection(sectionnumber, behavior='smooth') {

        location.href = "#section-" + sectionnumber;
        const getHeight = arr => arr.reduce((acc, el) => acc + el.offsetHeight, 0);
        const min = Math.min(this._currentSectionNumber, sectionnumber);
        const max = Math.max(this._currentSectionNumber, sectionnumber);
        const scrollHeight = getHeight(this._sections.slice(min, max));
        const startPos = window.scrollY + (getHeight(this._sections.slice(0, this._currentSectionNumber)) - window.scrollY);

        window.scrollTo({
            top: Math.sign( sectionnumber - this._currentSectionNumber ) * scrollHeight + startPos + 1,
            behavior: behavior
        });
    }

    _handleNavigation({currentTarget}) {
        if(!currentTarget.id) return;
        const nextSectionNumber = this._getSectionNumber(currentTarget.id);
        this.navigate(nextSectionNumber);
    }

    _debounce(func, timeout = 300){
        let timer;
        return (...args) => {
          clearTimeout(timer);
          if(!func) return;
          timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    _addEventListener() {
        this._navElements.forEach(el => el.addEventListener('click', this._handleNavigation.bind(this)));
        window.addEventListener('scroll', this._sectionScrolling.bind(this));
        window.addEventListener('resize', this._debounce(() => {
            this._resize();
        }, 30));
    }

    navigate(nextSectionNumber) {
        nextSectionNumber = Number(nextSectionNumber);
        const prevsectionumber = this._currentSectionNumber;

        // if fullpage layout
        if(this._fullpageLayout) {            
            this._sections.forEach((section, idx) => {
                // move sections
                section.style.transform = `translateY(-${nextSectionNumber * window.innerHeight}px)`;
                // move section content
                this._contentScrolling(section, nextSectionNumber !== idx);
            });
        }
        else{
            this._scrollToSection(nextSectionNumber);
        }
        this._setDirectionClass(prevsectionumber, nextSectionNumber);

        // add last-section class to main el if last section is active
        nextSectionNumber === this._sections.length-1 ? this._wrapper.classList.add('last-section') : this._wrapper.classList.remove('last-section');

        // add active class to section
        this._setSectionActive(nextSectionNumber);

        // add inview class to content
        this._sections.forEach((_, idx) => {
            this._setInviewClass(idx, nextSectionNumber !== idx);
        });
    }
}
;// CONCATENATED MODULE: ./src/js/hoverAnimation.js
const hoverAnimation = (wrapper, dist=20) => {

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
;// CONCATENATED MODULE: ./src/js/addSectionCountClass.js
const addSectionCountClass = main => {
    const sections = main.querySelectorAll('section.section');
    sections.length % 2 === 0 ? main.classList.add('even') : main.classList.add('odd');
}
;// CONCATENATED MODULE: ./src/js/scrollSpy.js
const scrollSpy = (el) => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            entry.target.classList.toggle("inview", entry.isIntersecting);
        });
    });
    observer.observe(el)
}
;// CONCATENATED MODULE: ./src/js/shrinkLogoOnScroll.js
const shrinkLogoOnScroll = function() {
  const logoWrapperProject = document.querySelector('#logowrapper');

  const shrinkLogo = function() {
      if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        logoWrapperProject.classList.add('small');
      } else {
        logoWrapperProject.classList.remove('small');
      }
  }
  if(logoWrapperProject) {
      document.addEventListener('wheel', shrinkLogo);
  }
}
;// CONCATENATED MODULE: ./src/js/generateButton.js
const generateButton = function(wrapper) {
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
;// CONCATENATED MODULE: ./src/js/utils.js
function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      if(!func) return;
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}
;// CONCATENATED MODULE: ./src/js/stickyElement.js


function stickyElement(container) {
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
;// CONCATENATED MODULE: ./src/js/app.js










function init() {
    const svgChart = document.getElementById('svgchart');
    const cardlinksWrapper = document.querySelectorAll('.card-links');
    const logo = document.getElementById('logowrapper');
    const footerlinks = document.querySelectorAll('footer li.icon');
    const scrollElements = document.querySelectorAll('.project-details .content');
    const contactbuttonwrapper = document.getElementById('contactbutton');
    const sections = document.querySelectorAll('#fullpage .section');
    const stickyContainer = document.querySelectorAll('.sticky-container');

    if(svgChart) interactiveChart(svgChart);
    if(sections.length) copyHeadlines(sections);
    if(cardlinksWrapper.length) cardlinksWrapper.forEach(cardlinks => hoverAnimation(cardlinks, 20));
    if(footerlinks.length) footerlinks.forEach(footerlink => hoverAnimation(footerlink, 20));

    shrinkLogoOnScroll();
    if(scrollElements.length) {
        scrollElements.forEach(el => {
            window.addEventListener('scroll', function() { scrollSpy(el) });
        });
    }

    if(contactbuttonwrapper) {
        generateButton(contactbuttonwrapper);
    }

    const contentwrapper = document.querySelector('.content-wrapper:not(#fullpagewrapper)');
    if(contentwrapper) addSectionCountClass(contentwrapper);
    
    
    const fpwrapper = document.getElementById('fullpagewrapper');
    const fp = document.getElementById('fullpage');
    const nav = document.querySelector('nav#nav ul');

    const config = {
        breakpoint: 991,
        onSectionChange: [resetChart]
    }
    const fullpage = new Fullpage(fpwrapper, fp, nav, config);

    if(logo) {
        hoverAnimation(logo, 10);
        document.getElementById('logowrapper').addEventListener('click', () => fullpage.navigate(0));
    }

    if(fpwrapper) {
        const targetSection = location.href.match(/#section-[0-9]+/g);
        let sectionNumber = targetSection[0] && targetSection[0].match(/[0-9]+/)[0];
        if(sectionNumber) fullpage.navigate(sectionNumber);
    }

    if(stickyContainer) {
        stickyContainer.forEach(elmnt => stickyElement(elmnt));
    }
}

init();

function resetChart(sectionNumber) {
    if(sectionNumber === 1) {
        document.querySelectorAll('.chart-details').forEach(el => el.remove());
    }
}

/******/ })()
;