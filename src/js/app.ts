import "../scss/_app.scss";
import { copyHeadlines } from "./headlines";
import { interactiveChart } from "./chart";
import { Fullpage } from "./fullpage";
import { hoverAnimation } from "./hoverAnimation";
import { addSectionCountClass } from "./addSectionCountClass";
import { scrollSpy } from "./scrollSpy";
import { shrinkLogoOnScroll } from "./shrinkLogoOnScroll";
import { generateButton } from "./generateButton";
import { stickyElement } from "./stickyElement";
import LinkMousefollow from "./webcomponents/LinkMousefollow";

import { parallax } from "./parallax";

// Theme
let currentTheme = "alternate"; // alternate | white
const body = document.querySelector("body");
body.classList.add(`theme-${currentTheme}`);

function init() {
    const svgChart = document.getElementById("svgchart");
    // const chartDetails = document.getElementById("chart-details");
    const cardlinksWrapper = document.querySelectorAll(".card-links");
    const footerlinks = document.querySelectorAll("footer li.icon");
    const scrollElements = document.querySelectorAll(
        ".project-details .content"
    );
    const contactbuttonwrapper = document.getElementById("contactbutton");
    const sections = document.querySelectorAll("#fullpage .section");
    const stickyContainer = document.querySelectorAll(".sticky-container");
    const logo = document.getElementById("logowrapper");
    // const canvas = document.querySelector("canvas");

    if (svgChart) interactiveChart(svgChart);
    if (sections.length) copyHeadlines(sections, currentTheme);
    if (cardlinksWrapper.length)
        cardlinksWrapper.forEach((cardlinks) => hoverAnimation(cardlinks, 20));
    if (footerlinks.length)
        footerlinks.forEach((footerlink) => hoverAnimation(footerlink, 20));

    shrinkLogoOnScroll();
    if (scrollElements.length) {
        scrollElements.forEach((el) => {
            window.addEventListener("scroll", function () {
                scrollSpy(el);
            });
        });
    }

    if (contactbuttonwrapper) {
        generateButton(contactbuttonwrapper);
    }

    const contentwrapper = document.querySelector(
        ".content-wrapper:not(#fullpagewrapper)"
    );
    if (contentwrapper) addSectionCountClass(contentwrapper);

    if (stickyContainer) {
        stickyContainer.forEach((elmnt) => stickyElement(elmnt));
    }
    if (logo) {
        hoverAnimation(logo, 10);
    }
}
init();

function initFullpage() {
    const logo = document.getElementById("logowrapper");
    const fpwrapper = document.getElementById("fullpagewrapper");
    const fp = document.getElementById("fullpage");
    const nav = document.querySelector("nav#nav ul");

    const config = {
        breakpoint: 991,
        onSectionChange: [resetChart],
    };
    const fullpage = new Fullpage(fpwrapper, fp, nav, config);

    if (logo) {
        logo.addEventListener("click", () => fullpage.navigate(0));
    }

    return fullpage;
}

if (document.getElementById("fullpagewrapper")) initFullpage();

function resetChart(sectionNumber: number) {
    if (sectionNumber === 1) {
        document
            .querySelectorAll(".chart-details")
            .forEach((el) => el.remove());
    }
}

document.addEventListener("swup:contentReplaced", () => {
    init();
    window.scrollTo(0, 0);
    const fpwrapper = document.getElementById("fullpagewrapper");
    if (fpwrapper) {
        const targetSection = location.href.match(/#section-[0-9]+/g);
        let sectionNumber =
            targetSection?.length &&
            targetSection[0] &&
            targetSection[0].match(/[0-9]+/)
                ? [0]
                : null;
        const fullpage = initFullpage();
        if (sectionNumber) fullpage.navigate(sectionNumber);
    }
});

document.addEventListener("swup:transitionEnd", () => {
    const parallaxImages = document.querySelectorAll(".js-parallax");
    if (parallaxImages.length) {
        parallaxImages.forEach((img, idx) => parallax(img, idx));
    }
});

customElements.define("link-mousefollow", LinkMousefollow);
