export class Fullpage {
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
        this._sections.forEach((section) => {
            section.style.height = this._fullpageLayout
                ? window.innerHeight + "px"
                : "auto";
        });
        this._fullpageLayout
            ? this._wrapper.classList.add("fullpage")
            : this._wrapper.classList.remove("fullpage");
        this._setSectionActive(this._currentSectionNumber);
        this._windowWidth = window.innerWidth;
    }

    _reset() {
        window.scroll(0, 0);
        this._sectionScrolling("", "reset");
        this._sections.forEach((section, idx) => {
            this._contentScrolling(section, "reset");
            this._setInviewClass(idx, "reset");
        });
        this._init();
    }

    _getViewportSize() {
        return window.matchMedia(`(min-width: ${this._breakpoint}px)`).matches;
    }

    _getSectionNumber(str) {
        if (str === "logowrapper") return 0;
        return parseInt(str.match(/[0-9]+/)[0]);
    }

    _setScrollDirection() {
        this._scrollDirection =
            this._lastScrollPos < window.scrollY ? "down" : "up";
        this._lastScrollPos = window.scrollY;
    }

    _setInviewClass(sectionNumber, reset = false) {
        const contentElements =
            this._sections[sectionNumber].querySelectorAll(".content");
        if (contentElements) {
            contentElements.forEach((element) => {
                reset
                    ? element.classList.remove("inview")
                    : element.classList.add("inview");
            });
        }
    }

    _setSectionClass(prev, next) {
        this._wrapper.classList.remove(`section-${prev}`);
        this._wrapper.classList.add(`section-${next}`);
        this._setDirectionClass(prev, next);
    }

    _setDirectionClass(prev, next) {
        const dir = prev > next ? "up" : "down";
        this._wrapper.classList.remove(`up`);
        this._wrapper.classList.remove(`down`);
        this._wrapper.classList.add(dir);
    }

    _setNavActive(nextSectionNumber) {
        this._navElements.forEach((el, idx) => {
            nextSectionNumber === idx
                ? el.classList.add("active")
                : el.classList.remove("active");
        });
    }

    _setSectionActive(nextSectionNumber) {
        window.location.href = "#section-" + nextSectionNumber;
        this._sections.forEach((section, idx) => {
            nextSectionNumber === idx
                ? section.classList.add("active")
                : section.classList.remove("active");
        });
        this._setSectionClass(this._currentSectionNumber, nextSectionNumber);
        this._setDirectionClass(this._currentSectionNumber, nextSectionNumber);
        this._setNavActive(nextSectionNumber);
        this._currentSectionNumber = nextSectionNumber;

        // onSectionChange callback
        if (this._onSectionChangeCallback) {
            this._onSectionChangeCallback.forEach((fn) =>
                fn(this._currentSectionNumber)
            );
        }
    }

    _leavesViewport(el) {
        const rect = el.getBoundingClientRect();
        return this._scrollDirection === "down"
            ? rect.bottom <=
                  (window.innerHeight || document.documentElement.clientHeight)
            : rect.top >= 0;
    }

    // event listener scroll
    _sectionScrolling(e, reset = false) {
        this._debounce(this._setScrollDirection(), 500);
        if (reset) {
            this._scrollToSection(0);
            window.scrollTo(0, 0);
            this._setSectionActive(0);
            // move sections
            this._sections.forEach((section) => {
                section.style.transform = `translateY(0px)`;
            });
        } else if (!this._fullpageLayout) {
            let leaving = this._leavesViewport(
                this._sections[this._currentSectionNumber]
            );
            if (leaving) {
                let nextSectionNumber =
                    this._scrollDirection === "down"
                        ? Math.min(
                              this._sections.length - 1,
                              this._currentSectionNumber + 1
                          )
                        : Math.max(0, this._currentSectionNumber - 1);
                this._setSectionActive(nextSectionNumber);

                // add inview class to content
                this._sections.forEach((_, idx) => {
                    this._setInviewClass(idx, nextSectionNumber !== idx);
                });
            }

            // add last-section class to main el if last section is active
            this._currentSectionNumber === this._sections.length - 1
                ? this._wrapper.classList.add("last-section")
                : this._wrapper.classList.remove("last-section");
        }
    }

    _contentScrolling(section, reset = false) {
        const container = section.querySelector(".js-scrollcontainer");
        if (container) {
            const content = container.querySelector(".content");
            if (!content) return;
            const overflow = content.offsetHeight - container.offsetHeight;
            const scrollbarTranslationRange =
                container.offsetHeight -
                container.offsetHeight *
                    (container.offsetHeight / content.offsetHeight);
            let scrollHandle = null;
            let translateY = 0;
            let initScrollPos = 0;
            let scrollbarPos = 0;
            let delta;
            let initTouchY = null;

            if (reset) {
                container.style.height = null;
                content.style.transform = null;
                content.onwheel = null;
                content.ontouchmove = null; // ipad
                document.removeEventListener("mousedown", handleScrollbar);
                const scrollbar = section.querySelector(".scrollbar");
                if (scrollbar) scrollbar.remove();
            } else {
                if (overflow > 0) {
                    container.style.height = container.offsetHeight + "px";
                    createScrollbar();
                    content.onwheel = handleScroll;
                    content.ontouchmove = handleScroll; // ipad
                    document.addEventListener("mousedown", handleScrollbar);
                }
            }

            function handleScroll(e) {
                e.preventDefault();

                if (e.type === "touchmove") {
                    if (!initTouchY) {
                        initTouchY =
                            e.touches[0].pageY * 0.001 +
                            initScrollPos +
                            translateY;
                    }
                    delta = (e.touches[0].pageY * 0.001 - initTouchY) * -1;
                } else {
                    delta = translateY - e.wheelDeltaY * 0.001;
                }
                translateY = Math.min(1, Math.max(0, delta));
                document.ontouchend = () => {
                    initTouchY = null;
                };

                scrollSectionContent(content, translateY);
                moveScrollbar(scrollHandle, translateY);
            }

            function handleScrollbar(e) {
                initScrollPos = e.clientY - scrollbarPos;
                scrollHandle.classList.add("dragging");
                document.onmousemove = function (event) {
                    scrollbarPos = Math.max(
                        0,
                        Math.min(
                            1,
                            (event.clientY - initScrollPos) /
                                scrollbarTranslationRange +
                                translateY
                        )
                    );
                    moveScrollbar(scrollHandle, scrollbarPos);
                    scrollSectionContent(content, scrollbarPos);
                };
                document.onmouseup = function (event) {
                    // stop moving when mouse button is released:
                    scrollHandle.classList.remove("dragging");
                    translateY = scrollbarPos;
                    document.onmouseup = null;
                    document.onmousemove = null;
                };
            }

            function createScrollbar() {
                const scrollbarContainer = document.createElement("div");
                const scrollbarHandle = document.createElement("div");
                scrollbarContainer.classList.add("scrollbar");
                scrollbarHandle.classList.add("scrollbar-handle");
                scrollbarHandle.style.height =
                    (container.offsetHeight / content.offsetHeight) * 100 + "%";
                container.append(scrollbarContainer);
                scrollbarContainer.append(scrollbarHandle);
                scrollHandle = scrollbarHandle;
            }

            // scrollbar position on scroll
            function moveScrollbar(el, progress) {
                el.style.transform = `translateY(${
                    progress * (container.offsetHeight - el.offsetHeight)
                }px)`;
            }

            // inner section scrolling
            function scrollSectionContent(el, progress) {
                el.style.transform = `translateY(${-progress * overflow}px)`;
            }
        }
    }

    _scrollToSection(sectionnumber, behavior = "smooth") {
        location.href = "#section-" + sectionnumber;
        const getHeight = (arr) =>
            arr.reduce((acc, el) => acc + el.offsetHeight, 0);
        const min = Math.min(this._currentSectionNumber, sectionnumber);
        const max = Math.max(this._currentSectionNumber, sectionnumber);
        const scrollHeight = getHeight(this._sections.slice(min, max));
        const startPos =
            window.scrollY +
            (getHeight(this._sections.slice(0, this._currentSectionNumber)) -
                window.scrollY);
        window.scrollTo({
            top:
                Math.sign(sectionnumber - this._currentSectionNumber) *
                    scrollHeight +
                startPos +
                1,
            behavior: behavior,
        });
    }

    _handleNavigation({ currentTarget }) {
        if (!currentTarget.id) return;
        const nextSectionNumber = this._getSectionNumber(currentTarget.id);
        this.navigate(nextSectionNumber);
    }

    _debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            if (!func) return;
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    }

    _addEventListener() {
        this._navElements.forEach((el) =>
            el.addEventListener("click", this._handleNavigation.bind(this))
        );
        window.addEventListener("scroll", this._sectionScrolling.bind(this));
        window.addEventListener(
            "resize",
            this._debounce(() => {
                if (window.innerWidth !== this._windowWidth) this._reset();
            }, 30)
        );
        window.addEventListener("load", () => {
            this.navigate(0);
        });
    }

    navigate(nextSectionNumber) {
        nextSectionNumber = Number(nextSectionNumber);
        const prevsectionumber = this._currentSectionNumber;

        // if fullpage layout
        if (this._fullpageLayout) {
            this._sections.forEach((section, idx) => {
                // move sections
                section.style.transform = `translateY(-${
                    nextSectionNumber * window.innerHeight
                }px)`;
                // move section content
                this._contentScrolling(section, nextSectionNumber !== idx);
            });
        } else {
            this._scrollToSection(nextSectionNumber);
        }
        this._setDirectionClass(prevsectionumber, nextSectionNumber);

        // add last-section class to main el if last section is active
        nextSectionNumber === this._sections.length - 1
            ? this._wrapper.classList.add("last-section")
            : this._wrapper.classList.remove("last-section");

        // add active class to section
        this._setSectionActive(nextSectionNumber);

        // add inview class to content
        this._sections.forEach((_, idx) => {
            this._setInviewClass(idx, nextSectionNumber !== idx);
        });
    }
}
