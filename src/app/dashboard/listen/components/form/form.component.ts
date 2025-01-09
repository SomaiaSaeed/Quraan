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
	ayaIdsFrom: any[] = [];
	ayaIdsTo: any[] = [];
	selectedAyaIds: number[] = [];
	uniqueJozNumbersList: number[] = [];
	hezbList: number[] = [];
	rubList:string[] = [];
	pagesList:number[] = []

	constructor(private fb: FormBuilder, private _listenService: ListenService) {
		// إنشاء النموذج باستخدام FormBuilder
		this.form = this.fb.group({
			suraFrom: ['',Validators],
			ayaFrom: ['',Validators],
			suraTo: ['',Validators],
			ayaTo: ['',Validators],
			JozFrom: ['',Validators],
			JozTo: ['',Validators],
			hezbFrom: ['',Validators],
			hezbTo: ['',Validators],
			rubFrom:['',Validators],
			rubTo:['',Validators],
			pageFrom:['',Validators],
			pageTo:['', Validators],
		});
	}

	ngOnInit(): void {
		this.getSuraNames()
	}

	getSuraNames() {
		this.suraNames = [...new Set(this.searchInstance.table_othmani.map(item => item.Sura_Name))];
	}


	updateAyaNumbers(type: 'from' | 'to') {
		const selectedSura = this.form.get(`sura${type.charAt(0).toUpperCase() + type.slice(1)}`)?.value;

		// console.log("selectedSura", selectedSura);

		if (selectedSura) {
			// إيجاد كل الآيات الخاصة بالسورة المختارة
			const suraData = this.searchInstance.table_othmani.filter(item => item.Sura_Name === selectedSura);
			// console.log("suraData", suraData);

			// استخراج أرقام الآيات الفعلية
			const ayaNumbers = suraData.map(item => Number(item.Aya_N));
			const ayaIds = suraData.map(item => Number(item.id));  // إضافة id لكل آية

			if (type === 'from') {
				this.ayaNumbersFrom = ayaNumbers;  // لاستخدامها في الـ HTML
				this.ayaIdsFrom = ayaIds;  // لاستخدامها داخلياً
				this.form.get('ayaFrom')?.setValue('');  // إعادة تعيين القيمة
			} else {
				this.ayaNumbersTo = ayaNumbers;  // لاستخدامها في الـ HTML
				this.ayaIdsTo = ayaIds;  // لاستخدامها داخلياً
				this.form.get('ayaTo')?.setValue('');
			}
		} else {
			// إذا لم يتم اختيار السورة
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

	// تحديث المصفوفة ملفات الصوت بعد اختيار عدد الايات من - إلى
	generateAyaNumbers() {
		const ayaFrom = Number(this.form.get('ayaFrom')?.value);
		const ayaTo = Number(this.form.get('ayaTo')?.value);
		const selectedSuraFrom = this.form.get('suraFrom')?.value;
		const selectedSuraTo = this.form.get('suraTo')?.value;

		console.log("ayaFrom:", ayaFrom);
		console.log("ayaTo:", ayaTo);
		console.log("selectedSuraFrom:", selectedSuraFrom);
		console.log("selectedSuraTo:", selectedSuraTo);

		// جلب جميع الآيات مرتبة حسب الـ ID
		const allAyatSorted = this.searchInstance.table_othmani.sort((a, b) => Number(a.id) - Number(b.id));

		// إيجاد الـ ID للآية البداية
		const startAya = allAyatSorted.find(item =>
			item.Sura_Name === selectedSuraFrom && Number(item.Aya_N) === ayaFrom
		);

		// إيجاد الـ ID للآية النهاية
		const endAya = allAyatSorted.find(item =>
			item.Sura_Name === selectedSuraTo && Number(item.Aya_N) === ayaTo
		);

		// if (!startAya || !endAya) {
		// 	console.error("لم يتم العثور على الآيات المطلوبة.");
		// 	return [];
		// }

		const startId = Number(startAya.id);
		const endId = Number(endAya.id);

		// تصفية الآيات التي تقع بين الآيتين بناءً على ID
		const filteredAyat = allAyatSorted.filter(item => {
			const itemId = Number(item.id);
			return itemId >= startId && itemId <= endId;
		});

		// استخراج أرقام الآيات
		const ayaNumbers = filteredAyat.map(item => Number(item.Aya_N));

		console.log("Generated Aya Numbers:", ayaNumbers);
		// return ayaNumbers;

		if (ayaFrom && ayaTo) {
			// this.selectedAyaNumbers = Array.from({ length: ayaTo - ayaFrom + 1 }, (_, i) => i + ayaFrom);
			this.selectedAyaNumbers = ayaNumbers
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
			this.generateJozNumbers()
			console.log(this.audioFiles);  // تحقق من المصفوفة
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

			// استخراج القيم الفريدة للخاصية nOFJoz
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

		// جلب جميع الآيات بين الآية "من" والآية "إلى" مع مراعاة ترتيب السور
		const filteredAyat = this.searchInstance.table_othmani.filter(item => {
			const suraOrder = Number(item.nOFSura);
			const ayaNumber = Number(item.nOFJoz);

			// تحقق من الآيات داخل السورة الأولى
			if (item.Sura_Name === selectedSuraFrom && ayaNumber >= JozFrom) {
				return true;
			}

			// تحقق من الآيات داخل السورة الأخيرة
			if (item.Sura_Name === selectedSuraTo && ayaNumber <= JozTo) {
				return true;
			}

			// تحقق من الآيات بين السورتين (إذا كانوا مختلفين)
			if (suraOrder > Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraFrom)?.nOFSura) &&
				suraOrder < Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraTo)?.nOFSura)) {
				return true;
			}

			return false;
		});

		// استخراج الأحزاب الفريدة فقط في النطاق المحدد
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

		// جلب جميع الآيات بين الآية "من" والآية "إلى" مع مراعاة ترتيب السور
		const filteredAyat = this.searchInstance.table_othmani.filter(item => {
			const suraOrder = Number(item.nOFSura);
			const hezbNumber = Number(item.nOFHezb);

			// تحقق من الآيات داخل السورة الأولى
			if (item.Sura_Name === selectedSuraFrom && hezbNumber >= hezbFrom) {
				return true;
			}

			// تحقق من الآيات داخل السورة الأخيرة
			if (item.Sura_Name === selectedSuraTo && hezbNumber <= hezbTo) {
				return true;
			}

			// تحقق من الآيات بين السورتين (إذا كانوا مختلفين)
			if (suraOrder > Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraFrom)?.nOFSura) &&
				suraOrder < Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraTo)?.nOFSura)) {
				return true;
			}

			return false;
		});

		// استخراج الأحزاب الفريدة فقط في النطاق المحدد
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

		// جلب جميع الآيات بين الآية "من" والآية "إلى" مع مراعاة ترتيب السور
		const filteredAyat = this.searchInstance.table_othmani.filter(item => {
			const suraOrder = Number(item.nOFSura);
			const hezbNumber = Number(item.nOFHezb);

			// تحقق من الآيات داخل السورة الأولى
			if (item.Sura_Name === selectedSuraFrom && hezbNumber >= rubFrom) {
				return true;
			}

			// تحقق من الآيات داخل السورة الأخيرة
			if (item.Sura_Name === selectedSuraTo && hezbNumber <= rubTo) {
				return true;
			}

			// تحقق من الآيات بين السورتين (إذا كانوا مختلفين)
			if (suraOrder > Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraFrom)?.nOFSura) &&
				suraOrder < Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraTo)?.nOFSura)) {
				return true;
			}

			return false;
		});

		// استخراج الأحزاب الفريدة فقط في النطاق المحدد
		const pagesNumbers = [...new Set(filteredAyat.map(item => item.nOFPage))];

		this.pagesList = pagesNumbers

		console.log('الصفحات الموجودة بين الأربع التي تم اختيارها:', pagesNumbers);
		return pagesNumbers;
	}




	// if (ayaFrom && ayaTo) {
	// 	this.selectedAyaNumbers = Array.from({ length: ayaTo - ayaFrom + 1 }, (_, i) => i + ayaFrom);

	// 	// إنشاء مصفوفة Track تحتوي على { title, src }
	// 	this.audioFiles = this.selectedAyaNumbers.map(ayahNumber => {
	// 		// البحث عن نص الآية في table_othmani باستخدام Aya_N
	// 		const aya = this.searchInstance.table_othmani.find(item => item.Aya_N === String(ayahNumber)); // التأكد من أن Aya_N هو string
	// 		const title = aya ? aya.AyaText_Othmani : `Ayah ${ayahNumber}`; // استخدام AyaText_Othmani إذا وجد

	// 		return {
	// 			title: title, // النص المستخرج
	// 			link: `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${ayahNumber}.mp3`
	// 		};
	// 	});

	// 	console.log(this.audioFiles);  // تحقق من المصفوفة
	// }




























	updateToAya() { }
	updateFromAya() { }
	u() { }
	onSubmit() { }
}



