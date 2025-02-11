import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { SpansOfColoredWords,MotashabehatSpan } from 'src/app/core/constants/quraanImages.constant';

interface Span {
  top: string;
  left: string;
  width: string;
  height: string;
}

// interface ColoredWord {
//   top: string;
//   left: string;
//   width: string;
//   color: string;
//   isStatic: boolean;
// }

// interface MotashabehSpan {
//   isRight: boolean;
//   moade3: string;
//   height: string;
//   top: string;
//   isRightClicked: boolean;
// }

interface Moade3 {
color: any;
  top: string;
  suraWithIndex: string;
  aya?: string;
  id: string;
}

interface Motashabehat {
  top: string;
  height: string;
  isRight: boolean;
  moade3: Moade3[];
}
@Component({
  selector: 'app-dynamic-aya',
  templateUrl: './dynamic-aya.component.html',
  styleUrls: ['./dynamic-aya.component.scss']
})
export class DynamicAyaComponent implements OnInit {
  @Input() pageNum: number = 1;
  @Input() ayaNumber: string = '';
  @Input() ayaId: string = "0";
  @Input() href: string = '';
  @Input() activeAya: any;
  @Input() errorFactor: string = '';
  @Input() isActive: boolean = false;
  @Input() spans: Span[] = [];
  @Input() arrOfColoredWords: SpansOfColoredWords[] = [];
  @Input() ayat: any[] = [];
  @Input() motashabehatSpans: MotashabehatSpan[] = [];
  @Input() motashabehat:Motashabehat = {
    top: '',
    height: '',
    isRight: true,
    moade3: []
  };
  @Output() onClick = new EventEmitter<any>();
  @Output() onRight = new EventEmitter<any>();
  @Output() onMotahabehClick = new EventEmitter<number>();
  @Input() aya: string = '';

  @ViewChild('container', { static: false }) contain!: ElementRef;
  @ViewChild('cm') cm!: Menu;
  val: number = 5;
  bakgroundStyle = { background: 'white', opacity: 0.0, motashOpacity: 1 };
  bakgroundStyle2 = { background: 'blue', opacity: 0.2, motashOpacity: 0.2 };
  listMenuStyle: Record<string, string> = {
    left: '0px',
    top: '0px',
    position: 'relative',
    'z-index': '200',
    width: '175px',
    height: '60px'
  };

  showAyaList: boolean = false;
  selectedAyaID: number = 0;
  selectedmot: any;
  lineTop: string = '';
  ayas: any[] = [];
  bookmakNote: string = '';
  addNote: boolean = false;
  title: string = '';
  moade3 :Moade3[]=[];

  listAyaItems: any[] = [
    {
      label: 'سماع',
      command: (event: any) => {
        this.showAyaList = false;
        this.onRight.emit(event);
      }
    },
    {
      label: 'تفسير',
      command: (event: any) => {
        this.ayas = [];
        this.onRight.emit(event);
        this.showAyaList = false;
      }
    },
    {
      label: 'نسخ',
      command: (event: any) => {
        this.showAyaList = false;
        this.onRight.emit(event);
      }
    },
    {
      label: 'إضافة إلى المفضلة',
      command: (event: any) => {
        this.showAyaList = false;
        this.onRight.emit(event);
        this.addNote = true;
      }
    },
    {
      label: 'Facebook',
      icon: 'fa fa-facebook',
      command: (event: any) => {
        this.showAyaList = false;
        this.onRight.emit(event);
      }
    },
    {
      label: 'Gmail',
      icon: 'fa fa-google',
      command: (event: any) => {
        this.showAyaList = false;
        this.onRight.emit(event);
      }
    },
    {
      label: 'WhatsApp',
      icon: 'fa fa-whatsapp',
      command: (event: any) => {
        this.showAyaList = false;
        this.onRight.emit(event);
      }
    },
    {
      label: 'إغلاق',
      command: () => {
        this.showAyaList = false;
      }
    }
  ];

  listMenuItems: any[] = [
    {
      label: 'ذهاب إلى الآية',
      command: () => {
        this.showList = false;
        this.onMotahabehClick.emit(this.selectedAyaID);
      }
    },
    {
      label: 'مقارنة مع الحالي',
      command: () => {
        this.ayas = [
          { aya: this.aya, sura: '' },
          { aya: this.selectedmot.aya, sura: this.selectedmot.suraWithIndex }
        ];
        this.showList = false;
        this.OpenDialoge = true;
      }
    }
  ];

