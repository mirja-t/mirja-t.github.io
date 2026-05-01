import type { TranslationData } from "./languageUtils";
/**
 * Client-side Template Renderer for i18n
 * Handles language detection and template rendering in the browser
 */

export class ClientTemplateRenderer {
    private translationCache: Map<string, TranslationData> = new Map();
    private supportedLanguages = ["en", "de"];
    private defaultLanguage = "de"; // Changed to German default

    /**
     * Initialize client-side rendering
     */
    async init(): Promise<void> {
        const language = this.detectLanguage();
        await this.renderPage(language);
        this.setupLanguageRouting();
    }

    /**
     * Detect language with localStorage persistence
     */
    private detectLanguage(): string {
        // First, check localStorage for saved preference
        const savedLanguage = localStorage.getItem("selectedLanguage");
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            return savedLanguage;
        }

        // Check browser language preference
        const browserLang = navigator.language.split("-")[0];
        return this.supportedLanguages.includes(browserLang)
            ? browserLang
            : this.defaultLanguage;
    }

    /**
     * Render page with specified language
     */
    async renderPage(language: string): Promise<void> {
        try {
            const translations = await this.loadTranslations(language);
            this.updatePageContent(translations);
            this.updateDocumentMeta(translations);
            this.updateRadioButton(language);
        } catch (error) {
            console.error("Failed to render page:", error);
        }
    }

    /**
     * Build a translation asset URL that respects the app base path
     */
    private getTranslationUrl(language: string): string {
        const baseUrl = import.meta.env.BASE_URL.endsWith("/")
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;
        return `${baseUrl}i18n/${language}.json`;
    }

    /**
     * Load translation data for specified language
     */
    private async loadTranslations(language: string): Promise<TranslationData> {
        if (!this.translationCache.has(language)) {
            try {
                const response = await fetch(this.getTranslationUrl(language));
                if (!response.ok) {
                    throw new Error(`Failed to load ${language} translations`);
                }
                const translations = await response.json();
                this.translationCache.set(language, translations);
            } catch (error) {
                console.error(
                    `Failed to load translations for ${language}:`,
                    error,
                );
                // Fallback to default language
                if (language !== this.defaultLanguage) {
                    return this.loadTranslations(this.defaultLanguage);
                }
                throw error;
            }
        }
        return this.translationCache.get(language)!;
    }

    /**
     * Update page content with translations
     */
    private updatePageContent(translations: TranslationData): void {
        // Update all elements with data-i18n attributes
        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.getAttribute("data-i18n");
            if (key) {
                const value = this.getNestedValue(translations, key);
                if (value !== undefined) {
                    element.textContent = String(value);
                }
            }
        });

        // Update attributes with data-i18n-attr
        document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
            const attrConfig = element.getAttribute("data-i18n-attr");
            if (attrConfig) {
                try {
                    const config = JSON.parse(attrConfig);
                    Object.entries(config).forEach(([attr, key]) => {
                        const value = this.getNestedValue(
                            translations,
                            key as string,
                        );
                        if (value !== undefined) {
                            element.setAttribute(attr, String(value));
                        }
                    });
                } catch (error) {
                    console.error("Invalid data-i18n-attr format:", attrConfig);
                }
            }
        });
    }

    /**
     * Update document meta information
     */
    private updateDocumentMeta(translations: TranslationData): void {
        const meta = translations.meta;
        if (meta && typeof meta === "object") {
            // Update title
            if ("title" in meta && typeof meta.title === "string") {
                document.title = meta.title;
            }

            // Update meta description
            const descriptionMeta = document.querySelector(
                'meta[name="description"]',
            );
            if (
                descriptionMeta &&
                typeof meta === "object" &&
                "description" in meta &&
                typeof meta.description === "string"
            ) {
                descriptionMeta.setAttribute("content", meta.description);
            }

            // Update meta keywords
            const keywordsMeta = document.querySelector(
                'meta[name="keywords"]',
            );
            if (
                keywordsMeta &&
                typeof meta === "object" &&
                "keywords" in meta &&
                typeof meta.keywords === "string"
            ) {
                keywordsMeta.setAttribute("content", meta.keywords);
            }

            // Update lang attribute
            if ("lang" in meta && typeof meta.lang === "string") {
                document.documentElement.setAttribute("lang", meta.lang);
            }
        } else {
            console.warn(
                "Meta information is missing or invalid in translations",
            );
        }
    }

    /**
     * Set up client-side routing for language switching
     */
    private setupLanguageRouting(): void {
        // Handle radio button changes for language switching
        const languageSwitcher = document.getElementById("language-switcher");
        if (languageSwitcher) {
            languageSwitcher.addEventListener("change", (event) => {
                const target = event.target as HTMLInputElement;
                if (target.type === "radio" && target.name === "language") {
                    const language = target.value;
                    if (this.supportedLanguages.includes(language)) {
                        // Store the selected language in localStorage
                        localStorage.setItem("selectedLanguage", language);
                        this.renderPage(language);
                    }
                }
            });
        }
    }

    /**
     * Update radio button to match current language
     */
    private updateRadioButton(language: string): void {
        const radioButton = document.getElementById(
            language,
        ) as HTMLInputElement;
        if (radioButton) {
            radioButton.checked = true;
        }
    }

    /**
     * Get nested object value by dot notation
     */
    private getNestedValue(
        obj: TranslationData,
        key: string,
    ): string | undefined {
        const value = key.split(".").reduce((current, prop) => {
            if (!current || typeof current !== "object") {
                console.warn(`Invalid translation path: ${key}`);
                return undefined;
            }
            return prop in current ? current[prop] : undefined;
        }, obj) as string | undefined;
        if (value === undefined) {
            console.warn(`Translation key not found: ${key}`);
            return undefined;
        }
        return value;
    }
}
