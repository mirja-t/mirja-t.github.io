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
        text: 'creative implementation of complex designs, responsive design, CSS animations'
    },
    js: {
        headline: 'JavaScript',
        text: 'Vanilla JS, ES6, JavaScript plugins, Node.js modules, algotithms'
    },
    react: {
        headline: 'React',
        text: 'webapplications, single page applications, react-spring, Framer Motion'
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

    _reset() {
        window.scroll(0,0);
        this._sectionScrolling('', 'reset');
        this._sections.forEach((section, idx) => {
            this._contentScrolling(section, 'reset');
            this._setInviewClass(idx, 'reset');
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
        window.location.href = '#section-' + nextSectionNumber;
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
            let delta;
            let initTouchY = null;

            if(reset) {
                container.style.height = null;
                content.style.transform = null;
                content.onwheel = null;
                content.ontouchmove = null; // ipad
                document.removeEventListener('mousedown', handleScrollbar);
                const scrollbar = section.querySelector('.scrollbar');
                if(scrollbar) scrollbar.remove();
            }
            else {
                if(overflow > 0) {
                    container.style.height = container.offsetHeight + 'px';
                    createScrollbar();
                    content.onwheel = handleScroll;
                    content.ontouchmove = handleScroll; // ipad
                    document.addEventListener('mousedown', handleScrollbar);
                }  
            }
            
            

            function handleScroll(e) {
                e.preventDefault();

                if(e.type === 'touchmove') {
                    if(!initTouchY) {
                        initTouchY = e.touches[0].pageY * 0.001 + initScrollPos + translateY;
                    }
                    delta = (e.touches[0].pageY * 0.001 - initTouchY) * -1;
                }
                else {
                    delta =  translateY - e.wheelDeltaY * 0.001;
                }
                translateY = Math.min(1, Math.max(0, delta));
                document.ontouchend = () => {
                    initTouchY = null;
                }

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
        window.addEventListener('scroll', () => {
            this._sectionScrolling.bind(this);
        });
        window.addEventListener('resize', this._debounce(() => {
            if(window.innerWidth !== this._windowWidth) this._reset();
        }, 30));
        window.addEventListener('load', () => {
            this.navigate(0);
        });
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
;// CONCATENATED MODULE: ./src/js/parallax.js
function parallax(img, idx) {
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
;// CONCATENATED MODULE: ./node_modules/delegate-it/index.js
/** Keeps track of raw listeners added to the base elements to avoid duplication */
const ledger = new WeakMap();
function editLedger(wanted, baseElement, callback, setup) {
    var _a, _b;
    if (!wanted && !ledger.has(baseElement)) {
        return false;
    }
    const elementMap = (_a = ledger.get(baseElement)) !== null && _a !== void 0 ? _a : new WeakMap();
    ledger.set(baseElement, elementMap);
    if (!wanted && !ledger.has(baseElement)) {
        return false;
    }
    const setups = (_b = elementMap.get(callback)) !== null && _b !== void 0 ? _b : new Set();
    elementMap.set(callback, setups);
    const existed = setups.has(setup);
    if (wanted) {
        setups.add(setup);
    }
    else {
        setups.delete(setup);
    }
    return existed && wanted;
}
function isEventTarget(elements) {
    return typeof elements.addEventListener === 'function';
}
function safeClosest(event, selector) {
    let target = event.target;
    if (target instanceof Text) {
        target = target.parentElement;
    }
    if (target instanceof Element && event.currentTarget instanceof Element) {
        // `.closest()` may match ancestors of `currentTarget` but we only need its children
        const closest = target.closest(selector);
        if (closest && event.currentTarget.contains(closest)) {
            return closest;
        }
    }
}
// This type isn't exported as a declaration, so it needs to be duplicated above
function delegate(base, selector, type, callback, options) {
    // Handle Selector-based usage
    if (typeof base === 'string') {
        base = document.querySelectorAll(base);
    }
    // Handle Array-like based usage
    if (!isEventTarget(base)) {
        const subscriptions = Array.prototype.map.call(base, (element) => delegate(element, selector, type, callback, options));
        return {
            destroy() {
                for (const subscription of subscriptions) {
                    subscription.destroy();
                }
            },
        };
    }
    // `document` should never be the base, it's just an easy way to define "global event listeners"
    const baseElement = base instanceof Document ? base.documentElement : base;
    // Handle the regular Element usage
    const capture = Boolean(typeof options === 'object' ? options.capture : options);
    const listenerFn = (event) => {
        const delegateTarget = safeClosest(event, selector);
        if (delegateTarget) {
            event.delegateTarget = delegateTarget;
            callback.call(baseElement, event);
        }
    };
    // Drop unsupported `once` option https://github.com/fregante/delegate-it/pull/28#discussion_r863467939
    if (typeof options === 'object') {
        delete options.once;
    }
    const setup = JSON.stringify({ selector, type, capture });
    const isAlreadyListening = editLedger(true, baseElement, callback, setup);
    const delegateSubscription = {
        destroy() {
            baseElement.removeEventListener(type, listenerFn, options);
            editLedger(false, baseElement, callback, setup);
        },
    };
    if (!isAlreadyListening) {
        baseElement.addEventListener(type, listenerFn, options);
    }
    return delegateSubscription;
}
/* harmony default export */ const delegate_it = (delegate);

;// CONCATENATED MODULE: ./node_modules/swup/dist/Swup.modern.js
function e(){return e=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(t[i]=n[i])}return t},e.apply(this,arguments)}const n=(t,e)=>String(t).toLowerCase().replace(/[\s/_.]+/g,"-").replace(/[^\w-]+/g,"").replace(/--+/g,"-").replace(/^-+|-+$/g,"")||e||"",i=({hash:t}={})=>location.pathname+location.search+(t?location.hash:""),s=(t,n={})=>{const s=e({url:t=t||i({hash:!0}),random:Math.random(),source:"swup"},n);history.pushState(s,"",t)},o=(t=null,n={})=>{t=t||i({hash:!0});const s=e({},history.state,{url:t,random:Math.random(),source:"swup"},n);history.replaceState(s,"",t)},r=["base"],a=(e,n,i,s={})=>{let{base:o=document}=s,a=function(t,e){if(null==t)return{};var n,i,s={},o=Object.keys(t);for(i=0;i<o.length;i++)e.indexOf(n=o[i])>=0||(s[n]=t[n]);return s}(s,r);const l=delegate_it(o,e,n,i,a);return{destroy:()=>l.destroy()}},l=(t,e=document)=>e.querySelector(t),u=(t,e=document)=>Array.from(e.querySelectorAll(t)),c=t=>{requestAnimationFrame(()=>{requestAnimationFrame(()=>{t()})})},h=t=>window.CSS&&window.CSS.escape?CSS.escape(t):t,d=t=>1e3*Number(t.slice(0,-1).replace(",",".")),p=(t,e)=>{var n,i;let s=document.createElement("html");s.innerHTML=t;let o=[];e.forEach(t=>{if(null==l(t,s))return console.warn(`[swup] Container ${t} not found on page.`),null;u(t).length!==u(t,s).length&&console.warn("[swup] Mismatched number of containers found on new page."),u(t).forEach((e,n)=>{u(t,s)[n].setAttribute("data-swup",String(o.length)),o.push(u(t,s)[n].outerHTML)})});const r=(null==(n=l("title",s))?void 0:n.innerText)||"",a=null==(i=l("body",s))?void 0:i.className;return s.innerHTML="",s=null,{title:r,pageClass:a,blocks:o,originalContent:t}},g=(t,n)=>{const i={url:window.location.pathname+window.location.search,method:"GET",data:null,headers:{}},{url:s,method:o,headers:r,data:a}=e({},i,t),l=new XMLHttpRequest;return l.onreadystatechange=function(){4===l.readyState&&n(l)},l.open(o,s,!0),Object.entries(r).forEach(([t,e])=>{l.setRequestHeader(t,e)}),l.send(a),l};class m extends URL{constructor(t,e=document.baseURI){super(t.toString(),e)}get url(){return this.pathname+this.search}static fromElement(t){const e=t.getAttribute("href")||t.getAttribute("xlink:href");return new m(e)}static fromUrl(t){return new m(t)}}const f=(t,e)=>{let n=0;e.forEach(e=>{null==l(e,t)?console.warn(`[swup] Container ${e} not found on page.`):u(e).forEach((i,s)=>{u(e,t)[s].setAttribute("data-swup",String(n)),n++})})},v=t=>/^to-/.test(t)||["is-changing","is-rendering","is-popstate"].includes(t),w=()=>{const t=document.documentElement.className.split(" ").filter(v);document.documentElement.classList.remove(...t)};class E{constructor(t){this.pages={},this.last=null,this.swup=void 0,this.swup=t}getCacheUrl(t){return this.swup.resolveUrl(m.fromUrl(t).url)}cacheUrl(t){t.url=this.getCacheUrl(t.url),t.url in this.pages==0&&(this.pages[t.url]=t),t.responseURL=this.getCacheUrl(t.responseURL),this.last=this.pages[t.url],this.swup.log(`Cache (${Object.keys(this.pages).length})`,this.pages)}getPage(t){return t=this.getCacheUrl(t),this.pages[t]}getCurrentPage(){return this.getPage(i())}exists(t){return(t=this.getCacheUrl(t))in this.pages}empty(){this.pages={},this.last=null,this.swup.log("Cache cleared")}remove(t){delete this.pages[this.getCacheUrl(t)]}}const P=function({event:t,skipTransition:e}={}){if(e)return this.triggerEvent("transitionEnd",t),this.cleanupAnimationClasses(),[Promise.resolve()];c(()=>{this.triggerEvent("animationInStart"),document.documentElement.classList.remove("is-animating")});const n=this.getAnimationPromises("in");return Promise.all(n).then(()=>{this.triggerEvent("animationInDone"),this.triggerEvent("transitionEnd",t),this.cleanupAnimationClasses()}),n},S=t=>t?("#"===t.charAt(0)&&(t=t.substring(1)),t=decodeURIComponent(t),t=h(t),l(`#${t}`)||l(`a[name='${t}']`)):null;let b="transition",k="transitionend",U="animation",y="animationend";function L(t){const e=this.options.animationSelector;if(!1===e)return[Promise.resolve()];const n=u(e,document.body);return n.length?n.map(t=>function(t,e,n=null){const{type:i,timeout:s,propCount:o}=function(t,e=null){const n=window.getComputedStyle(t),i=`${b}Duration`,s=`${U}Delay`,o=`${U}Duration`,r=n[`${b}Delay`].split(", "),a=(n[i]||"").split(", "),l=C(r,a),u=(n[s]||"").split(", "),c=(n[o]||"").split(", "),h=C(u,c);let d="",p=0,g=0;return"transition"===e?l>0&&(d="transition",p=l,g=a.length):"animation"===e?h>0&&(d="animation",p=h,g=c.length):(p=Math.max(l,h),d=p>0?l>h?"transition":"animation":null,g=d?"transition"===d?a.length:c.length:0),{type:d,timeout:p,propCount:g}}(t,n);return i&&s?new Promise(e=>{const n="transition"===i?k:y,r=performance.now();let a=0;const l=()=>{t.removeEventListener(n,u),e()},u=e=>{if(e.target===t){if(!(t=>!!t.elapsedTime)(e))throw new Error("Not a transition or animation event.");(performance.now()-r)/1e3<e.elapsedTime||++a>=o&&l()}};setTimeout(()=>{a<o&&l()},s+1),t.addEventListener(n,u)}):(console.warn(`[swup] No CSS transition duration defined for element of selector ${e}`),Promise.resolve())}(t,e)):(console.warn(`[swup] No animated elements found by selector ${e}`),[Promise.resolve()])}function C(t,e){for(;t.length<e.length;)t=t.concat(t);return Math.max(...e.map((e,n)=>d(e)+d(t[n])))}void 0===window.ontransitionend&&void 0!==window.onwebkittransitionend&&(b="WebkitTransition",k="webkitTransitionEnd"),void 0===window.onanimationend&&void 0!==window.onwebkitanimationend&&(U="WebkitAnimation",y="webkitAnimationEnd");const T=function(t){const n=p(t.responseText,this.options.containers);return n?e({},n,{responseURL:t.responseURL||window.location.href}):(console.warn("[swup] Received page is invalid."),null)};function H(t){const n=this.options.requestHeaders,{url:i}=t;return this.cache.exists(i)?(this.triggerEvent("pageRetrievedFromCache"),Promise.resolve(this.cache.getPage(i))):new Promise((s,o)=>{g(e({},t,{headers:n}),t=>{if(500===t.status)return this.triggerEvent("serverError"),void o(i);const n=this.getPageData(t);if(!n||!n.blocks.length)return void o(i);const r=e({},n,{url:i});this.cache.cacheUrl(r),this.triggerEvent("pageLoaded"),s(r)})})}const R=function({event:t,skipTransition:e}={}){const n=t instanceof PopStateEvent;if(e)return this.triggerEvent("animationSkipped"),[Promise.resolve()];this.triggerEvent("animationOutStart"),document.documentElement.classList.add("is-changing","is-leaving","is-animating"),n&&document.documentElement.classList.add("is-popstate");const i=this.getAnimationPromises("out");return Promise.all(i).then(()=>{this.triggerEvent("animationOutDone")}),i};function A(t){const{url:e}=t;this.shouldIgnoreVisit(e)?window.location.href=e:this.performPageLoad(t)}function $(t){const{url:e,event:o,customTransition:r}=null!=t?t:{},a=o instanceof PopStateEvent,l=this.shouldSkipTransition({url:e,event:o});this.triggerEvent("transitionStart",o),this.updateTransition(i(),e,r),null!=r&&document.documentElement.classList.add(`to-${n(r)}`);const u=this.leavePage({event:o,skipTransition:l});a||s(e+(this.scrollToElement||"")),this.currentPageUrl=i();const c=this.fetchPage(t);Promise.all([c,...u]).then(([t])=>{this.renderPage(t,{event:o,skipTransition:l})}).catch(t=>{void 0!==t&&(this.options.skipPopStateHandling=()=>(window.location=t,!0),history.go(-1))})}const _=function({blocks:t,title:e}){return t.forEach((t,e)=>{document.body.querySelector(`[data-swup="${e}"]`).outerHTML=t}),document.title=e,Promise.resolve()};function O(t,e){const n=this._handlers[t];n?n.push(e):console.warn(`Unsupported event ${t}.`)}function x(t,e){if(t&&e){const n=this._handlers[t];n.includes(e)?this._handlers[t]=n.filter(t=>t!==e):console.warn(`Handler for event '${t}' not found.`)}else t?this._handlers[t]=[]:Object.keys(this._handlers).forEach(t=>{this._handlers[t]=[]})}function q(t,e){this._handlers[t].forEach(t=>{try{t(e)}catch(t){console.error(t)}});const n=new CustomEvent(`swup:${t}`,{detail:t});document.dispatchEvent(n)}const D=function(t){var e;if(null==(e=t)?void 0:e.isSwupPlugin){if(t.swup=this,!t._checkRequirements||t._checkRequirements())return t._beforeMount&&t._beforeMount(),t.mount(),this.plugins.push(t),this.plugins}else console.error("Not a swup plugin instance",t)};function I(t){const e=this.findPlugin(t);if(e)return e.unmount(),e._afterUnmount&&e._afterUnmount(),this.plugins=this.plugins.filter(t=>t!==e),this.plugins;console.error("No such plugin",e)}function M(t){return this.plugins.find(e=>e===t||e.name===t)}const N=function(t,{event:n,skipTransition:s}={}){if(document.documentElement.classList.remove("is-leaving"),!this.isSameResolvedUrl(i(),t.url))return;const{url:r}=m.fromUrl(t.responseURL);this.isSameResolvedUrl(i(),r)||(this.cache.cacheUrl(e({},t,{url:r})),this.currentPageUrl=i(),o(r)),s||document.documentElement.classList.add("is-rendering"),this.triggerEvent("willReplaceContent",n),this.replaceContent(t).then(()=>{this.triggerEvent("contentReplaced",n),this.triggerEvent("pageView",n),this.options.cache||this.cache.empty(),this.enterPage({event:n,skipTransition:s}),this.scrollToElement=null})};function W(t,e,n){this.transition={from:t,to:e,custom:n}}function V({event:t}){return!(!(t instanceof PopStateEvent)||this.options.animateHistoryBrowsing)}class j{constructor(t={}){this.version="3.0.4",this._handlers={animationInDone:[],animationInStart:[],animationOutDone:[],animationOutStart:[],animationSkipped:[],clickLink:[],contentReplaced:[],disabled:[],enabled:[],openPageInNewTab:[],pageLoaded:[],pageRetrievedFromCache:[],pageView:[],popState:[],samePage:[],samePageWithHash:[],serverError:[],transitionStart:[],transitionEnd:[],willReplaceContent:[]},this.scrollToElement=null,this.options=void 0,this.plugins=[],this.transition={},this.cache=void 0,this.currentPageUrl=i(),this.delegatedListeners={},this.boundPopStateHandler=void 0,this.loadPage=A,this.performPageLoad=$,this.leavePage=R,this.renderPage=N,this.replaceContent=_,this.enterPage=P,this.triggerEvent=q,this.delegateEvent=a,this.on=O,this.off=x,this.updateTransition=W,this.shouldSkipTransition=V,this.getAnimationPromises=L,this.getPageData=T,this.fetchPage=H,this.getAnchorElement=S,this.log=()=>{},this.use=D,this.unuse=I,this.findPlugin=M,this.getCurrentUrl=i,this.cleanupAnimationClasses=w,this.defaults={animateHistoryBrowsing:!1,animationSelector:'[class*="transition-"]',cache:!0,containers:["#swup"],ignoreVisit:(t,{el:e}={})=>!(null==e||!e.closest("[data-no-swup]")),linkSelector:"a[href]",plugins:[],resolveUrl:t=>t,requestHeaders:{"X-Requested-With":"swup",Accept:"text/html, application/xhtml+xml"},skipPopStateHandling:t=>{var e;return"swup"!==(null==(e=t.state)?void 0:e.source)}},this.options=e({},this.defaults,t),this.boundPopStateHandler=this.popStateHandler.bind(this),this.cache=new E(this),this.enable()}enable(){"undefined"!=typeof Promise?(this.delegatedListeners.click=a(this.options.linkSelector,"click",this.linkClickHandler.bind(this)),window.addEventListener("popstate",this.boundPopStateHandler),f(document.documentElement,this.options.containers),this.options.plugins.forEach(t=>this.use(t)),o(),this.triggerEvent("enabled"),document.documentElement.classList.add("swup-enabled"),this.triggerEvent("pageView")):console.warn("Promise is not supported")}destroy(){this.delegatedListeners.click.destroy(),window.removeEventListener("popstate",this.boundPopStateHandler),this.cache.empty(),this.options.plugins.forEach(t=>{this.unuse(t)}),u("[data-swup]").forEach(t=>{t.removeAttribute("data-swup")}),this.off(),this.triggerEvent("disabled"),document.documentElement.classList.remove("swup-enabled")}shouldIgnoreVisit(t,{el:e}={}){const{origin:n,url:i,hash:s}=m.fromUrl(t);return n!==window.location.origin||!(!e||!this.triggerWillOpenNewWindow(e))||!!this.options.ignoreVisit(i+s,{el:e})}linkClickHandler(t){const e=t.delegateTarget,{href:n,url:s,hash:o}=m.fromElement(e);if(this.shouldIgnoreVisit(n,{el:e}))return;if(t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return void this.triggerEvent("openPageInNewTab",t);if(0!==t.button)return;if(this.triggerEvent("clickLink",t),t.preventDefault(),!s||s===i())return void this.handleLinkToSamePage(s,o,t);if(this.isSameResolvedUrl(s,i()))return;this.scrollToElement=o||null;const r=e.getAttribute("data-swup-transition")||void 0;this.performPageLoad({url:s,customTransition:r})}handleLinkToSamePage(t,e,n){if(e){if(this.triggerEvent("samePageWithHash",n),!S(e))return console.warn(`Element for offset not found (#${e})`);o(t+e)}else this.triggerEvent("samePage",n)}triggerWillOpenNewWindow(t){return!!t.matches('[download], [target="_blank"]')}popStateHandler(t){var e,n;if(this.options.skipPopStateHandling(t))return;if(this.isSameResolvedUrl(i(),this.currentPageUrl))return;const s=null!=(e=null==(n=t.state)?void 0:n.url)?e:location.href;if(this.shouldIgnoreVisit(s))return;const{url:o,hash:r}=m.fromUrl(s);r?this.scrollToElement=r:t.preventDefault(),this.triggerEvent("popState",t),this.options.animateHistoryBrowsing||(document.documentElement.classList.remove("is-animating"),w()),this.performPageLoad({url:o,event:t})}resolveUrl(t){if("function"!=typeof this.options.resolveUrl)return console.warn("[swup] options.resolveUrl expects a callback function."),t;const e=this.options.resolveUrl(t);return e&&"string"==typeof e?e.startsWith("//")||e.startsWith("http")?(console.warn("[swup] options.resolveUrl needs to return a relative url"),t):e:(console.warn("[swup] options.resolveUrl needs to return a url"),t)}isSameResolvedUrl(t,e){return this.resolveUrl(t)===this.resolveUrl(e)}}
//# sourceMappingURL=Swup.modern.js.map

;// CONCATENATED MODULE: ./src/js/app.js













function init() {
    const svgChart = document.getElementById('svgchart');
    const cardlinksWrapper = document.querySelectorAll('.card-links');
    const footerlinks = document.querySelectorAll('footer li.icon');
    const scrollElements = document.querySelectorAll('.project-details .content');
    const contactbuttonwrapper = document.getElementById('contactbutton');
    const sections = document.querySelectorAll('#fullpage .section');
    const stickyContainer = document.querySelectorAll('.sticky-container');
    const logo = document.getElementById('logowrapper');

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

    if(stickyContainer) {
        stickyContainer.forEach(elmnt => stickyElement(elmnt));
    }
    if(logo) {
        hoverAnimation(logo, 10);
    }
}
init();

function initFullpage() {
    const logo = document.getElementById('logowrapper');
    const fpwrapper = document.getElementById('fullpagewrapper');
    const fp = document.getElementById('fullpage');
    const nav = document.querySelector('nav#nav ul');

    const config = {
        breakpoint: 991,
        onSectionChange: [resetChart]
    }
    const fullpage = new Fullpage(fpwrapper, fp, nav, config);
    
    if(logo) {
        logo.addEventListener('click', () => fullpage.navigate(0));
    }
    
    return fullpage;
}

if(document.getElementById('fullpagewrapper')) initFullpage();

function resetChart(sectionNumber) {
    if(sectionNumber === 1) {
        document.querySelectorAll('.chart-details').forEach(el => el.remove());
    }
}

const swupContainer = document.getElementById('swup');
const swup = swupContainer ? new j() : null;

document.addEventListener('swup:contentReplaced', (event) => {
    init();
    window.scrollTo(0,0);
    const fpwrapper = document.getElementById('fullpagewrapper');
    if(fpwrapper) {
        const targetSection = location.href.match(/#section-[0-9]+/g);
        let sectionNumber = targetSection[0] && targetSection[0].match(/[0-9]+/)[0];
        const fullpage = initFullpage();
        if(sectionNumber) fullpage.navigate(sectionNumber);
    }
});

document.addEventListener('swup:transitionEnd', (event) => {
    const parallaxImages = document.querySelectorAll('.js-parallax');
    if(parallaxImages.length) {
        parallaxImages.forEach((img, idx) => parallax(img, idx));
    }
});

/******/ })()
;