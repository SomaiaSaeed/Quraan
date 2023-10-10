import { Component, OnInit } from '@angular/core';
import { ListenService } from '../../services/listen.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Search } from 'src/app/core/services/search.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  addForm!: FormGroup;
  subscription: Subscription | any;
  names: any[] = [];
  soras: any[] = [];
  fromSoraAyat: any[] = [];
  fromAya: any = {};

  constructor(private _listenService: ListenService, private fb: FormBuilder, private _search: Search) { }

  getForm() {
    this.addForm = this.fb.group({
      fromName: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
    this.getForm()
    this.getNames()
  }

  getNames() {
    let currentSura = '';
    let nOfAyas = 0;
    this._search.table_othmani.forEach((aya: any) => {
      if (currentSura == aya.Sura_Name) {
        nOfAyas++;
      } else {
        this.soras.push({
          soraName: currentSura,
          nOFSura: (parseInt(aya.nOFSura) - 1).toString(),
          nOfAyas: nOfAyas
        });
        currentSura = aya.Sura_Name;
        nOfAyas = 1;
      }
    });
    this.fromSoraAyat = [];
    this.fromSoraAyat.push({id: '.'});
  }

  getControl(field: string) {
    return this.addForm.get(field);
  }

  getSora($event: any) {
    console.log("$event",$event)
    this._listenService.soraName($event.value.nOFSura).subscribe(res => {
    })

    this.fromSoraAyat = [];
    this.fromSoraAyat.push({id: '.'});
    let nOfAyas = $event.value.nOfAyas;
    let index = 0;
    while (index < nOfAyas) {
      index++;
      this.fromSoraAyat.push({
        id: index,
      });
    }
    console.log("fromSoraAyat",this.fromSoraAyat)
  }

  fromAyaFun($event: any) {
    this.fromAya = $event.value.id;
  }

}
