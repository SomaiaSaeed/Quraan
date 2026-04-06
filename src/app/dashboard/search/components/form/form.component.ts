import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Search } from "src/app/core/services/search.service";
import { ListenService } from "src/app/dashboard/listen/services/listen.service";
import { DataSharingService, ALL_COLUMNS, ColumnDef } from "../../services/data-sharing.service";
import { MatDialog } from "@angular/material/dialog";

interface Track { data: string; }

@Component({
	selector: "app-form",
	templateUrl: "./form.component.html",
	styleUrls: ["./form.component.scss"],
})
export class FormComponent implements OnInit {
	form: FormGroup;
	searchInstance = new Search();
	suraNames: string[] = [];
	ayaNumbersFrom: number[] = [];
	ayaNumbersTo: number[] = [];
	selectedAyaNumbers: number[] = [];
	dataAya: Track[] = [];
	ayaIdsFrom: any[] = [];
	ayaIdsTo: any[] = [];
	selectedAyaIds: number[] = [];
	uniqueJozNumbersList: number[] = [];
	hezbList: number[] = [];
	rubList: string[] = [];
	pagesList: number[] = [];
	ayatListOfPages: number[] = [];
	searchQuery: string = '';
	exactMatch: boolean = false;
	results: any[] = [];
	isOpenForm: boolean = true;
	@ViewChild('searchResult', { static: true }) searchResult!: TemplateRef<any>;

	// ── Columns multi-select ─────────────────────────────────────────────────
	readonly allColumns: ColumnDef[] = ALL_COLUMNS;
	selectedColumnKeys: Set<string> = new Set(ALL_COLUMNS.filter(c => c.isDefault).map(c => c.key));
	showColumnsPanel: boolean = false;

	readonly columnGroups = [
		{ key: 'aya',      label: 'الآية'    },
		{ key: 'sura',     label: 'السورة'   },
		{ key: 'division', label: 'التقسيم'  },
		{ key: 'page',     label: 'الصفحة'   },
	];

	columnsOf(group: string): ColumnDef[] {
		return this.allColumns.filter(c => c.group === group);
	}

	isColSelected(key: string): boolean {
		return this.selectedColumnKeys.has(key);
	}

	toggleColumn(key: string): void {
		const next = new Set(this.selectedColumnKeys);
		next.has(key) ? next.delete(key) : next.add(key);
		this.selectedColumnKeys = next;
		this.dataSharingService.updateColumns([...next]);
	}

	selectAllColumns(): void {
		this.selectedColumnKeys = new Set(this.allColumns.map(c => c.key));
		this.dataSharingService.updateColumns([...this.selectedColumnKeys]);
	}

	resetColumnsToDefault(): void {
		this.dataSharingService.resetColumns();
		this.selectedColumnKeys = new Set(this.dataSharingService.currentColumns);
	}

	get selectedColumnsCount(): number { return this.selectedColumnKeys.size; }


	constructor(private fb: FormBuilder, private _listenService: ListenService, private dataSharingService: DataSharingService, public dialog: MatDialog) {
		this.form = this.fb.group({
			suraFrom: [''],
			ayaFrom: [''],
			suraTo: [''],
			ayaTo: [''],
			JozFrom: [''],
			JozTo: [''],
			hezbFrom: [''],
			hezbTo: [''],
			rubFrom: [''],
			rubTo: [''],
			pageFrom: [''],
			pageTo: [''],
		});
	}

	ngOnInit(): void {
		// this.testSearchWithTashkeel(); // uncomment to run tashkeel coverage test
		this.getSuraNames();
		const savedData = localStorage.getItem('searchFormData');
		if (savedData) {
		  const formData = JSON.parse(savedData);
		  // Build all option lists directly from saved values (no cascade dependency)
		  this.restoreDropdownOptions(formData);
		  // After one tick all <mat-option> lists are rendered — patch values
		  setTimeout(() => {
		    this.form.patchValue(formData);
		  }, 0);
		  this.isOpenForm = false;
		}

		const savedExactMatch = localStorage.getItem('exactMatch');
		if (savedExactMatch !== null) {
		  this.exactMatch = savedExactMatch === 'true';
		}

		// Sync column selection from service (which already loaded from localStorage)
		this.selectedColumnKeys = new Set(this.dataSharingService.currentColumns);
	}

