export type SupportedLanguage = "en" | "de";
export interface TranslationData {
    [key: string]: TranslationData | string;
}
/**
 * Client-side Template Renderer for i18n
 * Handles language detection and template rendering in the browser
 */

export class ClientTemplateRenderer {
    private translationCache: Map<string, TranslationData> = new Map();
    private supportedLanguages = ["en", "de"];
    private defaultLanguage = "de"; // Changed to German default
    private onChange?: (language: SupportedLanguage) => void;
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
    private detectLanguage(): SupportedLanguage {
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
            supportedLanguages.includes(
                selectedRadio.value as SupportedLanguage,
            )
        ) {
            return selectedRadio.value as SupportedLanguage;
        }

        // Fall back to browser language detection
        const browserLang = navigator.language.split(
            "-",
        )[0] as SupportedLanguage;
        return supportedLanguages.includes(browserLang)
            ? browserLang
            : defaultLanguage;
    }

    /**
     * Render page with specified language
     */
    async renderPage(language: string): Promise<void> {
        try {
            await this.loadTranslations(language);
            this.updatePageContent();
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
    private updatePageContent(): void {
        // Update all elements with data-i18n attributes
        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.getAttribute("data-i18n");
            if (key) {
                const value = this.getNestedValue(key);
                if (value !== undefined) {
                    element.textContent = String(value);
                }
            }
        });

        // Update attributes with data-i18n-attr
        document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
            const lang = this.detectLanguage();
            const attrConfig = element.getAttribute("data-i18n-attr");
            if (attrConfig) {
                try {
                    const config = JSON.parse(attrConfig);
                    Object.entries(config).forEach(([attr, key]) => {
                        const value = this.getNestedValue(key as string);
                        if (value !== undefined) {
                            element.setAttribute(attr, String(value));
                        }
                    });
                } catch (error) {
                    console.error("Invalid data-i18n-attr format:", attrConfig);
                }
            }
            this.onChange?.(lang);
        });
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
    getNestedValue(key: string): string | undefined {
        const translations = this.translationCache.get(this.detectLanguage());
        const value = key.split(".").reduce((current, prop) => {
            if (!current || typeof current !== "object") {
                console.warn(`Invalid translation path: ${key}`);
                return undefined;
            }
            return prop in current ? current[prop] : undefined;
        }, translations);
        if (value === undefined) {
            console.warn(`Translation key not found: ${key}`);
            return undefined;
        }
        if (typeof value !== "string") {
            console.warn(`Invalid translation value for key: ${key}`);
            return undefined;
        }
        return value;
    }
    subscribe(callback: (language: SupportedLanguage) => void): void {
        this.onChange = callback;
    }
}
