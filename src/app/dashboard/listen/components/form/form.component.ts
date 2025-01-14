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
	searchInstance = new Search(); 
	suraNames: string[] = [];
	ayaNumbersFrom: number[] = [];
	ayaNumbersTo: number[] = [];
	selectedAyaNumbers: number[] = []; 
	audioFiles: Track[] = []; 
	ayaIdsFrom: any[] = [];
	ayaIdsTo: any[] = [];
	selectedAyaIds: number[] = [];
	uniqueJozNumbersList: number[] = [];
	hezbList: number[] = [];
	rubList: string[] = [];
	pagesList: number[] = [];
	ayatListOfPages: number[] = []

	constructor(private fb: FormBuilder, private _listenService: ListenService) {
		this.form = this.fb.group({
			suraFrom: ['', Validators.required],
			ayaFrom: ['', Validators.required],
			suraTo: ['', Validators.required],
			ayaTo: ['', Validators.required],
			JozFrom: ['', Validators.required],
			JozTo: ['', Validators.required],
			hezbFrom: ['', Validators.required],
			hezbTo: ['', Validators.required],
			rubFrom: ['', Validators.required],
			rubTo: ['', Validators.required],
			pageFrom: ['', Validators.required],
			pageTo: ['', Validators.required],
		});
	}

	ngOnInit(): void {
		this.getSuraNames()
	}

	getSuraNames() {
		this.suraNames = [...new Set(this.searchInstance.table_othmani.map(item => item.Sura_Name))];
	}


	// تحديث الايات بناء على اختيار السور
	updateAyaNumbers(type: 'from' | 'to') {
		const selectedSura = this.form.get(`sura${type.charAt(0).toUpperCase() + type.slice(1)}`)?.value;

		if (selectedSura) {
			// إيجاد كل الآيات الخاصة بالسورة المختارة
			const suraData = this.searchInstance.table_othmani.filter(item => item.Sura_Name === selectedSura);
			// console.log("suraData", suraData);

			// استخراج أرقام الآيات الفعلية
			const ayaNumbers = suraData.map(item => Number(item.Aya_N));
			const ayaIds = suraData.map(item => Number(item.id)); 

			if (type === 'from') {
				this.ayaNumbersFrom = ayaNumbers;
				this.ayaIdsFrom = ayaIds; 
				this.form.get('ayaFrom')?.setValue('');  
			} else {
				this.ayaNumbersTo = ayaNumbers;
				this.ayaIdsTo = ayaIds; 
				this.form.get('ayaTo')?.setValue('');
			}
		}
		 else {
			if (type === 'from') {
				this.ayaNumbersFrom = [];
				this.ayaIdsFrom = [];
			} else {
				this.ayaNumbersTo = [];
				this.ayaIdsTo = [];
			}
		}

		console.log("ayaIdsFrom", this.ayaIdsFrom);
		console.log("ayaIdsTo", this.ayaIdsTo);
	}

	// تحديث مصفوفة ملفات الصوت بعد اختيار عدد الايات من - إلى
	generateAyaNumbers() {
		const ayaFrom = Number(this.form.get('ayaFrom')?.value);
		const ayaTo = Number(this.form.get('ayaTo')?.value);
		const selectedSuraFrom = this.form.get('suraFrom')?.value;
		const selectedSuraTo = this.form.get('suraTo')?.value;

		console.log("ayaFrom:", ayaFrom);
		console.log("ayaTo:", ayaTo);
		console.log("selectedSuraFrom:", selectedSuraFrom);
		console.log("selectedSuraTo:", selectedSuraTo);

		//  جميع الآيات مرتبة حسب الـ ID
		const allAyatSorted = this.searchInstance.table_othmani.sort((a, b) => Number(a.id) - Number(b.id));

		const startAya = allAyatSorted.find(item =>
			item.Sura_Name === selectedSuraFrom && Number(item.Aya_N) === ayaFrom
		);

		const endAya = allAyatSorted.find(item =>
			item.Sura_Name === selectedSuraTo && Number(item.Aya_N) === ayaTo
		);

		const startId = Number(startAya.id);
		const endId = Number(endAya.id);

		// تصفية الآيات التي تقع بين الآيتين بناءً على ID
		const filteredAyat = allAyatSorted.filter(item => {
			const itemId = Number(item.id);
			return itemId >= startId && itemId <= endId;
		});

		const ayaNumbers = filteredAyat.map(item => Number(item.Aya_N));

		console.log("Generated Aya Numbers:", ayaNumbers);

		if (ayaFrom && ayaTo) {
			this.selectedAyaNumbers = ayaNumbers

			this.audioFiles = this.selectedAyaNumbers.map(ayahNumber => {

				const aya = this.searchInstance.table_othmani.find(item => item.Aya_N === String(ayahNumber)); 
				const title = aya ? aya.AyaText_Othmani : `Ayah ${ayahNumber}`;

				return {
					title: title, 
					link: `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${ayahNumber}.mp3`
				};
			});
			this.generateJozNumbers()
			console.log(this.audioFiles);
		}
	}

	// اختيار عدد الاجزاء بناء على تحديد الايات
	generateJozNumbers() {
		const ayaFrom = Number(this.form.get('ayaFrom')?.value);
		const ayaTo = Number(this.form.get('ayaTo')?.value);
		const selectedSuraFrom = this.form.get('suraFrom')?.value;
		const selectedSuraTo = this.form.get('suraTo')?.value;

		const startIndex = this.searchInstance.table_othmani.findIndex(
			item => item.Sura_Name === selectedSuraFrom && Number(item.Aya_N) === ayaFrom
		);
		const endIndex = this.searchInstance.table_othmani.findIndex(
			item => item.Sura_Name === selectedSuraTo && Number(item.Aya_N) === ayaTo
		);

		if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
			const ayatRange = this.searchInstance.table_othmani.slice(startIndex, endIndex + 1);

			const uniqueJozNumbers = Array.from(
				new Set(ayatRange.map(item => item.nOFJoz))
			);

			console.log("الأجزاء الفريدة:", uniqueJozNumbers);

			this.uniqueJozNumbersList = uniqueJozNumbers
		} else {
			console.error('تأكد من اختيار الآيات بشكل صحيح');
		}
	}

	// الفانكشن دي بتجيب عدد الاحزاب بناء على الايات الى انت اختارتها
	getHezbNumbersInRange() {
		const JozFrom = Number(this.form.get('JozFrom')?.value);
		const JozTo = Number(this.form.get('JozTo')?.value);

		const selectedSuraFrom = this.form.get('suraFrom')?.value;
		const selectedSuraTo = this.form.get('suraTo')?.value;

		const filteredAyat = this.searchInstance.table_othmani.filter(item => {
			const suraOrder = Number(item.nOFSura);
			const ayaNumber = Number(item.nOFJoz);

			if (item.Sura_Name === selectedSuraFrom && ayaNumber >= JozFrom) {
				return true;
			}

			if (item.Sura_Name === selectedSuraTo && ayaNumber <= JozTo) {
				return true;
			}

			if (suraOrder > Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraFrom)?.nOFSura) &&
				suraOrder < Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraTo)?.nOFSura)) {
				return true;
			}

			return false;
		});

		const hezbNumbers = [...new Set(filteredAyat.map(item => Number(item.nOFHezb)))];

		this.hezbList = hezbNumbers

		console.log('الأحزاب الموجودة بين الاجزاء التي تم اختيارها:', hezbNumbers);
		return hezbNumbers;
	}


	// عدد الاربع بناء على الاحزاب الى تم اختيارها
	getRubbNumbersInRange() {
		const hezbFrom = Number(this.form.get('hezbFrom')?.value);
		const hezbTo = Number(this.form.get('hezbTo')?.value);

		const selectedSuraFrom = this.form.get('suraFrom')?.value;
		const selectedSuraTo = this.form.get('suraTo')?.value;

		const filteredAyat = this.searchInstance.table_othmani.filter(item => {
			const suraOrder = Number(item.nOFSura);
			const hezbNumber = Number(item.nOFHezb);

			if (item.Sura_Name === selectedSuraFrom && hezbNumber >= hezbFrom) {
				return true;
			}

			if (item.Sura_Name === selectedSuraTo && hezbNumber <= hezbTo) {
				return true;
			}

			if (suraOrder > Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraFrom)?.nOFSura) &&
				suraOrder < Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraTo)?.nOFSura)) {
				return true;
			}

			return false;
		});

		const rubNumbers = [...new Set(filteredAyat.map(item => item.rub))];

		this.rubList = rubNumbers

		console.log('الأرباع الموجودة بين الاحزاب التي تم اختيارها:', rubNumbers);
		return rubNumbers;
	}

	// عدد الصفحات بناء على الاربع الى تم اختيارها
	getPagesNumbersInRange() {
		const rubFrom = Number(this.form.get('rubFrom')?.value);
		const rubTo = Number(this.form.get('rubTo')?.value);

		const selectedSuraFrom = this.form.get('suraFrom')?.value;
		const selectedSuraTo = this.form.get('suraTo')?.value;

		const filteredAyat = this.searchInstance.table_othmani.filter(item => {
			const suraOrder = Number(item.nOFSura);
			const hezbNumber = Number(item.nOFHezb);

			if (item.Sura_Name === selectedSuraFrom && hezbNumber >= rubFrom) {
				return true;
			}

			if (item.Sura_Name === selectedSuraTo && hezbNumber <= rubTo) {
				return true;
			}

			if (suraOrder > Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraFrom)?.nOFSura) &&
				suraOrder < Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraTo)?.nOFSura)) {
				return true;
			}

			return false;
		});

		const pagesNumbers = [...new Set(filteredAyat.map(item => item.nOFPage))];

		this.pagesList = pagesNumbers

		console.log('الصفحات الموجودة بين الأربع التي تم اختيارها:', pagesNumbers);
		return pagesNumbers;
	}

	// عدد الأيات بعد اختيار عدد الصفحات 
	getAyatOfOages() {
		const pageFrom = Number(this.form.get('pageFrom')?.value);
		const pageTo = Number(this.form.get('pageTo')?.value);

		const selectedSuraFrom = this.form.get('suraFrom')?.value;
		const selectedSuraTo = this.form.get('suraTo')?.value;

		const filteredAyat = this.searchInstance.table_othmani.filter(item => {
			const suraOrder = Number(item.nOFSura);
			const pages = Number(item.nOFPage);

			if (item.Sura_Name === selectedSuraFrom && pages >= pageFrom) {
				return true;
			}

			if (item.Sura_Name === selectedSuraTo && pages <= pageTo) {
				return true;
			}

			if (suraOrder > Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraFrom)?.nOFSura) &&
				suraOrder < Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraTo)?.nOFSura)) {
				return true;
			}

			return false;
		});

		const pagesNumbers = [...new Set(filteredAyat.map(item => item.Aya_N))];

		this.ayatListOfPages = pagesNumbers;

		console.log('الآيات الموجودة في الصفحات المختارة:', this.ayatListOfPages);

		// الصوتيات
		if (this.ayatListOfPages) {
			this.audioFiles = this.ayatListOfPages.map(ayahNumber => {
				// البحث عن نص الآية في table_othmani باستخدام Aya_N
				const aya = this.searchInstance.table_othmani.find(item => item.Aya_N === String(ayahNumber));
				const title = aya ? aya.AyaText_Othmani : `Ayah ${ayahNumber}`;

				return {
					title: title,
					link: `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${ayahNumber}.mp3`
				};
			});
			console.log("this.audioFiles222222",this.audioFiles)
		}
	}

	resetForm(){
		this.form.reset();
	}

}



