const routeLinks = new Map(
  [...document.querySelectorAll('.route-nav a[href^="#"]')].map((link) => [
    link.getAttribute('href').slice(1),
    link,
  ]),
);
const routeNavigation = document.querySelector('.route-nav');

const sections = [...routeLinks.keys()]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const setCurrentSection = (id) => {
  routeLinks.forEach((link) => link.removeAttribute('aria-current'));

  const currentLink = routeLinks.get(id);
  if (currentLink) {
    currentLink.setAttribute('aria-current', 'step');
    routeNavigation.scrollLeft =
      currentLink.offsetLeft - routeNavigation.clientWidth / 2 + currentLink.clientWidth / 2;
  }
};

let updateScheduled = false;

const updateCurrentSection = () => {
  const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
  let currentSection = sections[0];

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= headerBottom + 32) {
      currentSection = section;
    }
  });

  setCurrentSection(currentSection.id);
  updateScheduled = false;
};

window.addEventListener(
  'scroll',
  () => {
    if (!updateScheduled) {
      updateScheduled = true;
      requestAnimationFrame(updateCurrentSection);
    }
  },
  { passive: true },
);

const requestedSection = document.getElementById(location.hash.slice(1));

requestAnimationFrame(() => {
  if (requestedSection) {
    requestedSection.scrollIntoView({ block: 'start' });
  }

  updateCurrentSection();
});
