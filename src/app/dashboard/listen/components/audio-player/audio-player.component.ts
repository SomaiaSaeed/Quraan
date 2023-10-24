import { Component, OnInit ,Input} from '@angular/core';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit {
  @Input() data: [] | any;
    // Main Player Controls
  msaapDisplayPlayList = true;
  msaapDisablePositionSlider = true;
  msaapDisplayRepeatControls = true;
  msaapDisplayVolumeControls = true;
  msaapDisplayVolumeSlider = true;

  // Title Marquee
  msaapDisplayTitle = true;

  // Playlist Controls
  // msaapPageSizeOptions = [2, 4, 6];
  msaapDisplayArtist = true;
  msaapDisplayDuration = true;

  // For Localisation
  msaapTableHeader = 'القائمة';
  msaapTitleHeader = 'اسـم السورة';
  msaapArtistHeader = 'القارئ';

  constructor() { }

  ngOnInit() {
  }

}
