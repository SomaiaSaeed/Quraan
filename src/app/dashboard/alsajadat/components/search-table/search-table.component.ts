import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Sajda {
  sura: string;
  juz: number;
  ayaNumber: number;
  ayaText: string;
  page: number;
}

@Component({
  selector: 'app-search-table',
  templateUrl: './search-table.component.html',
  styleUrls: ['./search-table.component.scss']
})
export class SearchTableComponent {

  sajdat: Sajda[] = [
    {
      sura: 'الأعراف',
      juz: 9,
      ayaNumber: 206,
      ayaText: 'إِنَّ ٱلَّذِينَ عِندَ رَبِّكَ لَا يَسْتَكْبِرُونَ عَنْ عِبَادَتِهِۦ وَيُسَبِّحُونَهُۥ وَلَهُۥ يَسْجُدُونَ ۩',
      page: 176
    },
    {
      sura: 'الرعد',
      juz: 13,
      ayaNumber: 15,
      ayaText: 'وَلِلَّهِ يَسْجُدُ مَن فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ طَوْعًا وَكَرْهًا وَظِلَٰلُهُم بِٱلْغُدُوِّ وَٱلْأَصَالِ ۩',
      page: 253
    },
    {
      sura: 'النحل',
      juz: 14,
      ayaNumber: 50,
      ayaText: 'يَخَافُونَ رَبَّهُم مِّن فَوْقِهِمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ ۩',
      page: 272
    },
    {
      sura: 'الإسراء',
      juz: 15,
      ayaNumber: 109,
      ayaText: 'وَيَخِرُّونَ لِلْأَذْقَانِ يَبْكُونَ وَيَزِيدُهُمْ خُشُوعًا ۩',
      page: 293
    },
    {
      sura: 'مريم',
      juz: 16,
      ayaNumber: 58,
      ayaText: 'إِذَا تُتْلَىٰ عَلَيْهِمْ ءَايَٰتُ ٱلرَّحْمَٰنِ خَرُّوا۟ سُجَّدًا وَبُكِيًّا ۩',
      page: 308
    },
    {
      sura: 'الحج',
      juz: 17,
      ayaNumber: 18,
      ayaText: 'أَلَمْ تَرَ أَنَّ ٱللَّهَ يَسْجُدُ لَهُۥ مَن فِى ٱلسَّمَٰوَٰتِ وَمَن فِى ٱلْأَرْضِ ۩',
      page: 333
    },
    {
      sura: 'الفرقان',
      juz: 19,
      ayaNumber: 60,
      ayaText: 'وَإِذَا قِيلَ لَهُمُ ٱسْجُدُوا۟ لِلرَّحْمَٰنِ قَالُوا۟ وَمَا ٱلرَّحْمَٰنُ أَنَسْجُدُ لِمَا تَأْمُرُنَا وَزَادَهُمْ نُفُورًا ۩',
      page: 365
    },
    {
      sura: 'النمل',
      juz: 19,
      ayaNumber: 26,
      ayaText: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ رَبُّ ٱلْعَرْشِ ٱلْعَظِيمِ ۩',
      page: 379
    },
    {
      sura: 'السجدة',
      juz: 21,
      ayaNumber: 15,
      ayaText: 'إِنَّمَا يُؤْمِنُ بِـَٔايَٰتِنَا ٱلَّذِينَ إِذَا ذُكِّرُوا۟ بِهَا خَرُّوا۟ سُجَّدًا وَسَبَّحُوا۟ بِحَمْدِ رَبِّهِمْ وَهُمْ لَا يَسْتَكْبِرُونَ ۩',
      page: 415
    },
    {
      sura: 'ص',
      juz: 23,
      ayaNumber: 24,
      ayaText: 'وَظَنَّ دَاوُۥدُ أَنَّمَا فَتَنَّٰهُ فَٱسْتَغْفَرَ رَبَّهُۥ وَخَرَّ رَاكِعًا وَأَنَابَ ۩',
      page: 454
    },
    {
      sura: 'فصلت',
      juz: 24,
      ayaNumber: 38,
      ayaText: 'فَإِنِ ٱسْتَكْبَرُوا۟ فَٱلَّذِينَ عِندَ رَبِّكَ يُسَبِّحُونَ لَهُۥ بِٱللَّيْلِ وَٱلنَّهَارِ وَهُمْ لَا يَسْأَمُونَ ۩',
      page: 480
    },
    {
      sura: 'النجم',
      juz: 27,
      ayaNumber: 62,
      ayaText: 'فَٱسْجُدُوا۟ لِلَّهِ وَٱعْبُدُوا۟ ۩',
      page: 527
    },
    {
      sura: 'الانشقاق',
      juz: 30,
      ayaNumber: 21,
      ayaText: 'وَإِذَا قُرِئَ عَلَيْهِمُ ٱلْقُرْءَانُ لَا يَسْجُدُونَ ۩',
      page: 589
    },
    {
      sura: 'العلق',
      juz: 30,
      ayaNumber: 19,
      ayaText: 'كَلَّا لَا تُطِعْهُ وَٱسْجُدْ وَٱقْتَرِب ۩',
      page: 597
    }
  ];

  constructor(private router: Router) {}

  goToPage(page: number): void {
    localStorage.setItem('pendingNavPage', page.toString());
    this.router.navigate(['/home']);
  }

  toArabicNumber(num: number): string {
    return num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }
}
