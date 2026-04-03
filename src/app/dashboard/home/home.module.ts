import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { QuraanImagesComponent } from './components/quraanImages/quraanImages.component';
import { MushafPageComponent } from './components/mushaf-page/mushaf-page.component';
import { ContextMenuModule } from 'primeng/contextmenu';
import { UnderlineMatchDirective } from './components/quraanImages/underlineMatchDirective';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    UnderlineMatchDirective,
    HomeComponent,
    QuraanImagesComponent,
    MushafPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HomeRoutingModule,
    CarouselModule,
    ContextMenuModule,
    HttpClientModule
  ]
})
export class HomeModule { }
