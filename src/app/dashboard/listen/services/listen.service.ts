import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class ListenService {
	url = "http://api.alquran.cloud/v1/surah/";

	constructor(private httpClint: HttpClient) { }

	soraName(number: any): Observable<any> {
		return this.httpClint.get(`${this.url}` + number).pipe(
			tap((sora: any) => {
				if (sora.length < 0) {
					throw new Error("This is an error0");
				}
				return sora;
			}),
		)
	}


}
