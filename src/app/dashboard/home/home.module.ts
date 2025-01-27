import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { QuraanImagesComponent } from './components/quraanImages/quraanImages.component';
import { DynamicAyaComponent } from './components/dynamic-aya/dynamic-aya.component';


@NgModule({
  declarations: [
    HomeComponent,
    QuraanImagesComponent,
    DynamicAyaComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    CarouselModule
  ]
})
export class HomeModule { }
