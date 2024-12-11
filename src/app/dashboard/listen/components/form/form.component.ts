import { Component, OnInit } from '@angular/core';
import { Search } from 'src/app/core/services/search.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListenService } from '../../services/listen.service';

@Component({
	selector: 'app-form',
	templateUrl: './form.component.html',
	styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
	form: FormGroup; // تعريف النموذج
	soras: any[] = []; // قائمة الخيارات

	constructor(private fb: FormBuilder, private _listenService: ListenService) {
		// إنشاء النموذج باستخدام FormBuilder
		this.form = this.fb.group({
			FromSora: ['', Validators.required] // استخدام التحقق من الصحة
		});
	}

	ngOnInit(): void {
		this.getSoras()
	}

	// Get soras
	getSoras() {
		this._listenService.getSoras().subscribe((response: any) => {
			this.soras = response.data; // تحميل الخيارات
			console.log("response",response)
		});
	}

	onSubmit(): void {
		console.log(this.form.value); // إخراج بيانات النموذج عند الإرسال
	}
}
