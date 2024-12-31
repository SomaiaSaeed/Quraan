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
	fromSora: any; // القيمة المختارة من ال select الأول
	toSora: any; // القيمة المختارة من ال select الثاني
	fromAya: any; // القيمة المختارة من ال select الأول
	toAya: any; // القيمة المختارة من ال select الثاني
	selectedSurah: any; // السورة المختارة
	selectedAyah: number | null = null; // الآية المختارة
	ayahs: any[] = []; // قائمة الآيات
	sounds: any;
	selectedAyahs: any[] = [];

	ayahLinks: string[] = [];
	suras: any[] = []; // أسماء السور

	constructor(private fb: FormBuilder, private _listenService: ListenService) {
		// إنشاء النموذج باستخدام FormBuilder
		this.form = this.fb.group({
			fromSoraSelect: ['', Validators.required],
			toSoraSelect: [''],
			fromAyaSelect: ['', Validators.required],
			toAyaSelect: ['', Validators.required],
		});
	}

	ngOnInit(): void {
		this.getSoras();
		this.loadAllAyahs()
	}

	  // تحميل جميع الروابط الصوتية
	  loadAllAyahs(): void {
		this._listenService.getAllAyahs().subscribe((links) => {
		  this.ayahLinks = links;
			console.log("this.ayahLinks",this.ayahLinks)
		});
	  }
	
	  // تحميل السور
	  loadSuras(id: number): void {
		this._listenService.getSurahAyahs(id).subscribe((response: any) => {
		  this.ayahs = [...response];
		  console.log("this.suras",this.ayahs)
		});
	  }


	//Get soras
	getSoras() {
		this._listenService.getAllSoras().subscribe((response: any) => {
			this.soras = response.data; // تحميل الخيارات
			console.log("response", response)
		});
	}

	//Get ayas
	// onSurahChange(id: number): void {
	// 	this._listenService.getSurahById(id).subscribe((response) => {
	// 		const totalAyahs = response.data.numberOfAyahs;
	// 		this.ayahs = Array.from({ length: totalAyahs }, (_, i) => i + 1);
	// 	});
	// }

	generateAudioLinks(): void {
		const fromAya = this.form.get('fromAya')?.value;
		const toAya = this.form.get('toAya')?.value;

		this.selectedAyahs = [];  // مصفوفة لتخزين روابط الصوت

		// إنشاء روابط الصوت لكل آية من الآية المحددة
		for (let ayah = fromAya; ayah <= toAya; ayah++) {
			const audioLink = `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${ayah}.mp3`; // رابط الصوت للآية
			this.selectedAyahs.push(audioLink);  // إضافة الرابط للمصفوفة
		}

		console.log(this.selectedAyahs);  // تحقق من المصفوفة النهائية
	}

	updateFromAya() {
		this.fromSora = this.form.get('fromSoraSelect')?.value;
		this.loadSuras(this.fromSora.number)
	}

	updateToAya() {
		this.toSora = this.form.get('toSoraSelect')?.value;
		this.loadSuras(this.toSora.number)

	}

	u() {
		this.generateAudioLinks();
		console.log("sds", this.selectedAyahs)
	}

	onSubmit(): void {
		this.generateAudioLinks();
		console.log(this.form.value); // إخراج بيانات النموذج عند الإرسال
	}
}
