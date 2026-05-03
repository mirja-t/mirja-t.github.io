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
import { ClientTemplateRenderer } from "./clientTemplateRenderer";
import { debounce } from "./utils";

const FP_BREAKPOINT = 991;

async function init() {
    // Theme
    let currentTheme = "white"; // alternate | white
    const body = document.querySelector("body");
    body.classList = "";
    body.classList.add(`theme-${currentTheme}`);

    // Initialize i18n rendering first
    // Initialize client-side template renderer
    const templateRenderer = new ClientTemplateRenderer();
    await templateRenderer.init();
    const svgChart = document.getElementById("svgchart");
    // const chartDetails = document.getElementById("chart-details");
    const cardlinksWrapper = document.querySelectorAll(".card-links");
    const footerlinks = document.querySelectorAll("footer li.icon");
    const scrollElements = document.querySelectorAll(".scrollspy");
    const contactbuttonwrapper = document.getElementById("contactbutton");
    const sections = document.querySelectorAll("section.section");
    const stickyContainer = document.querySelectorAll(".sticky-container");
    const logo = document.getElementById("logowrapper");
    // const canvas = document.querySelector("canvas");

    function addScreenSizeClass() {
        if (window.matchMedia(`(min-width: ${FP_BREAKPOINT}px)`).matches) {
            body.classList.add("screen-large");
        } else {
            body.classList.remove("screen-large");
        }
    }
    window.addEventListener(
        "resize",
        debounce(() => {
            addScreenSizeClass();
        }, 30),
    );
    addScreenSizeClass();

    if (svgChart) interactiveChart(svgChart);
    if (sections.length) {
        const shadowHeadlines = await copyHeadlines();
        templateRenderer.subscribe(() => {
            // Handle language change
            shadowHeadlines.forEach((h) => {
                const key = h.getAttribute("data-i18n");
                if (key) {
                    const value = templateRenderer.getNestedValue(key);
                    if (value !== undefined) {
                        h.textContent = String(value);
                    }
                }
            });
        });
    }
    if (cardlinksWrapper.length)
        cardlinksWrapper.forEach((cardlinks) => hoverAnimation(cardlinks, 20));
    if (footerlinks.length)
        footerlinks.forEach((footerlink) => hoverAnimation(footerlink, 20));

    shrinkLogoOnScroll();
    if (scrollElements.length) {
        scrollElements.forEach((el) => scrollSpy(el));
    }

    if (contactbuttonwrapper) {
        generateButton(contactbuttonwrapper);
    }

    const contentwrapper = document.querySelector(
        ".content-wrapper:not(#fullpagewrapper)",
    );
    if (contentwrapper) addSectionCountClass(contentwrapper);

    if (stickyContainer) {
        stickyContainer.forEach((elmnt) => stickyElement(elmnt));
    }
    if (logo) {
        hoverAnimation(logo, 10);
    }
    if (document.getElementById("fullpagewrapper")) initFullpage();
}

// Initialize the app
init().catch(console.error);

function initFullpage() {
    const logo = document.getElementById("logowrapper");
    const fpwrapper = document.getElementById("fullpagewrapper");
    const fp = document.getElementById("fullpage");
    const nav = document.querySelector("nav#nav ul");

    const config = {
        breakpoint: FP_BREAKPOINT,
        onSectionChange: [resetChart],
    };
    const fullpage = new Fullpage(fpwrapper, fp, nav, config);

    if (logo) {
        logo.addEventListener("click", () => fullpage.navigate(0));
    }

    return fullpage;
}

function resetChart(sectionNumber: number) {
    if (sectionNumber === 1) {
        document
            .querySelectorAll(".chart-details")
            .forEach((el) => el.remove());
    }
}

customElements.define("link-mousefollow", LinkMousefollow);
