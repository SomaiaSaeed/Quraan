import { Component, Input, OnInit } from "@angular/core";
import { OwlOptions } from "ngx-owl-carousel-o";
import { Search } from "src/app/core/services/search.service";

@Component({
  selector: "app-quraanImages",
  templateUrl: "./quraanImages.component.html",
  styleUrls: ["./quraanImages.component.scss"],
})
export class QuraanImagesComponent implements OnInit {
  @Input() images: string | any;
  quranPages: any[] = [];

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ["", ""],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
    },
    nav: true,
  };

  constructor(private _searchInstance: Search) {}

  ngOnInit() {
    this.quranPages = this.groupQuranPages();
  }

  groupQuranPages(): any[] {
    const pages: { [key: string]: any } = {};

    this._searchInstance.table_othmani.forEach((aya) => {
      const pageNum = aya.nOFPage;

      if (!pages[pageNum]) {
        pages[pageNum] = {
          pageNumber: pageNum,
          ayat: [],
        };
      }

      pages[pageNum].ayat.push({
        id: aya.id,
        text: aya.AyaText_Othmani,
        ayaNumber: aya.Aya_N,
        suraName: aya.Sura_Name,
      });
    });

    return Object.values(pages).sort((a, b) => a.pageNumber - b.pageNumber);
  }
}
