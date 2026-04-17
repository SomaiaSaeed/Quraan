import { Component, OnInit } from '@angular/core';
import { Search } from 'src/app/core/services/search.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListenService, READERS } from '../../services/listen.service';
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
	form: FormGroup;
	searchInstance = new Search();
	readers = READERS;
	readerOpen   = true;
	rangeOpen    = true;
	repeatOpen   = true;
	advancedOpen = false;
	saved        = false;

	repeatEachAya = 1;
	repeatRange    = 1;
	readonly repeatOptions = [1, 2, 3, 5, 10];
	suraNames: string[] = [];
	ayaNumbersFrom: number[] = [];
	ayaNumbersTo: number[] = [];
	audioFiles: Track[] = [];
	ayaNumbersFromIds: number[] = [];
	ayaNumbersToIds: number[] = [];
	uniqueJozNumbersList: number[] = [];
	hezbList: number[] = [];
	rubList: string[] = [];
	pagesList: number[] = [];

	constructor(private fb: FormBuilder, public _listenService: ListenService) {
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
		this.getSuraNames();
		this._restoreSettings();
	}

	saveSettings(): void {
		const settings = {
			readerId:      this._listenService.selectedReader.id,
			repeatEachAya: this.repeatEachAya,
			repeatRange:   this.repeatRange,
		};
		localStorage.setItem('listenSettings', JSON.stringify(settings));
		this.saved = true;
		setTimeout(() => this.saved = false, 2000);
	}

	private _restoreSettings(): void {
		const raw = localStorage.getItem('listenSettings');
		if (!raw) return;
		try {
			const s = JSON.parse(raw);
			if (s.readerId) {
				const r = READERS.find(r => r.id === s.readerId);
				if (r) this._listenService.setReader(r);
			}
			if (s.repeatEachAya) this.repeatEachAya = s.repeatEachAya;
			if (s.repeatRange)   this.repeatRange   = s.repeatRange;
		} catch {}
	}

	getSuraNames() {
		this.suraNames = [...new Set(this.searchInstance.table_othmani.map(item => item.Sura_Name))];
	}


	// تحديث الايات بناء على اختيار السور
	updateAyaNumbers(type: 'from' | 'to') {
		const selectedSura = this.form.get(`sura${type.charAt(0).toUpperCase() + type.slice(1)}`)?.value;

		if (selectedSura) {
			const suraData = this.searchInstance.table_othmani.filter(item => item.Sura_Name === selectedSura);

			const ayaNumbers = suraData.map(item => Number(item.Aya_N));
			const ayaIds = suraData.map(item => Number(item.id)); 

			if (type === 'from') {
				this.ayaNumbersFrom = ayaNumbers;
				this.ayaNumbersFromIds = ayaIds;
				this.form.get('ayaFrom')?.setValue('');
			} else {
				this.ayaNumbersTo = ayaNumbers;
				this.ayaNumbersToIds = ayaIds;
				this.form.get('ayaTo')?.setValue('');
			}
		} else {
			if (type === 'from') {
				this.ayaNumbersFrom = [];
				this.ayaNumbersFromIds = [];
			} else {
				this.ayaNumbersTo = [];
				this.ayaNumbersToIds = [];
			}
		}

	}

	// تحديث مصفوفة ملفات الصوت بعد اختيار عدد الايات من - إلى
	generateAyaNumbers() {
		const ayaFrom = Number(this.form.get('ayaFrom')?.value);
		const ayaTo = Number(this.form.get('ayaTo')?.value);
		const selectedSuraFrom = this.form.get('suraFrom')?.value;
		const selectedSuraTo = this.form.get('suraTo')?.value;

		const allAyatSorted = this.searchInstance.table_othmani.sort((a, b) => Number(a.id) - Number(b.id));

		const startAya = allAyatSorted.find(item =>
			item.Sura_Name === selectedSuraFrom && Number(item.Aya_N) === ayaFrom
		);

		const endAya = allAyatSorted.find(item =>
			item.Sura_Name === selectedSuraTo && Number(item.Aya_N) === ayaTo
		);

		const startId = Number(startAya.id);
		const endId = Number(endAya.id);

		const filteredAyat = allAyatSorted.filter(item => {
			const itemId = Number(item.id);
			return itemId >= startId && itemId <= endId;
		});

		if (ayaFrom && ayaTo) {
			this.audioFiles = this.buildAudioFiles(filteredAyat);
			this.generateJozNumbers();
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

				this.uniqueJozNumbersList = uniqueJozNumbers;
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

		this.hezbList = hezbNumbers;
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

		this.rubList = rubNumbers;
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

		this.pagesList = pagesNumbers;
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

		this.audioFiles = this.buildAudioFiles(filteredAyat);
	}

	private buildAudioFiles(filteredAyat: any[]): Track[] {
		return filteredAyat.map(item => ({
			title: item.AyaText_Othmani,
			link: this._listenService.buildAudioUrl(item.id)
		}));
	}

	resetForm(){
		this.form.reset();
		this.repeatEachAya = 1;
		this.repeatRange = 1;
	}

}



