/**
 * Fetches `ICONS[name]`, injects a fill colour, and returns a blob‑URL.
 *
 * @param icons  – the ICONS object that maps names to file URLs
 * @param name   – icon name, e.g. "react"
 * @param fill   – any valid CSS colour string, e.g. "#fff" or "white"
 */
export async function getFilledSvgUrl(
    icons: Record<string, string>,
    name: string,
    fill: string
  ): Promise<string> {
    const src = icons[name];
    if (!src) throw new Error(`Icon "${name}" not found in ICONS`);
  
    // 1 – download the raw SVG text
    const svgText = await fetch(src).then(r => r.text());
  
    // 2 – add fill="…" to every <path>, <polygon>, etc.
    const modifiedSvg = svgText.replace(
      /<(path|polygon|rect|circle|ellipse|polyline|line)\b/gi,
      match => `${match} fill="${fill}"`
    );
  
    // 3 – turn the modified SVG into a blob URL
    const blob  = new Blob([modifiedSvg], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob); // remember to revoke it after use!
  }
  