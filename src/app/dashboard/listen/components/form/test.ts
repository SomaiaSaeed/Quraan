// getAyaIdsRange() {
//     const ayaFrom = Number(this.form.get('ayaFrom')?.value);
//     const ayaTo = Number(this.form.get('ayaTo')?.value);
//     console.log(`ayaFrom:`, ayaFrom);
//     console.log(`ayaTo:`, ayaTo);

//     if (!isNaN(ayaFrom) && !isNaN(ayaTo) && ayaFrom <= ayaTo) {
//         const selectedSuraFrom = this.form.get('suraFrom')?.value;
//         const selectedSuraTo = this.form.get('suraTo')?.value;

//         console.log(`selectedSuraFrom:`, selectedSuraFrom);
//         console.log(`selectedSuraTo:`, selectedSuraTo);

//         const suraDataFrom = this.searchInstance.table_othmani.filter(item => item.Sura_Name === selectedSuraFrom);
//         const suraDataTo = this.searchInstance.table_othmani.filter(item => item.Sura_Name === selectedSuraTo);

//         // الحصول على ID للآية "من" (Aya From)
//         const startAyaId = Number(suraDataFrom.find(item => Number(item.Aya_N) === ayaFrom)?.id);
//         console.log(`Aya From ID: ${startAyaId}`);

//         // الحصول على ID للآية "إلى" (Aya To)
//         const endAyaId = Number(suraDataTo.find(item => Number(item.Aya_N) === ayaTo)?.id);
//         console.log(`Aya To ID: ${endAyaId}`);

//         if (!isNaN(startAyaId) && !isNaN(endAyaId)) {
//             // إنشاء مصفوفة من الـ IDs بين startAyaId و endAyaId
//             const allSelectedAyaIds = Array.from({ length: endAyaId - startAyaId + 1 }, (_, i) => startAyaId + i);
//             this.selectedAyaNumbers = allSelectedAyaIds
//             console.log('Selected Aya IDs:', allSelectedAyaIds);

//             // إنشاء مصفوفة Track تحتوي على { title, src }
//             this.audioFiles = this.selectedAyaNumbers.map(ayahNumber => {
//                 // البحث عن نص الآية في table_othmani باستخدام Aya_N
//                 const aya = this.searchInstance.table_othmani.find(item => item.Aya_N === String(ayahNumber)); // التأكد من أن Aya_N هو string
//                 const title = aya ? aya.AyaText_Othmani : `Ayah ${ayahNumber}`; // استخدام AyaText_Othmani إذا وجد

//                 return {
//                     title: title, // النص المستخرج
//                     link: `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${ayahNumber}.mp3`
//                 };
//             });

//             console.log("this.audioFiles",this.audioFiles);  // تحقق من المصفوفة
//         } else {
//             console.error('خطأ في تحديد أرقام الآيات');
//         }
//     } else {
//         console.error('Invalid Aya numbers detected');
//     }
// }


// الفانكشن دي بتجيب عدد الاحزاب بناء على الايات الى انت اختارتها
// getHezbNumbersInRange() {
// 	const ayaFrom = Number(this.form.get('ayaFrom')?.value);
// 	const ayaTo = Number(this.form.get('ayaTo')?.value);

// 	const selectedSuraFrom = this.form.get('suraFrom')?.value;
// 	const selectedSuraTo = this.form.get('suraTo')?.value;

// 	// جلب جميع الآيات بين الآية "من" والآية "إلى" مع مراعاة ترتيب السور
// 	const filteredAyat = this.searchInstance.table_othmani.filter(item => {
// 		const suraOrder = Number(item.nOFSura);
// 		const ayaNumber = Number(item.Aya_N);

// 		// تحقق من الآيات داخل السورة الأولى
// 		if (item.Sura_Name === selectedSuraFrom && ayaNumber >= ayaFrom) {
// 			return true;
// 		}
		
// 		// تحقق من الآيات داخل السورة الأخيرة
// 		if (item.Sura_Name === selectedSuraTo && ayaNumber <= ayaTo) {
// 			return true;
// 		}

// 		// تحقق من الآيات بين السورتين (إذا كانوا مختلفين)
// 		if (suraOrder > Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraFrom)?.nOFSura) &&
// 			suraOrder < Number(this.searchInstance.table_othmani.find(sura => sura.Sura_Name === selectedSuraTo)?.nOFSura)) {
// 			return true;
// 		}

// 		return false;
// 	});

// 	// استخراج الأحزاب الفريدة فقط في النطاق المحدد
// 	const hezbNumbers = [...new Set(filteredAyat.map(item => Number(item.nOFHezb)))];

