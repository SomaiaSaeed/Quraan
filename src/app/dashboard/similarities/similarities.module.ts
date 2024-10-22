import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SimilaritiesRoutingModule } from './similarities-routing.module';
import { SimilaritiesComponent } from './pages/similarities/similarities.component';
import { FormComponent } from './components';
import { SharedModule } from 'src/app/shared/shared.module';
import { SearchTableComponent } from './components/search-table/search-table.component';


@NgModule({
  declarations: [
    SimilaritiesComponent,
    FormComponent,
    SearchTableComponent
  ],
  imports: [
    CommonModule,
    SimilaritiesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class SimilaritiesModule { }
