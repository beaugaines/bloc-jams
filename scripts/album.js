'use strict';

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
// does this need to be set to null?  Can't it just be declared?
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongIndex = null;
var currentSongFromAlbum = null;
var currentSongPaused = false;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');


var createSongRow = function (songNumber, songName, songLength) {
  var template =
    '<tr class="album-view-song-item">' +
    '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
    '  <td class="song-item-title">' + songName + '</td>' +
    '  <td class="song-item-duration">' + songLength + '</td>' +
    '</tr>';

  var $row =  $(template);

  var onHover = function () {
    var $songNumberCell = $(this).find('.song-item-number');
    var songNumber = $songNumberCell.attr('data-song-number');

    if (songNumber !== currentlyPlayingSongNumber) {
      $songNumberCell.html(playButtonTemplate);
    }
  };

  var offHover = function () {
    var $songNumberCell = $(this).find('.song-item-number');
    var songNumber = $songNumberCell.attr('data-song-number');

    if (songNumber !== currentlyPlayingSongNumber) {
      $songNumberCell.html(songNumber);
    }
  };

  var updatePlayerBarSong = function () {
    var currentArtist = $('.album-view-artist').text();
    var currentSongFromAlbum = currentAlbum.songs[songNumber - 1].title;
    $('.currently-playing .song-name').html(currentSongFromAlbum);
    $('.currently-playing .artist-name').text(currentArtist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum + ' - ' + currentArtist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
  };

  var clickHandler = function () {

    var $songNumberCell = $(this).find('.song-item-number');
    var songNumber = $songNumberCell.attr('data-song-number');

    if(currentlyPlayingSongNumber === null) {
      $songNumberCell.html(pauseButtonTemplate);
      currentlyPlayingSongNumber = songNumber;
      updatePlayerBarSong();
    } else if (currentlyPlayingSongNumber === songNumber) {
      if (currentSongPaused === true) {
        currentSongPaused = false;
        $songNumberCell.html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
      } else {
        currentSongPaused = true;
        $songNumberCell.html(pauseButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPauseButton);
      }
    } else if (currentlyPlayingSongNumber !== songNumber) {
      $('[data-song-number="' + currentlyPlayingSongNumber + '"]').html(currentlyPlayingSongNumber);
      $songNumberCell.html(pauseButtonTemplate);
      currentlyPlayingSongNumber = songNumber;
      updatePlayerBarSong();
    }
  };

  // you can attache event listners to dynamically created elements
  // before adding them to the DOM
  $row.click(clickHandler);
  $row.hover(onHover, offHover);

  return $row;
};

var setCurrentAlbum = function (album) {
  currentAlbum = album;
  // vars starting with $ are jQuery objects
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
};

var trackIndex = function (album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function () {
  var albumLength = currentAlbum.songs.length;
  var $currentSongRow = $('[data-song-number="' + currentlyPlayingSongNumber + '"]').parent();
  if (currentlyPlayingSongNumber == albumLength) {
    var $nextSongRow = $($('.album-view-song-item')[0]);
  } else {
    var $nextSongRow = $currentSongRow.next('tr');
  }

  currentSongIndex = (parseInt(currentlyPlayingSongNumber)) % albumLength;
  currentlyPlayingSongNumber = (currentSongIndex + 1).toString();
  currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);
  $('.main-controls .play-pause').html(playerBarPauseButton);

  $currentSongRow.find('.song-item-number').html($currentSongRow.find('.song-item-number').attr('data-song-number'));
  $nextSongRow.find('.song-item-number').html(pauseButtonTemplate);
};

var previousSong = function () {
  var albumLength = currentAlbum.songs.length;

  var $currentSongRow = $('[data-song-number="' + currentlyPlayingSongNumber + '"]').parent();
  if (currentlyPlayingSongNumber == 1) {
    var $prevSongRow = $($('.album-view-song-item').slice(-1));
  } else {
    var $prevSongRow = $currentSongRow.prev('tr');
  }

  currentSongIndex = ((parseInt(currentlyPlayingSongNumber) + albumLength) - 2) % albumLength;
  currentlyPlayingSongNumber = (currentSongIndex + 1).toString();
  currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);
  $('.main-controls .play-pause').html(playerBarPauseButton);

  $currentSongRow.find('.song-item-number').html($currentSongRow.find('.song-item-number').attr('data-song-number'));
  $prevSongRow.find('.song-item-number').html(pauseButtonTemplate);
}



$(document).ready(function () {
  setCurrentAlbum(albumPicasso);
  $nextButton.click(nextSong);
  $previousButton.click(previousSong);
});
