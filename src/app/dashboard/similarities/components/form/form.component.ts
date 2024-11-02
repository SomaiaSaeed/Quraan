import { Component, OnInit } from '@angular/core';
import { Search } from 'src/app/core/services/search.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-form',
	templateUrl: './form.component.html',
	styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
	isOpen: boolean = false;
	isOneSora:boolean = false


	ngOnInit(){

	}

	oneSora(){
		this.isOneSora = !this.isOneSora
	}
	
}
