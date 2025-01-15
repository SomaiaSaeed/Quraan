import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataSharingService {
    private selectedDataSubject = new BehaviorSubject<{ data: any[], result: any[] }>({ data: [], result: [] });
    selectedData$ = this.selectedDataSubject.asObservable();

    updateSelectedData(data: any[], result: any[]) {
        // هنا نقوم بإرسال كائن يحتوي على data و result
        const combinedData = { data, result };
        this.selectedDataSubject.next(combinedData);
    }
}