/**
 * Wizardry I Background Music Manager
 * Plays the 13 iconic "We Love Wizardry" (Kentaro Haneda) tracks matching each game location/tab.
 */

export type WizardryTrackId =
  | '01-opening'
  | '02-castle'
  | '03-gilgamesh-s-tavern'
  | '04-adventurer-s-inn'
  | '05-boltac-s-trading-post'
  | '06-temple-of-cant'
  | '07-edge-of-town'
  | '08-dungeon'
  | '09-camp'
  | '10-fight'
  | '11-exterminated'
  | '12-werdna'
  | '13-complete';

export const TRACK_TITLES: Record<WizardryTrackId, string> = {
  '01-opening': '01 · Opening Theme',
  '02-castle': '02 · Castle of Trebor',
  '03-gilgamesh-s-tavern': "03 · Gilgamesh's Tavern",
  '04-adventurer-s-inn': "04 · Adventurer's Inn",
  '05-boltac-s-trading-post': "05 · Boltac's Trading Post",
  '06-temple-of-cant': '06 · Temple of Cant',
  '07-edge-of-town': '07 · Edge of Town & Training Grounds',
  '08-dungeon': '08 · Dungeon Labyrinth',
  '09-camp': '09 · Camp in the Maze',
  '10-fight': '10 · Monster Encounter',
  '11-exterminated': '11 · Party Exterminated',
  '12-werdna': "12 · Werdna's Sanctum (Floor 10)",
  '13-complete': '13 · Quest Complete',
};

class MusicManager {
  private audio: HTMLAudioElement | null = null;
  private currentTrack: WizardryTrackId | null = null;
  private enabled: boolean = true;
  private volume: number = 0.38;
  private unlockBound: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMusic = localStorage.getItem('wiz_music_enabled');
      if (savedMusic === 'false') {
        this.enabled = false;
      }
      this.setupAutoplayUnlock();
    }
  }

  private ensureAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.loop = true;
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';
      // Fallback to Zimlab CDN if local relative file fails to load
      this.audio.addEventListener('error', () => {
        if (this.audio && this.currentTrack && !this.audio.src.includes('zimlab.com')) {
          this.audio.src = `https://www.zimlab.com/wizardry/music/w1/${this.currentTrack}.mp3`;
          if (this.enabled) {
            this.audio.play().catch(() => {});
          }
        }
      });
    }
    return this.audio;
  }

  private setupAutoplayUnlock() {
    if (this.unlockBound || typeof window === 'undefined') return;
    this.unlockBound = true;
    const resumeOnInteraction = () => {
      if (this.enabled && this.audio && this.audio.paused && this.currentTrack) {
        this.audio.play().catch(() => {});
      }
    };
    window.addEventListener('pointerdown', resumeOnInteraction, { passive: true });
    window.addEventListener('keydown', resumeOnInteraction, { passive: true });
  }

  public playTrack(track: WizardryTrackId) {
    const audio = this.ensureAudio();
    if (!audio) return;

    const loopTrack = track !== '11-exterminated';
    audio.loop = loopTrack;

    if (this.currentTrack !== track) {
      this.currentTrack = track;
      audio.src = `./music/w1/${track}.mp3`;
      audio.currentTime = 0;
    }

    if (this.enabled) {
      if (audio.paused) {
        audio.play().catch(() => {
          // Will automatically start on first pointerdown/keydown
        });
      }
    } else {
      audio.pause();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('wiz_music_enabled', val ? 'true' : 'false');
    }
    const audio = this.ensureAudio();
    if (!audio) return;
    if (val && this.currentTrack) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getCurrentTrack(): WizardryTrackId | null {
    return this.currentTrack;
  }

  public getCurrentTrackTitle(): string {
    return this.currentTrack ? TRACK_TITLES[this.currentTrack] : '';
  }
}

export const music = new MusicManager();
