import { Component, Input, OnChanges, OnDestroy } from '@angular/core';

interface Track { title: string; link: string; }

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnChanges, OnDestroy {
  @Input() data: Track[] = [];
  @Input() repeatEachAya = 1;
  @Input() repeatRange   = 1;

  playlist: Track[] = [];

  // Public playback state (used in template)
  isPlaying      = false;
  currentIdx     = 0;
  ayaRepeatCount  = 0;   // how many times current aya has played so far
  rangeRepeatCount = 0;  // how many times the full range has cycled

  private _audio: HTMLAudioElement | null = null;

  ngOnChanges(): void {
    this.playlist = (this.data ?? []).map(t => ({ ...t }));
    this.stop();
  }

  ngOnDestroy(): void { this.stop(); }

  // ── Controls ────────────────────────────────────────────────────────────────

  play(): void {
    if (this.isPlaying) return;
    this._playTrack();
  }

  stop(): void {
    if (this._audio) { this._audio.pause(); this._audio.onended = null; this._audio = null; }
    this.isPlaying       = false;
    this.currentIdx      = 0;
    this.ayaRepeatCount  = 0;
    this.rangeRepeatCount = 0;
  }

  pause(): void {
    if (this._audio) this._audio.pause();
    this.isPlaying = false;
  }

  resume(): void {
    if (this._audio) { this._audio.play(); this.isPlaying = true; }
    else this.play();
  }

  prev(): void {
    this.ayaRepeatCount = 0;
    this.currentIdx = Math.max(0, this.currentIdx - 1);
    if (this.isPlaying) this._playTrack();
  }

  next(): void {
    this.ayaRepeatCount = 0;
    this.currentIdx = Math.min(this.playlist.length - 1, this.currentIdx + 1);
    if (this.isPlaying) this._playTrack();
  }

  playFrom(index: number): void {
    this.currentIdx      = index;
    this.ayaRepeatCount  = 0;
    this.rangeRepeatCount = 0;
    this._playTrack();
  }

  togglePlay(): void {
    if (!this.playlist.length) return;
    if (this.isPlaying) this.pause();
    else if (this._audio) this.resume();
    else this.play();
  }

  // ── Internal ─────────────────────────────────────────────────────────────────

  private _playTrack(): void {
    if (!this.playlist.length) return;
    if (this._audio) { this._audio.pause(); this._audio.onended = null; }

    const track = this.playlist[this.currentIdx];
    this._audio = new Audio(track.link);
    this._audio.onended = () => this._onTrackEnded();
    this._audio.play();
    this.isPlaying = true;
  }

  private _onTrackEnded(): void {
    this.ayaRepeatCount++;

    if (this.ayaRepeatCount < this.repeatEachAya) {
      this._playTrack();
      return;
    }

    this.ayaRepeatCount = 0;
    this.currentIdx++;

    if (this.currentIdx < this.playlist.length) {
      this._playTrack();
      return;
    }

    // End of range — check range repeat
    this.rangeRepeatCount++;
    const maxRange = this.repeatRange === 100 ? Infinity : this.repeatRange;

    if (this.rangeRepeatCount < maxRange) {
      this.currentIdx = 0;
      this._playTrack();
    } else {
      this.stop();
    }
  }

  get currentTrack(): Track | null {
    return this.playlist[this.currentIdx] ?? null;
  }

  get progressLabel(): string {
    if (!this.playlist.length) return '';
    const aya   = `${this.currentIdx + 1} / ${this.playlist.length}`;
    const rep   = this.repeatEachAya > 1
      ? ` · تكرار ${this.ayaRepeatCount + 1}/${this.repeatEachAya}` : '';
    const range = this.repeatRange > 1
      ? ` · دورة ${this.rangeRepeatCount + 1}/${this.repeatRange === 100 ? '∞' : this.repeatRange}` : '';
    return aya + rep + range;
  }
}
