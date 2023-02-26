export const scrollSpy = (el) => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            entry.target.classList.toggle("inview", entry.isIntersecting);
        });
    });
    observer.observe(el)
}