// 	console.log('الأحزاب الموجودة بين الآيتين:', hezbNumbers);
// 	return hezbNumbers;
// }

	// updateAyaIdsRange() {
	// 	const ayaFrom = Number(this.form.get('ayaFrom')?.value);
	// 	const ayaTo = Number(this.form.get('ayaTo')?.value);

	// 	if (!isNaN(ayaFrom) && !isNaN(ayaTo) && ayaFrom <= ayaTo) {
	// 		// استخراج الآيات بناءً على النطاق المختار فقط
	// 		const selectedSura = this.form.get('suraFrom')?.value;
	// 		const suraData = this.searchInstance.table_othmani.filter(item => item.Sura_Name === selectedSura);

	// 		// فلترة الآيات لتكون فقط ضمن النطاق المحدد
	// 		const filteredAyaIds = suraData
	// 			.filter(item => Number(item.Aya_N) >= ayaFrom && Number(item.Aya_N) <= ayaTo)
	// 			.map(item => Number(item.id));  // استخراج الـ IDs فقط

	// 		// تحديث المصفوفة بالـ IDs
	// 		this.selectedAyaIds = filteredAyaIds;
	// 		console.log('Selected Aya IDs:', this.selectedAyaIds);
	// 	} else {
	// 		console.error('Invalid Aya numbers detected');
	// 		this.selectedAyaIds = [];
	// 	}
	// }

    // updateAyaIdsAndGenerateAudio() {
	// 	const ayaFrom = Number(this.form.get('ayaFrom')?.value);
	// 	const ayaTo = Number(this.form.get('ayaTo')?.value);

	// 	console.log("ayaFrom", ayaFrom)
	// 	console.log("ayaTo", ayaTo)

	// 	if (!isNaN(ayaFrom) && !isNaN(ayaTo) && ayaFrom <= ayaTo) {
	// 		const selectedSura = this.form.get('suraFrom')?.value;
	// 		console.log("selectedSura", selectedSura)

	// 		const suraData = this.searchInstance.table_othmani.filter(item => item.Sura_Name === selectedSura);
	// 		console.log("suraData", suraData)
	// 		// فلترة الآيات بناءً على الاختيارات
	// 		this.selectedAyaIds = suraData
	// 			.filter(item => Number(item.Aya_N) >= ayaFrom && Number(item.Aya_N) <= ayaTo)
	// 			.map(item => Number(item.id));

	// 		console.log('Selected Aya IDs:', this.selectedAyaIds);

	// 		// توليد روابط الصوتيات بناءً على الـ IDs المحددة
	// 		this.audioFiles = this.selectedAyaIds.map(ayahNumber => {
	// 			// البحث عن نص الآية في table_othmani باستخدام Aya_N
	// 			const aya = this.searchInstance.table_othmani.find(item => item.Aya_N === String(ayahNumber)); // التأكد من أن Aya_N هو string
	// 			const title = aya ? aya.AyaText_Othmani : `Ayah ${ayahNumber}`; // استخدام AyaText_Othmani إذا وجد

	// 			return {
	// 				title: title, // النص المستخرج
	// 				link: `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${ayahNumber}.mp3`
	// 			};
	// 		});

	// 		console.log("Audio Files: ", this.audioFiles);

	// 		// تشغيل أول ملف صوتي تلقائيًا (اختياري)
	// 		// if (this.audioFiles.length > 0) {
	// 		// 	const firstAudio = new Audio(this.audioFiles[0].link);
	// 		// 	firstAudio.play().catch(error => console.error("Error playing audio:", error));
	// 		// }

	// 	} else {
	// 		console.error('Invalid Aya numbers detected');
	// 		this.selectedAyaIds = [];
	// 		this.audioFiles = [];
	// 	}
	// }


    	// updateAyaIdsRange() {
	// 	const ayaFrom = Number(this.form.get('ayaFrom')?.value);
	// 	const ayaTo = Number(this.form.get('ayaTo')?.value);

	// 	if (!isNaN(ayaFrom) && !isNaN(ayaTo) && ayaFrom <= ayaTo) {
	// 		// استخراج الآيات بناءً على النطاق المختار فقط
	// 		const selectedSura = this.form.get('suraFrom')?.value;
	// 		const suraData = this.searchInstance.table_othmani.filter(item => item.Sura_Name === selectedSura);

	// 		// فلترة الآيات لتكون فقط ضمن النطاق المحدد
	// 		const filteredAyaIds = suraData
	// 			.filter(item => Number(item.Aya_N) >= ayaFrom && Number(item.Aya_N) <= ayaTo)
	// 			.map(item => Number(item.id));  // استخراج الـ IDs فقط

	// 		// تحديث المصفوفة بالـ IDs
	// 		this.selectedAyaIds = filteredAyaIds;
	// 		console.log('Selected Aya IDs:', this.selectedAyaIds);

	// 	} else {
	// 		console.error('Invalid Aya numbers detected');
	// 		this.selectedAyaIds = [];
	// 	}
	// }
