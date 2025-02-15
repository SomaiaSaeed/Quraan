import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class ListenService {

	private Quraan_URL = environment.API_BASE_URL;
	private Quraan_SOUND = environment.Quraan_Sound_URL;

	constructor(private http: HttpClient) { }

	getAllSoras(): Observable<any> {
		return this.http.get<any>(this.Quraan_URL);
	}

	// استدعاء تفاصيل سورة معينة بناءً على رقمها
	getSurahById(id: number): Observable<any> {
		return this.http.get<any>(`${this.Quraan_URL}/${id}`);
	}

	generateAudioLink(ayahNumber: number): string {
		return `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${ayahNumber}.mp3`;
	}

	  getAllAyahs(): Observable<string[]> {
		return this.http.get(this.Quraan_URL).pipe(
		  map((response: any) => {
			const ayahLinks: string[] = [];
			let ayahNumber = 1;
	
			response.data.forEach((surah: any) => {
			  for (let i = 0; i < surah.numberOfAyahs; i++) {
				ayahLinks.push(`${this.Quraan_SOUND}/${ayahNumber}.mp3`);
				ayahNumber++;
			  }
			});
	
			return ayahLinks;
		  })
		);
	  }
	
	  getSurahAyahs(surahNumber: number): Observable<number> {
		return this.http.get(`${this.Quraan_URL}/${surahNumber}`).pipe(
		  map((response: any) => response.data.ayahs)
		);
	  }

}
