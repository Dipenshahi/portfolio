document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function activateNavLink() {
    let scrollY = window.pageYOffset;
    let windowHeight = window.innerHeight;
    let documentHeight = document.body.scrollHeight;

    sections.forEach((section, index) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 50; // offset for header height or padding
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }

      // If near bottom of page, activate last section's nav link
      if (scrollY + windowHeight >= documentHeight - 5 && index === sections.length - 1) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', activateNavLink);
  activateNavLink(); // initial call
});
