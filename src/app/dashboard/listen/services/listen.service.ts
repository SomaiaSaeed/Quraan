import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class ListenService {

	constructor() { }

}
