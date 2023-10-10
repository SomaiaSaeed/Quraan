import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ListenRoutingModule } from './listen-routing.module';
import { ListenComponent } from './pages';
import { FormComponent } from './components';
import { MaterialModule } from 'src/app/shared/material';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    ListenComponent,
    FormComponent
  ],
  imports: [
    CommonModule,
    ListenRoutingModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
   
  ]
})
export class ListenModule { }
