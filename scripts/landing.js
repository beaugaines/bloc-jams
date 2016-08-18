'use strict';

var animatePoint = function(point) {
    point.style.opacity = 1;
    point.style.transform = 'scaleX(1) translateY(0)';
    point.style.msTransform = 'scaleX(1) translateY(0)';
    point.style.WebkitTransform = 'scaleX(1) translateY(0)';
};

window.onload = function () {
  var pointsArray = document.getElementsByClassName('point');

  if (window.innerHeight > 950) {
    forEach(pointsArray, animatePoint)
  }

  var sellingPoints = pointsArray[0];
  var scrollDistance = sellingPoints.getBoundingClientRect().top - window.innerHeight + 200;

  window.addEventListener('scroll', function () {
    if (document.documentElement.scrollTop || document.body.scrollTop >= scrollDistance) {
      forEach(pointsArray, animatePoint)
    }
  });

};
