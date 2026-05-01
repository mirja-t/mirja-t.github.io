/**
 * Language utilities for translation management
 * Handles language detection, translation loading, and event management
 */

// Type definitions
export type SupportedLanguage = "en" | "de";

export interface TranslationData {
    [key: string]: TranslationData | string;
}

export type LanguageChangeCallback = (
    language: SupportedLanguage,
) => Promise<void> | void;

// Simple translation fetcher
export const getTranslations = async (
    language: SupportedLanguage,
): Promise<TranslationData | null> => {
    try {
        const baseUrl = import.meta.env.BASE_URL.endsWith("/")
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;
        const response = await fetch(`${baseUrl}i18n/${language}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${language} translations`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback to German as default
        if (language !== "de") {
            return getTranslations("de");
        }
        return null;
    }
};

// Detect current language with persistence
export const detectLanguage = (): SupportedLanguage => {
    const supportedLanguages: SupportedLanguage[] = ["en", "de"];
    const defaultLanguage: SupportedLanguage = "de";

    // First, check localStorage for saved preference
    const savedLanguage = localStorage.getItem(
        "selectedLanguage",
    ) as SupportedLanguage;
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        return savedLanguage;
    }

    // Then, check if there's a selected radio button
    const selectedRadio = document.querySelector(
        'input[name="language"]:checked',
    ) as HTMLInputElement;
    if (
        selectedRadio &&
        supportedLanguages.includes(selectedRadio.value as SupportedLanguage)
    ) {
        return selectedRadio.value as SupportedLanguage;
    }

    // Fall back to browser language detection
    const browserLang = navigator.language.split("-")[0] as SupportedLanguage;
    return supportedLanguages.includes(browserLang)
        ? browserLang
        : defaultLanguage;
};

// Set the correct radio button based on language
export const setLanguageRadio = (language: SupportedLanguage): void => {
    const supportedLanguages: SupportedLanguage[] = ["en", "de"];
    if (!supportedLanguages.includes(language)) return;

    // Uncheck all radio buttons first
    document.querySelectorAll('input[name="language"]').forEach((radio) => {
        (radio as HTMLInputElement).checked = false;
    });

    // Check the correct radio button
    const targetRadio = document.querySelector(
        `input[name="language"][value="${language}"]`,
    ) as HTMLInputElement;
    if (targetRadio) {
        targetRadio.checked = true;
    }
};

// Set up language change listener with callback support
export const setupLanguageListener = (
    callback?: LanguageChangeCallback,
): void => {
    const languageSwitcher = document.getElementById("language-switcher");
    if (
        languageSwitcher &&
        !languageSwitcher.dataset.languageListenerAttached
    ) {
        languageSwitcher.dataset.languageListenerAttached = "true";
        languageSwitcher.addEventListener("change", async (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.type === "radio" && target.name === "language") {
                const language = target.value as SupportedLanguage;
                const supportedLanguages: SupportedLanguage[] = ["en", "de"];
                if (supportedLanguages.includes(language)) {
                    // Store the selected language in localStorage
                    localStorage.setItem("selectedLanguage", language);

                    // Set the correct radio button
                    setLanguageRadio(language);

                    // Call the provided callback function
                    if (callback) {
                        await callback(language);
                    }
                }
            }
        });
    }
};
