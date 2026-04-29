// Simple translation fetcher for headlines
const getTranslations = async (language) => {
    try {
        const baseUrl = import.meta.env.BASE_URL.endsWith("/")
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;
        return `${baseUrl}i18n/${language}.json`;
    } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback to German as default
        if (language !== "de") {
            return getTranslations("de");
        }
        return null;
    }
};

// Get nested value from object using dot notation
const getNestedValue = (obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
};

// Detect current language
const detectLanguage = () => {
    const supportedLanguages = ["en", "de"];
    const defaultLanguage = "de";

    // First, check if there's a selected radio button
    const selectedRadio = document.querySelector(
        'input[name="language"]:checked',
    );
    if (selectedRadio && supportedLanguages.includes(selectedRadio.value)) {
        return selectedRadio.value;
    }

    // Fall back to browser language detection
    const browserLang = navigator.language.split("-")[0];
    return supportedLanguages.includes(browserLang)
        ? browserLang
        : defaultLanguage;
};

// Set up language change listener for headlines
const setupHeadlineLanguageListener = (sections, theme) => {
    const languageSwitcher = document.getElementById("language-switcher");
    if (
        languageSwitcher &&
        !languageSwitcher.dataset.headlineListenerAttached
    ) {
        languageSwitcher.dataset.headlineListenerAttached = "true";
        languageSwitcher.addEventListener("change", async (event) => {
            const target = event.target;
            if (target.type === "radio" && target.name === "language") {
                const language = target.value;
                const supportedLanguages = ["en", "de"];
                if (supportedLanguages.includes(language)) {
                    // Clear existing shadow headlines before re-rendering
                    document
                        .querySelectorAll(".shadowHeadline")
                        .forEach((el) => el.remove());
                    // Re-run copyHeadlines with new language
                    await copyHeadlines(sections, theme);
                }
            }
        });
    }
};

export const copyHeadlines = async (sections, theme) => {
    // Get current language and translations
    const currentLanguage = detectLanguage();
    const translations = await getTranslations(currentLanguage);

    if (!translations) {
        console.error("Could not load translations, using original text");
    }

    // Set up language change listener (guards against duplicate attachment on the element itself)
    setupHeadlineLanguageListener(sections, theme);

    sections.forEach((section, idx) => {
        // set invers class
        if (idx % 2 === 1) {
            section
                .querySelectorAll("h1, h2")
                .forEach((h) => h.classList.add("invers"));
        }
    });

    const headlines = document.querySelectorAll("h1, h2");
    headlines.forEach((h) => {
        let tagName = h.tagName.toLocaleLowerCase();

        // Get translated text
        let text = h.innerHTML; // fallback to original

        // Check if element has data-i18n attribute
        const translationKey = h.getAttribute("data-i18n");
        if (translationKey && translations) {
            const translatedText = getNestedValue(translations, translationKey);
            if (translatedText) {
                text = translatedText;
            }
        }

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

        if (theme === "alternate") {
            style.textContent += `
                h1.invers,
                h2.invers {
                    color: white;
                }`;
        }

        let parent = h.parentNode;
        let container = document.createElement("div");
        container.setAttribute("class", "shadowHeadline");

        let shadowHl = document.createElement(tagName);
        h.className === "invers" && shadowHl.classList.add("invers");
        shadowHl.innerHTML = text;

        let shadowRoot = container.attachShadow({ mode: "open" });
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(shadowHl);
        parent.prepend(container);
    });
};
