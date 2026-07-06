document.addEventListener('DOMContentLoaded', () => {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            } else {
                entry.target.classList.remove('section-visible');
            }
        });
    }, {
        threshold: 0.1
    });

    const allSections = document.querySelectorAll('section');
    allSections.forEach(sec => sectionObserver.observe(sec));
});