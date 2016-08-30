'use strict';

var animatePoints = function() {
  var revealPoint = function () {
    $(this).css({
      opacity: 1,
      transform: 'scaleX(1) translateY(0)'
    });
  };

  $.each($('.point'), revealPoint);
};

$(window).load(function () {

  if ($(window).height() > 950) {
    animatePoints();
  }

  var scrollDistance = $('.selling-points').offset().top - $(window).height() + 200;


  window.addEventListener('scroll', function () {
    $(window).scroll(function () {
      if ($(window).scrollTop() >= scrollDistance) {
        animatePoints();
      }
    });
  });
});
