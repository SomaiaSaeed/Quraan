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

	constructor(private http: HttpClient) {}
  
	getSoras(): Observable<any> {
	  return this.http.get<any>(this.Quraan_URL);
	}

}
