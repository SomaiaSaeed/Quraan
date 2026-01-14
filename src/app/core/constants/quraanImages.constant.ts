// export const IMAGES: any[] = [
//     { id: 1, src: 'assets/images/2/1.png', alt: 'Image 1' },
//     { id: 2, src: 'assets/images/2/2.png', alt: 'Image 2' },
//     { id: 3, src: 'assets/images/2/3.png', alt: 'Image 3' },
//   ];

export const IMAGES: any[] = Array.from({ length: 10 }, (_, index) => { // length should be the total number of quran pages (6**)
  const id = index + 1;
  return {
    id,
    src: `assets/images/2/${id}.png`,
    alt: `Image ${id}`,
  };
});

export interface MotashabehatSpan {
  isRight: boolean;
  moade3: string;
  height: string;
  top: string;
}

export interface SpansOfColoredWords {
  top: string;
  left: string;
  width: string;
  color: string;
  isStatic?: boolean;
}

export interface InputItem {
  motashabehat: Motashabehat;
  ayat: any[]; // Replace 'any' with the proper type if known
  aya: string;
  ayaId: string;
  spans: Span[];
  motashabehatSpans: MotashabehatSpan[];
  spansOfColoredWords: SpansOfColoredWords[];
  isActive: boolean;
  href: string;
  activeAya: number;
  errorFactor: string;
}

interface Motashabehat {
  isRight: boolean;
  moade3: Moade3[];
  height: string;
  top: string;
}

interface Moade3 {
  aya: string;
  color: string;
  id: number;
  suraWithIndex: string;
  top: string;
}

interface Span {
  aya: string;
  top: string;
  left: string;
  width: string;
  height: string;
}

export interface MotashabehatSpan {
  isRight: boolean;
  moade3: string;
  height: string;
  top: string;
}

export interface SpansOfColoredWords {
  top: string;
  left: string;
  width: string;
  color: string;
  isStatic?: boolean;
}