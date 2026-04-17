import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TafseerRoutingModule } from './tafseer-routing.module';
import { TafseerComponent } from './pages';

@NgModule({
  declarations: [TafseerComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    TafseerRoutingModule,
  ]
})
export class TafseerModule { }
