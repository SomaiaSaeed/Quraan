import { Component, OnInit } from '@angular/core';
import { Search } from 'src/app/core/services/search.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListenService } from '../../services/listen.service';
interface Track {
	title: string;
	link: string;
}
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


	searchInstance = new Search();  // إنشاء كائن من الكلاس
	suraNames: string[] = [];
	ayaNumbersFrom: number[] = [];
	ayaNumbersTo: number[] = [];
	selectedAyaNumbers: number[] = []; // مصفوفة لحفظ الأيات بين من و إلى
	audioFiles: Track[] = []; // مصفوفة ملفات الصوت


	constructor(private fb: FormBuilder, private _listenService: ListenService) {
		// إنشاء النموذج باستخدام FormBuilder
		this.form = this.fb.group({
			suraFrom: [''],
			ayaFrom: [''],
			suraTo: [''],
			ayaTo: ['']
		});
	}

	ngOnInit(): void {
		this.getSuraNames()
	}

	getSuraNames() {
		this.suraNames = [...new Set(this.searchInstance.table_othmani.map(item => item.Sura_Name))];
	}

	// تحديث أرقام الآيات بناءً على السورة المختارة
	updateAyaNumbers(type: 'from' | 'to') {
		const selectedSura = this.form.get(`sura${type.charAt(0).toUpperCase() + type.slice(1)}`)?.value;

		console.log("selectedSura", selectedSura)

		if (selectedSura) {
			// إيجاد كل الآيات الخاصة بالسورة المختارة
			const suraData = this.searchInstance.table_othmani.filter(item => item.Sura_Name === selectedSura);

			// استخراج أرقام الآيات الفعلية
			const ayaNumbers = suraData.map(item => Number(item.Aya_N));

			if (type === 'from') {
				this.ayaNumbersFrom = ayaNumbers;
				this.form.get('ayaFrom')?.setValue('');  // إعادة تعيين القيمة
			} else {
				this.ayaNumbersTo = ayaNumbers;
				this.form.get('ayaTo')?.setValue('');
			}
		} else {
			// إذا لم يتم اختيار السورة
			if (type === 'from') {
				this.ayaNumbersFrom = [];
			} else {
				this.ayaNumbersTo = [];
			}
		}
	}

	// تحديث المصفوفة بناءً على الأرقام المختارة (من - إلى)
	generateAyaNumbers() {
		const ayaFrom = this.form.get('ayaFrom')?.value;
		const ayaTo = this.form.get('ayaTo')?.value;

		if (ayaFrom && ayaTo) {
			this.selectedAyaNumbers = Array.from({ length: ayaTo - ayaFrom + 1 }, (_, i) => i + ayaFrom);

			// إنشاء مصفوفة Track تحتوي على { title, src }
			this.audioFiles = this.selectedAyaNumbers.map(ayahNumber => {
				// البحث عن نص الآية في table_othmani باستخدام Aya_N
				const aya = this.searchInstance.table_othmani.find(item => item.Aya_N === String(ayahNumber)); // التأكد من أن Aya_N هو string
				const title = aya ? aya.AyaText_Othmani : `Ayah ${ayahNumber}`; // استخدام AyaText_Othmani إذا وجد

				return {
					title: title, // النص المستخرج
					link: `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${ayahNumber}.mp3`
				};
			});

			console.log(this.audioFiles);  // تحقق من المصفوفة
		}
	}

	updateToAya() { }
	updateFromAya() { }
	u() { }
	onSubmit() { }
}
