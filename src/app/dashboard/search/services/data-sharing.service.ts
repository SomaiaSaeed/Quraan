import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataSharingService {
    private selectedDataSubject = new BehaviorSubject<{ data: any[], searchQuery: string }>({ data: [], searchQuery: '' });
    selectedData$ = this.selectedDataSubject.asObservable();

    updateSelectedData(data: any[], searchQuery: string) {
        const combinedData = { data, searchQuery };
        this.selectedDataSubject.next(combinedData);
    }
}