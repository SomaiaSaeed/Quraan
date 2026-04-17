import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Reader {
  id: string;
  name: string;
}

export const READERS: Reader[] = [
  { id: 'ar.alafasy',             name: 'مشارى راشد العفاسى' },
  { id: 'ar.abdurrahmaansudais',  name: 'عبدالرحمن السديس' },
  { id: 'ar.husary',              name: 'محمود خليل الحصرى' },
  // { id: 'ar.minshawi',            name: 'محمد صديق المنشاوى' },
  { id: 'ar.abdullahbasfar',      name: 'عبدالله بصفر' },
  { id: 'ar.mahermuaiqly',        name: 'ماهر المعيقلى' },
  { id: 'ar.shaatree',            name: 'أبو بكر الشاطرى' },
  // { id: 'ar.ibrahimakhbar',       name: 'إبراهيم الأخضر' },
  { id: 'ar.hudhaify',             name: 'على الحذيفى' },
];

@Injectable({ providedIn: 'root' })
export class ListenService {

  private _reader = new BehaviorSubject<Reader>(READERS[0]);
  selectedReader$ = this._reader.asObservable();

  get selectedReader(): Reader { return this._reader.value; }

  setReader(reader: Reader): void { this._reader.next(reader); }

  buildAudioUrl(ayahId: number | string): string {
    return `https://cdn.islamic.network/quran/audio/64/${this.selectedReader.id}/${ayahId}.mp3`;
  }
}