	getSuraNames() {
		this.suraNames = [...new Set(this.searchInstance.table_othmani.map(item => item.Sura_Name))];
	}

	/**
	 * Restores all dropdown option lists from saved formData using a proper cascade:
	 * each level filters its options from the subset produced by the level above it.
	 */
	private restoreDropdownOptions(f: any): void {
		const all    = this.searchInstance.table_othmani;
		const sorted = [...all].sort((a: any, b: any) => Number(a.id) - Number(b.id));

		// ── 1. Aya options (per sura) ─────────────────────────────────────────
		if (f.suraFrom) {
			const data = all.filter((item: any) => item.Sura_Name === f.suraFrom);
			this.ayaNumbersFrom = data.map((item: any) => Number(item.Aya_N));
			this.ayaIdsFrom     = data.map((item: any) => Number(item.id));
		}
		if (f.suraTo) {
			const data = all.filter((item: any) => item.Sura_Name === f.suraTo);
			this.ayaNumbersTo = data.map((item: any) => Number(item.Aya_N));
			this.ayaIdsTo     = data.map((item: any) => Number(item.id));
		}

		// ── 2. Sura range → base subset ──────────────────────────────────────
		let baseSubset: any[];

		const startAya = f.suraFrom && f.ayaFrom
			? sorted.find((item: any) => item.Sura_Name === f.suraFrom && Number(item.Aya_N) === Number(f.ayaFrom))
			: sorted.find((item: any) => item.Sura_Name === f.suraFrom);

		const endAya = f.suraTo && f.ayaTo
			? sorted.find((item: any) => item.Sura_Name === f.suraTo && Number(item.Aya_N) === Number(f.ayaTo))
			: sorted.filter((item: any) => item.Sura_Name === f.suraTo).pop();

		if (startAya && endAya) {
			baseSubset = sorted.filter((item: any) =>
				Number(item.id) >= Number(startAya.id) && Number(item.id) <= Number(endAya.id)
			);
			this.selectedAyaNumbers = baseSubset.map((item: any) => Number(item.Aya_N));
		} else {
			baseSubset = sorted; // no sura filter saved — use full Quran
		}

		// ── 3. Juz options from base subset ──────────────────────────────────
		this.uniqueJozNumbersList = [...new Set(baseSubset.map((item: any) => Number(item.nOFJoz)))]
			.sort((a, b) => a - b);

		// ── 4. Juz range → juz subset ────────────────────────────────────────
		const jozFrom = Number(f.JozFrom);
		const jozTo   = Number(f.JozTo);
		const jozSubset = (jozFrom && jozTo)
			? baseSubset.filter((item: any) => {
				const j = Number(item.nOFJoz);
				return j >= jozFrom && j <= jozTo;
			  })
			: baseSubset;

		// ── 5. Hezb options from juz subset ──────────────────────────────────
		this.hezbList = [...new Set(jozSubset.map((item: any) => Number(item.nOFHezb)))]
			.sort((a, b) => a - b);

		// ── 6. Hezb range → hezb subset ──────────────────────────────────────
		const hezbFrom = Number(f.hezbFrom);
		const hezbTo   = Number(f.hezbTo);
		const hezbSubset = (hezbFrom && hezbTo)
			? jozSubset.filter((item: any) => {
				const h = Number(item.nOFHezb);
				return h >= hezbFrom && h <= hezbTo;
			  })
			: jozSubset;

		// ── 7. Rub options from hezb subset ──────────────────────────────────
		this.rubList = [...new Set(hezbSubset.map((item: any) => item.rub))];

		// ── 8. Rub range → rub subset ────────────────────────────────────────
		const rubFrom  = f.rubFrom;
		const rubTo    = f.rubTo;
		let rubSubset  = hezbSubset;
		if (rubFrom && rubTo) {
			const fromIdx = this.rubList.indexOf(rubFrom);
			const toIdx   = this.rubList.indexOf(rubTo);
			if (fromIdx !== -1 && toIdx !== -1) {
				const selectedRubs = this.rubList.slice(Math.min(fromIdx, toIdx), Math.max(fromIdx, toIdx) + 1);
				rubSubset = hezbSubset.filter((item: any) => selectedRubs.includes(item.rub));
			}
		}

		// ── 9. Page options from rub subset ──────────────────────────────────
		this.pagesList = [...new Set(rubSubset.map((item: any) => Number(item.nOFPage)))]
			.sort((a, b) => a - b);

		// ── 10. Restore dataAya pool from page range ──────────────────────────
		const pageFrom = Number(f.pageFrom);
		const pageTo   = Number(f.pageTo);
		if (pageFrom && pageTo) {
			this.dataAya = rubSubset.filter((item: any) => {
				const p = Number(item.nOFPage);
				return p >= pageFrom && p <= pageTo;
			}).map((item: any) => ({ data: item }));
		}
	}

