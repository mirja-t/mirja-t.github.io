import type { TranslationData } from "./languageUtils";

/**
 * Get nested object value by dot notation
 */
export const getNestedValue = (
    obj: TranslationData,
    key: string,
): string | undefined => {
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
};
