export const addSectionCountClass = main => {
    const sections = main.querySelectorAll('section.section');
    sections.length % 2 === 0 ? main.classList.add('even') : main.classList.add('odd');
}