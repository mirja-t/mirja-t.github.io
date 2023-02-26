export const shrinkLogoOnScroll = function() {
  const logoWrapperProject = document.querySelector('#logowrapper');

  const shrinkLogo = function() {
      if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        logoWrapperProject.classList.add('small');
      } else {
        logoWrapperProject.classList.remove('small');
      }
  }
  if(logoWrapperProject) {
      document.addEventListener('wheel', shrinkLogo);
  }
}