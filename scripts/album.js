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
var currentSoundFile = null;
var currentVolume = null;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');


var formatDuration = function (seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = Math.floor(seconds - mins * 60);
  if (secs < 10) {
    secs = '0' + secs;
  }
  return(mins + ':' + secs);
};

var setSong = function (num) {
  if (currentSoundFile) {
    currentSoundFile.stop();
  }
  currentSongFromAlbum = currentAlbum.songs[parseInt(num) - 1];
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: ['mp3'],
    preload: true,
    autoplay: true
  });
  currentVolume = currentVolume || currentSoundFile.getVolume();
};


var createSongRow = function (songNumber, songName, songLength) {
  var template =
    '<tr class="album-view-song-item">' +
    '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
    '  <td class="song-item-title">' + songName + '</td>' +
    '  <td class="song-item-duration">' + formatDuration(songLength) + '</td>' +
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
    $('.currently-playing .current-time').text('0:00');
  };


  var clickHandler = function () {
    var $songNumberCell = $(this).find('.song-item-number');
    var songNumber = $songNumberCell.attr('data-song-number');
    setTotalTimeInPlayerBar($(this).find('.song-item-duration').text());

    if(currentlyPlayingSongNumber === null) {
      $songNumberCell.html(pauseButtonTemplate);
      currentlyPlayingSongNumber = songNumber;
      setSong(songNumber);
      updatePlayerBarSong();
      $('.currently-playing .current-time').text('0:00');
    } else if (currentlyPlayingSongNumber === songNumber) {
      if (currentSoundFile.isPaused() === true) {
        currentSoundFile.play();
        $songNumberCell.html(pauseButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
      } else {
        currentSoundFile.pause();
        $songNumberCell.html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPauseButton);
      }
    } else if (currentlyPlayingSongNumber !== songNumber) {
      $('[data-song-number="' + currentlyPlayingSongNumber + '"]').html(currentlyPlayingSongNumber);
      $songNumberCell.html(pauseButtonTemplate);
      currentlyPlayingSongNumber = songNumber;
      setSong(songNumber);
      updatePlayerBarSong();
    }

    $('.volume').find('.fill').css({width: currentVolume});
    $('.volume').find('.thumb').css({left: currentVolume});

    updateSeekBarWhileSongPlays();
  };

  // you can attach event listners to dynamically created elements
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

var updateSeekBarWhileSongPlays = function () {
  if (currentSoundFile) {
    currentSoundFile.bind('timeupdate', function (event) {
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');
      updateSeekPercentage($seekBar, seekBarFillRatio);
      setCurrentTimeInPlayerBar(formatDuration(this.getTime()));
    });
  }
}

var updateSeekPercentage = function ($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;

  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(offsetXPercent, 100);

  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var seek = function (time) {
  if (currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};

var setVolume = function (level) {
  if (currentSoundFile) {
    currentVolume = currentSoundFile.setVolume(level).getVolume();
  }
};

var setTotalTimeInPlayerBar = function (totalTime) {
  $('.currently-playing .total-time').text(totalTime);
}

var setCurrentTimeInPlayerBar = function (currentTime) {
  $('.seek-control .current-time').text(currentTime);
};

var setupSeekBars = function () {
  var $seekBars = $('.player-bar .seek-bar');

  $seekBars.click(function (event) {
    var parentClass = $(this).parent().attr('class');
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();

    var seekBarFillRatio = offsetX / barWidth;

    if (parentClass.match(/volume/)) {
      setVolume(Math.round(seekBarFillRatio * 100));
    } else {
      seek(currentSoundFile.getDuration() * seekBarFillRatio);
    }
    updateSeekPercentage($(this), seekBarFillRatio);
  });

  // this attaches the mousedown callback to all seekbars
  $seekBars.find('.thumb').mousedown(function (event) {
    var $seekBar = $(this).parent();

    // we use bind b/c it allows you to namespace event listeners
    $(document).bind('mousemove.thumb', function (event) {
      // this generates a lot of errors: album.js:157 Uncaught ReferenceError: $seekbar is not defined
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;
      if (parentClass.match(/volume/)) {
        setVolume(Math.round(seekBarFillRatio * 100));
      } else {
        seek(currentSoundFile.getDuration() * seekBarFillRatio);
      }

      updateSeekPercentage($seekBar, seekBarFillRatio);
    });

    $(document).bind('mouseup.thumb', function () {
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });

  })
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

  setSong(currentlyPlayingSongNumber);
  updateSeekBarWhileSongPlays();
  setTotalTimeInPlayerBar($nextSongRow.find('.song-item-duration').text());


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

  setSong(currentlyPlayingSongNumber);
  setTotalTimeInPlayerBar($prevSongRow.find('.song-item-duration').text());
  updateSeekBarWhileSongPlays();

  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);
  $('.main-controls .play-pause').html(playerBarPauseButton);

  $currentSongRow.find('.song-item-number').html($currentSongRow.find('.song-item-number').attr('data-song-number'));
  $prevSongRow.find('.song-item-number').html(pauseButtonTemplate);
}



$(document).ready(function () {
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $nextButton.click(nextSong);
  $previousButton.click(previousSong);
});