	// تحديث الايات بناء على اختيار السور
	updateAyaNumbers(type: 'from' | 'to') {
		const selectedSura = this.form.get(`sura${type.charAt(0).toUpperCase() + type.slice(1)}`)?.value;

		if (selectedSura) {
			const suraData = this.searchInstance.table_othmani.filter(item => item.Sura_Name === selectedSura);
			// console.log("suraData", suraData);

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

		if (!startAya || !endAya) return;

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
			this.generateJozNumbers()
			console.log(this.dataAya);
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
		const rubFrom = this.form.get('rubFrom')?.value;
		const rubTo = this.form.get('rubTo')?.value;

		const fromIdx = this.rubList.indexOf(rubFrom);
		const toIdx = this.rubList.indexOf(rubTo);

		if (fromIdx === -1 || toIdx === -1) return [];

		const selectedRubs = this.rubList.slice(
			Math.min(fromIdx, toIdx),
			Math.max(fromIdx, toIdx) + 1
		);

		const filteredAyat = this.searchInstance.table_othmani.filter(item =>
			selectedRubs.includes(item.rub)
		);

		const pagesNumbers = [...new Set(filteredAyat.map(item => Number(item.nOFPage)))].sort((a, b) => a - b);

		this.pagesList = pagesNumbers;
		return pagesNumbers;
	}

	// عدد الأيات بعد اختيار عدد الصفحات
	getAyatOfOages() {
		const pageFrom = Number(this.form.get('pageFrom')?.value);
		const pageTo = Number(this.form.get('pageTo')?.value);

		const filteredAyat = this.searchInstance.table_othmani.filter(item => {
			const page = Number(item.nOFPage);
			return page >= pageFrom && page <= pageTo;
		});

		this.dataAya = filteredAyat.map(item => ({ data: item }));
	}

	onSubmit() {
		localStorage.setItem('searchFormData', JSON.stringify(this.form.value));
		localStorage.setItem('exactMatch', String(this.exactMatch));

		const v = this.form.value;
		const all = this.searchInstance.table_othmani;

		if (v.pageFrom && v.pageTo) {
			// most specific: page range
			const from = Number(v.pageFrom), to = Number(v.pageTo);
			this.dataAya = all.filter(item => {
				const p = Number(item.nOFPage);
				return p >= from && p <= to;
			}).map(item => ({ data: item }));

		} else if (v.rubFrom && v.rubTo) {
			// rub range
			const fromIdx = this.rubList.indexOf(v.rubFrom);
			const toIdx   = this.rubList.indexOf(v.rubTo);
			const selectedRubs = this.rubList.slice(Math.min(fromIdx, toIdx), Math.max(fromIdx, toIdx) + 1);
			this.dataAya = all.filter(item => selectedRubs.includes(item.rub)).map(item => ({ data: item }));

		} else if (v.hezbFrom && v.hezbTo) {
			// hezb range
			const from = Number(v.hezbFrom), to = Number(v.hezbTo);
			this.dataAya = all.filter(item => {
				const h = Number(item.nOFHezb);
				return h >= from && h <= to;
			}).map(item => ({ data: item }));

		} else if (v.JozFrom && v.JozTo) {
			// joz range
			const from = Number(v.JozFrom), to = Number(v.JozTo);
			this.dataAya = all.filter(item => {
				const j = Number(item.nOFJoz);
				return j >= from && j <= to;
			}).map(item => ({ data: item }));

		} else if (v.suraFrom && v.suraTo && v.ayaFrom && v.ayaTo) {
			// sura + aya range
			const sorted = [...all].sort((a, b) => Number(a.id) - Number(b.id));
			const startAya = sorted.find(item => item.Sura_Name === v.suraFrom && Number(item.Aya_N) === Number(v.ayaFrom));
			const endAya   = sorted.find(item => item.Sura_Name === v.suraTo   && Number(item.Aya_N) === Number(v.ayaTo));
			if (startAya && endAya) {
				const startId = Number(startAya.id), endId = Number(endAya.id);
				this.dataAya = sorted.filter(item => Number(item.id) >= startId && Number(item.id) <= endId).map(item => ({ data: item }));
			}

		} else if (v.suraFrom && v.suraTo) {
			// sura range only
			const fromNum = Number(all.find(s => s.Sura_Name === v.suraFrom)?.nOFSura);
			const toNum   = Number(all.find(s => s.Sura_Name === v.suraTo)?.nOFSura);
			this.dataAya = all.filter(item => {
				const n = Number(item.nOFSura);
				return n >= fromNum && n <= toNum;
			}).map(item => ({ data: item }));

		} else {
			// no filter — search entire Quran
			this.dataAya = all.map(item => ({ data: item }));
		}

		// Only persist to localStorage for reasonably-sized filtered sets
		// to avoid hitting the ~5MB storage limit
		if (this.dataAya.length <= 500) {
			localStorage.setItem('dataAya', JSON.stringify(this.dataAya));
		} else {
			localStorage.removeItem('dataAya');
		}
		this.openDialog();
		this.isOpenForm = false;
	}

	openDialog(): void {
		const dialogRef = this.dialog.open(this.searchResult, {
			width: '400px',
		});

		dialogRef.afterClosed().subscribe(() => {
			console.log("after");
		});
	}

	closeDialog(): void {
		this.dialog.closeAll();
	}

	/**
	 * Full normalization: replaces superscript alef (ٰ U+0670) with ا.
	 * Use when matching against AyaText (which was generated with this rule)
	 * or when the user pastes Othmani text.
	 */
	private stripTashkeel(text: string): string {
		return text
			.replace(/[\u064B-\u065F]/g, '')              // tashkeel: tanwin, kasra, fatha, damma, shadda, sukun … (U+064B–U+065F)
			.replace(/\u0670/g, '\u0627')              // superscript alef ٰ  → ا  (e.g. ٱلرَّحْمَٰنِ → الرحمان)
			.replace(/\u0671/g, '\u0627')              // alef wasla       ٱ  → ا  (Othmani word-start alef)
			.replace(/\u0649/g, '\u064A')              // alef maqsura     ى  → ي  (final yeh without dots)
			.replace(/[\u06DF\u06E0\u06E2\u06E5\u06E6\u06E8\u06EA\u06EB\u06EC\u06ED\u06DC]/g, '') // Quranic annotation marks: ۟(06DF) ۠(06E0) ۢ(06E2) ۥ(06E5) ۦ(06E6) ۨ(06E8) ۪(06EA) ۫(06EB) ۬(06EC) ۭ(06ED) ۜ(06DC)
			.replace(/\u0640/g, '');                   // kashida (tatweel) ـ  → removed (Arabic elongation stroke)
	}

	/**
	 * Simplified normalization: strips superscript alef (ٰ U+0670) instead of
	 * replacing it. Matches the common simplified spelling users type
	 * (e.g. "الرحمن" not "الرحمان").
	 */
	private stripTashkeelSimple(text: string): string {
		return text
			.replace(/[\u064B-\u065F\u0670]/g, '')    // tashkeel (U+064B–U+065F) + superscript alef ٰ (U+0670) — all stripped, NOT replaced (keeps الرحمن as-is)
			.replace(/\u0671/g, '\u0627')              // alef wasla       ٱ  → ا
			.replace(/\u0649/g, '\u064A')              // alef maqsura     ى  → ي
			.replace(/[\u06DF\u06E0\u06E2\u06E5\u06E6\u06E8\u06EA\u06EB\u06EC\u06ED\u06DC]/g, '') // Quranic annotation marks: ۟(06DF) ۠(06E0) ۢ(06E2) ۥ(06E5) ۦ(06E6) ۨ(06E8) ۪(06EA) ۫(06EB) ۬(06EC) ۭ(06ED) ۜ(06DC)
			.replace(/\u0640/g, '');                   // kashida (tatweel) ـ  → removed
	}

	private getSearchPool(): any[] {
		// Use in-memory dataAya if available (set by onSubmit this session)
		if (this.dataAya.length > 0) return this.dataAya;
		// Fall back to localStorage for small filtered sets persisted across sessions
		const stored = localStorage.getItem('dataAya');
		if (stored) {
			try { return JSON.parse(stored); } catch { /* ignore */ }
		}
		// Final fallback: search entire Quran
		return this.searchInstance.table_othmani.map((item: any) => ({ data: item }));
	}

	onSearch(): void {
		const dataArray = this.getSearchPool();

		if (this.searchQuery && this.searchQuery.trim() !== '') {
			// Two query forms to cover both Othmani paste (ٰ→ا) and typed simplified Arabic (ٰ stripped)
			const query       = this.stripTashkeel(this.searchQuery.trim());
			const querySimple = this.stripTashkeelSimple(this.searchQuery.trim());

			const searchResults = dataArray.filter((item: any) => {
				// AyaText was generated with ٰ→ا so match query (full normalization)
				const ayaText   = item.data.AyaText || '';
				// AyaText_Othmani stripped with ٰ removed covers simplified typed queries
				const ayaSimple = this.stripTashkeelSimple((item.data.AyaText_Othmani || '').trim());

				if (this.exactMatch) {
					return ayaText.split(' ').some((w: string) => w === query) ||
					       ayaSimple.split(' ').some((w: string) => w === querySimple);
				} else {
					return ayaText.includes(query) || ayaSimple.includes(querySimple);
				}
			});

			this.dataSharingService.updateSelectedData(searchResults, this.searchQuery);
			this.results = searchResults;
		} else {
			this.results = [];
			this.dataSharingService.updateSelectedData([], '');
		}
	}

	onClearSearch(): void {
		if (!this.searchQuery || this.searchQuery.trim() === '') {
		  this.results = [];
		  this.dataSharingService.updateSelectedData([],'');
		  console.log("Search query is empty, hiding table.");
		}
	  }

	resetForm() {
		this.form.reset();
		this.exactMatch = false;
		localStorage.removeItem('searchFormData');
		localStorage.removeItem('dataAya');
		localStorage.removeItem('exactMatch');
	}

	/**
	 * Test method: iterates every aya in the Quran, takes its Othmani text (with tashkeel),
	 * strips tashkeel using stripTashkeel(), then verifies it still finds a match in AyaText
	 * (the pre-normalized, tashkeel-free field). Logs any aya where the stripped query
	 * fails to match — exposing gaps in the normalization.
	 * Call from ngOnInit or a debug button to run the test.
	 */
	testSearchWithTashkeel(): void {
		const allAyat = this.searchInstance.table_othmani;
		const failures: { id: string; sura: string; aya: string; othmani: string; stripped: string }[] = [];

		for (const aya of allAyat) {
			const othmaniText: string = aya.AyaText_Othmani || '';
			const plainText: string = aya.AyaText || '';

			// Strip tashkeel from the Othmani version the same way onSearch() does
			const strippedQuery = this.stripTashkeel(othmaniText.trim());

			// The search checks if AyaText includes the stripped query
			const found = this.stripTashkeel(plainText).includes(strippedQuery);

			if (!found) {
				failures.push({
					id: aya.id,
					sura: aya.Sura_Name,
					aya: aya.Aya_N,
					othmani: othmaniText,
					stripped: strippedQuery
				});
			}
		}

		if (failures.length === 0) {
			console.log('✅ testSearchWithTashkeel: all', allAyat.length, 'ayat matched successfully.');
		} else {
			console.warn('❌ testSearchWithTashkeel: failed for', failures.length, 'ayat:');
			failures.forEach(f =>
				console.warn(`  [${f.id}] ${f.sura} ${f.aya} | stripped: "${f.stripped}" | original: "${f.othmani}"`)
			);
		}
	}
}
