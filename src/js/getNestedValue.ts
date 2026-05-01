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
    }, obj);
    if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return undefined;
    }
    if (typeof value !== "string") {
        console.warn(`Invalid translation value for key: ${key}`);
        return undefined;
    }
    return value;
};