  showList: boolean = false;
  OpenDialoge: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.lineTop = this.calculateLineTop();
  }

  calculateLineTop(): string {
    if (this.motashabehat.moade3 && this.motashabehat.moade3.length > 0) {
      const top = this.motashabehat.moade3[this.motashabehat.moade3.length - 1].top.replace('px', '');
      return `${parseInt(top) + 25}px`;
    }
    return '';
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    this.showAyaList = false;

    let XL = event.clientX - this.contain.nativeElement.getBoundingClientRect().left + this.contain.nativeElement.scrollLeft - 200;
    let YL = event.clientY - this.contain.nativeElement.getBoundingClientRect().top + this.contain.nativeElement.scrollTop;
    this.listMenuStyle['top'] = YL + 'px';
    this.listMenuStyle['left'] = XL + 'px';
    this.onRight.emit(event);
    setTimeout(() => {
      this.showAyaList = true;
    }, 0);
  }

  aya_clicked(event: Event): void {
    this.bakgroundStyle2 = { background: 'blue', opacity: 0.2, motashOpacity: 0.2 };
    this.onClick.emit({
      event,
      ayaId: this.ayaId,
      errorFactor: this.errorFactor
    });
  }

  maximizeHighlightedAya($event: any) {
    debugger;
    // this.isActive = true;
    this.bakgroundStyle2 = { background: "blue", opacity: .2, motashOpacity: 0.2 }

    if (this.errorFactor != '') {
      let operation = this.errorFactor.split(' ')[0];
      let factor =
        operation == '+'
          ?
          parseInt(this.errorFactor.split(' ')[1]) + this.val
          : parseInt(this.errorFactor.split(' ')[1]) - this.val;
      this.errorFactor = `${operation} ${factor}`
    } else {
      this.errorFactor = '+ 1'
    }
    console.log(`errorFactor for Aya# ${this.ayaId}: ${this.errorFactor}`)

  }

  minimizeHighlightedAya($event: any) {
    debugger;
    // this.isActive = true;
    this.bakgroundStyle2 = { background: "blue", opacity: .2, motashOpacity: 0.2 }


    if (this.errorFactor != '') {
      let operation = this.errorFactor.split(' ')[0];
      let factor =
        operation == '+'
          ?
          parseInt(this.errorFactor.split(' ')[1]) - this.val
          : parseInt(this.errorFactor.split(' ')[1]) + this.val;
      this.errorFactor = `${operation} ${factor}`
    } else {
      this.errorFactor = '- 1'
    }
    console.log(`errorFactor for Aya# ${this.ayaId}: ${this.errorFactor}`)


  }
  onMouseEnter($event: MouseEvent) {
    if (!this.isActive)
      this.bakgroundStyle = { background: "yellow", opacity: .2, motashOpacity: 0.2 };
  }

  onMouseOut($event: MouseEvent) {
    if (!this.isActive)
      this.bakgroundStyle = { background: "white", opacity: 0.0, motashOpacity: 1 };
  }

  onMotashabehRightClick(event: MouseEvent, mot:any) {
    event.preventDefault();
    debugger;
    if (!this.showList) {
      this.selectedmot = mot;
      this.selectedAyaID = mot.id;
      this.showList = true;
      // mot.isRightClicked= false;
      // this.OpenDialoge = true;
      let XL = event.clientX - this.contain.nativeElement.getBoundingClientRect().left + this.contain.nativeElement.scrollLeft - 200;
      let YL = event.clientY - this.contain.nativeElement.getBoundingClientRect().top + this.contain.nativeElement.scrollTop;
      this.listMenuStyle['top'] = YL + 'px';
      this.listMenuStyle['left'] = XL + 'px';
    } else {
      this.showList = false;
    }

  }

  // onMoueHover(word: { top: string; left: string; width: string; color: string }) {
  //   this.title = this.aya;
  // }
  getTopBorder(top: string) {
    let x = top.split('px');
    let y = parseInt(x[0]) - 35;
    return y + 'px';

  }
  addToFav(): void {
    let bookmarks = localStorage.getItem('bookmarks');
    if (!bookmarks) bookmarks = JSON.stringify([]);

    const allBookmarks = JSON.parse(bookmarks);
    if (!allBookmarks.some((bm: any) => bm.aya === this.ayaId)) {
      allBookmarks.push({ page: this.pageNum, aya: this.ayaId, note: this.bookmakNote });
      localStorage.setItem('bookmarks', JSON.stringify(allBookmarks));
    }
    this.addNote = false;
  }
}
