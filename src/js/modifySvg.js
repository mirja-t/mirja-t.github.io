export async function modifySvg(images, name, fill) {
    const img = new Image();
    // Fetch the SVG file
    return fetch(images(`./icon-${name}.svg`))
        .then((response) => response.text())
        .then((svgText) => {
            // Modify the fill in the SVG content
            const regex = /<(path|polygon)/gm;
            const matches = [...new Set(svgText.match(regex))];
            let modifiedSvg = svgText;
            matches.forEach(match => {
                modifiedSvg = modifiedSvg.replaceAll(match, `${match} fill="${fill}" `)
            });
            // Create a data URL for the modified SVG
            const svgBlob = new Blob([modifiedSvg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                URL.revokeObjectURL(url); // Clean up the URL
            };

            return url; // Set the modified SVG as the image source
        });
}