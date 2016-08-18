'use strict';

var animatePoints = function(points) {
  for (var i = 0; i < points.length; i++) {
    points[i].style.opacity = 1;
    points[i].style.transform = 'scaleX(1) translateY(0)';
    points[i].style.msTransform = 'scaleX(1) translateY(0)';
    points[i].style.WebkitTransform = 'scaleX(1) translateY(0)';
  }
};

window.onload = function () {
  var pointsArray = document.getElementsByClassName('point');

  if (window.innerHeight > 950) {
    animatePoints(pointsArray);
  }
  
  var sellingPoints = pointsArray[0];
  var scrollDistance = sellingPoints.getBoundingClientRect().top - window.innerHeight + 200;


  window.addEventListener('scroll', function () {
    if (document.documentElement.scrollTop || document.body.scrollTop >= scrollDistance) {
      animatePoints(pointsArray);
    }
  });

};
