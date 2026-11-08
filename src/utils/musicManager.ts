/**
 * Wizardry I Background Music Manager
 * Plays the 13 iconic "We Love Wizardry" (Kentaro Haneda) tracks matching each game location/tab,
 * as well as authentic original piano pieces by Léo Jean (YouTube @LeoJean890) seamlessly
 * blended into dungeon labyrinth exploration.
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

export interface DungeonTrackDef {
  id: string;
  file: string;
  title: string;
  shortTitle: string;
  artist: string;
  youtubeUrl?: string;
  weight: number;
  styleMoodFr: string;
  styleMoodEn: string;
  copyrightNoticeFr?: string;
  copyrightNoticeEn?: string;
}

export interface ActiveTrackInfo {
  id: string;
  file: string;
  title: string;
  shortTitle: string;
  artist: string;
  fullTitle: string;
  isExternalArtist: boolean;
  youtubeUrl?: string;
  styleMoodFr?: string;
  styleMoodEn?: string;
  copyrightNoticeFr?: string;
  copyrightNoticeEn?: string;
}

const LEO_JEAN_YOUTUBE = 'https://www.youtube.com/@LeoJean890';
const LEO_JEAN_NOTICE_FR = "Musique originale composée et interprétée au piano par Léo Jean. Diffusée avec l'aimable autorisation de l'artiste sur la chaîne YouTube @LeoJean890. © Léo Jean — Tous droits réservés à l'artiste.";
const LEO_JEAN_NOTICE_EN = "Original piano composition by Léo Jean. Broadcast with kind permission from the artist (@LeoJean890 YouTube channel). © Léo Jean — All rights reserved to the artist.";

export const DUNGEON_TRACKS: DungeonTrackDef[] = [
  {
    id: '08-dungeon',
    file: './music/w1/08-dungeon.mp3',
    title: 'Dungeon Labyrinth (We Love Wizardry)',
    shortTitle: 'Dungeon Labyrinth',
    artist: 'Kentaro Haneda',
    weight: 35,
    styleMoodFr: 'Thème classique officiel Wizardry (1981)',
    styleMoodEn: 'Classic official Wizardry 1981 theme'
  },
  {
    id: 'leojean-01-errance',
    file: './music/leojean/01-errance.mp3',
    title: 'Errance (Original Piano Composition)',
    shortTitle: 'Errance',
    artist: 'Léo Jean',
    youtubeUrl: LEO_JEAN_YOUTUBE,
    weight: 15,
    styleMoodFr: "Piano contemplatif & errance dans l'obscurité",
    styleMoodEn: 'Contemplative piano & roaming in the dark',
    copyrightNoticeFr: LEO_JEAN_NOTICE_FR,
    copyrightNoticeEn: LEO_JEAN_NOTICE_EN
  },
  {
    id: 'leojean-02-melancolie',
    file: './music/leojean/02-melancolie.mp3',
    title: 'Mélancolie (Original Piano Composition)',
    shortTitle: 'Mélancolie',
    artist: 'Léo Jean',
    youtubeUrl: LEO_JEAN_YOUTUBE,
    weight: 12,
    styleMoodFr: 'Nocturne poignant & gravité souterraine',
    styleMoodEn: 'Poignant nocturne & subterranean gravity',
    copyrightNoticeFr: LEO_JEAN_NOTICE_FR,
    copyrightNoticeEn: LEO_JEAN_NOTICE_EN
  },
  {
    id: 'leojean-03-crepuscule',
    file: './music/leojean/03-crepuscule.mp3',
    title: 'Crépuscule (Original Piano Composition)',
    shortTitle: 'Crépuscule',
    artist: 'Léo Jean',
    youtubeUrl: LEO_JEAN_YOUTUBE,
    weight: 10,
    styleMoodFr: 'Pénombre mystérieuse & ombres arcaniques',
    styleMoodEn: 'Mysterious twilight & arcane shadows',
    copyrightNoticeFr: LEO_JEAN_NOTICE_FR,
    copyrightNoticeEn: LEO_JEAN_NOTICE_EN
  },
  {
    id: 'leojean-04-chant-des-sirenes',
    file: './music/leojean/04-chant-des-sirenes.mp3',
    title: 'Chant des sirènes (Original Piano Composition)',
    shortTitle: 'Chant des sirènes',
    artist: 'Léo Jean',
    youtubeUrl: LEO_JEAN_YOUTUBE,
    weight: 8,
    styleMoodFr: 'Mélodie énigmatique & sortilèges anciens',
    styleMoodEn: 'Enigmatic melody & ancient spells',
    copyrightNoticeFr: LEO_JEAN_NOTICE_FR,
    copyrightNoticeEn: LEO_JEAN_NOTICE_EN
  },
  {
    id: 'leojean-05-reveries',
    file: './music/leojean/05-reveries.mp3',
    title: 'Rêveries (Original Piano Composition)',
    shortTitle: 'Rêveries',
    artist: 'Léo Jean',
    youtubeUrl: LEO_JEAN_YOUTUBE,
    weight: 7,
    styleMoodFr: 'Songes éthérés & cartographie paisible',
    styleMoodEn: 'Ethereal reveries & peaceful mapping',
    copyrightNoticeFr: LEO_JEAN_NOTICE_FR,
    copyrightNoticeEn: LEO_JEAN_NOTICE_EN
  },
  {
    id: 'leojean-06-marche-sous-la-pluie',
    file: './music/leojean/06-marche-sous-la-pluie.mp3',
    title: 'Marche sous la pluie (Original Piano Composition)',
    shortTitle: 'Marche sous la pluie',
    artist: 'Léo Jean',
    youtubeUrl: LEO_JEAN_YOUTUBE,
    weight: 5,
    styleMoodFr: 'Pas mesurés dans les cavernes humides',
    styleMoodEn: 'Rhythmic steps in damp stone caverns',
    copyrightNoticeFr: LEO_JEAN_NOTICE_FR,
    copyrightNoticeEn: LEO_JEAN_NOTICE_EN
  },
  {
    id: 'leojean-07-balades-au-fil-de-leau',
    file: './music/leojean/07-balades-au-fil-de-leau.mp3',
    title: "Balades au fil de l'eau (Original Piano Composition)",
    shortTitle: "Balades au fil de l'eau",
    artist: 'Léo Jean',
    youtubeUrl: LEO_JEAN_YOUTUBE,
    weight: 3,
    styleMoodFr: 'Arpèges délicats & cours d’eau souterrains',
    styleMoodEn: 'Delicate arpeggios & underground streams',
    copyrightNoticeFr: LEO_JEAN_NOTICE_FR,
    copyrightNoticeEn: LEO_JEAN_NOTICE_EN
  },
  {
    id: 'leojean-08-balade-nostalgique',
    file: './music/leojean/08-balade-nostalgique.mp3',
    title: 'Balade nostalgique (Original Piano Composition)',
    shortTitle: 'Balade nostalgique',
    artist: 'Léo Jean',
    youtubeUrl: LEO_JEAN_YOUTUBE,
    weight: 3,
    styleMoodFr: 'Thème lyrique à la mémoire des disparus',
    styleMoodEn: 'Lyrical theme in memory of the lost',
    copyrightNoticeFr: LEO_JEAN_NOTICE_FR,
    copyrightNoticeEn: LEO_JEAN_NOTICE_EN
  },
  {
    id: 'leojean-09-impression-soleil-levant',
    file: './music/leojean/09-impression-soleil-levant.mp3',
    title: 'Impression soleil levant (Piano & Violin)',
    shortTitle: 'Impression soleil levant',
    artist: 'Léo Jean',
    youtubeUrl: LEO_JEAN_YOUTUBE,
    weight: 2,
    styleMoodFr: 'Duo piano-violon & réminiscence de surface',
    styleMoodEn: 'Piano-violin duet & surface reminiscence',
    copyrightNoticeFr: LEO_JEAN_NOTICE_FR,
    copyrightNoticeEn: LEO_JEAN_NOTICE_EN
  },
  {
    id: 'leojean-10-veillee-printaniere',
    file: './music/leojean/10-veillee-printaniere.mp3',
    title: 'Veillée printanière (Original Piano Composition)',
    shortTitle: 'Veillée printanière',
    artist: 'Léo Jean',
    youtubeUrl: LEO_JEAN_YOUTUBE,
    weight: 2,
    styleMoodFr: 'Longue veillée épique & halte contemplative',
    styleMoodEn: 'Epic long vigil & contemplative rest',
    copyrightNoticeFr: LEO_JEAN_NOTICE_FR,
    copyrightNoticeEn: LEO_JEAN_NOTICE_EN
  }
];

export const TRACK_TITLES: Record<string, string> = {
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
  '13-complete': '13 · Quest Complete'
};

class MusicManager {
  private audio: HTMLAudioElement | null = null;
  private currentTrack: string | null = null;
  private isDungeonMode: boolean = false;
  private enabled: boolean = true;
  private volume: number = 0.38;
  private unlockBound: boolean = false;
  private activeTrackInfo: ActiveTrackInfo | null = null;

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
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';

      // Auto-advance to next dungeon track when current piece ends
      this.audio.addEventListener('ended', () => {
        if (this.isDungeonMode && this.enabled) {
          this.playNextDungeonTrack();
        } else if (this.currentTrack !== '11-exterminated' && this.enabled) {
          if (this.audio) {
            this.audio.currentTime = 0;
            this.audio.play().catch(() => {});
          }
        }
      });

      // Fallback handling
      this.audio.addEventListener('error', () => {
        if (!this.audio) return;
        if (this.isDungeonMode && this.currentTrack !== '08-dungeon') {
          // If a custom track had an issue, fallback seamlessly to standard 08-dungeon
          this.playSpecificDungeonTrack('08-dungeon');
        } else if (this.currentTrack && !this.audio.src.includes('zimlab.com')) {
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

  /**
   * Weighted random selection prioritizing atmospheric pieces and avoiding immediate repetition
   */
  private selectNextDungeonTrack(excludeId?: string | null): DungeonTrackDef {
    const candidates = DUNGEON_TRACKS.filter(t => t.id !== excludeId);
    const pool = candidates.length > 0 ? candidates : DUNGEON_TRACKS;
    const totalWeight = pool.reduce((sum, t) => sum + t.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const track of pool) {
      if (rand < track.weight) return track;
      rand -= track.weight;
    }
    return pool[0];
  }

  private notifyTrackChange(info: ActiveTrackInfo) {
    this.activeTrackInfo = info;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wizardry_track_change', { detail: info }));
    }
  }

  public playSpecificDungeonTrack(trackId: string) {
    const trackDef = DUNGEON_TRACKS.find(t => t.id === trackId) || DUNGEON_TRACKS[0];
    const audio = this.ensureAudio();
    if (!audio) return;

    this.isDungeonMode = true;
    audio.loop = false; // Trigger 'ended' event to seamlessly switch tracks

    this.currentTrack = trackDef.id;
    audio.src = trackDef.file;
    audio.currentTime = 0;

    const isExternal = trackDef.artist.toLowerCase().includes('léo') || trackDef.artist.toLowerCase().includes('leo');
    const fullTitle = isExternal 
      ? `${trackDef.shortTitle} — ${trackDef.artist} (YouTube @LeoJean890)` 
      : `${trackDef.shortTitle} — ${trackDef.artist}`;

    this.notifyTrackChange({
      id: trackDef.id,
      file: trackDef.file,
      title: trackDef.title,
      shortTitle: trackDef.shortTitle,
      artist: trackDef.artist,
      fullTitle,
      isExternalArtist: isExternal,
      youtubeUrl: trackDef.youtubeUrl,
      styleMoodFr: trackDef.styleMoodFr,
      styleMoodEn: trackDef.styleMoodEn,
      copyrightNoticeFr: trackDef.copyrightNoticeFr,
      copyrightNoticeEn: trackDef.copyrightNoticeEn
    });

    if (this.enabled) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  public playNextDungeonTrack() {
    const nextTrack = this.selectNextDungeonTrack(this.currentTrack);
    this.playSpecificDungeonTrack(nextTrack.id);
  }

  public playTrack(track: WizardryTrackId | string) {
    const audio = this.ensureAudio();
    if (!audio) return;

    // Special case for dungeon exploration: randomized weighted playlist
    if (track === '08-dungeon') {
      if (this.isDungeonMode && this.currentTrack && (this.currentTrack === '08-dungeon' || this.currentTrack.startsWith('leojean-'))) {
        // Already playing dungeon music; keep current track playing smoothly
        if (this.enabled && audio.paused) {
          audio.play().catch(() => {});
        }
        return;
      }
      this.playNextDungeonTrack();
      return;
    }

    // Non-dungeon track
    this.isDungeonMode = false;
    const loopTrack = track !== '11-exterminated';
    audio.loop = loopTrack;

    if (this.currentTrack !== track) {
      this.currentTrack = track;
      audio.src = `./music/w1/${track}.mp3`;
      audio.currentTime = 0;

      const title = TRACK_TITLES[track] || track;
      this.notifyTrackChange({
        id: track,
        file: `./music/w1/${track}.mp3`,
        title,
        shortTitle: title,
        artist: 'Kentaro Haneda',
        fullTitle: `${title} — Kentaro Haneda`,
        isExternalArtist: false
      });
    }

    if (this.enabled) {
      if (audio.paused) {
        audio.play().catch(() => {});
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

  public getCurrentTrack(): string | null {
    return this.currentTrack;
  }

  public getActiveTrackInfo(): ActiveTrackInfo | null {
    return this.activeTrackInfo;
  }

  public getCurrentTrackTitle(): string {
    if (this.activeTrackInfo) {
      return this.activeTrackInfo.fullTitle;
    }
    return this.currentTrack ? (TRACK_TITLES[this.currentTrack] || this.currentTrack) : '';
  }
}

export const music = new MusicManager();
