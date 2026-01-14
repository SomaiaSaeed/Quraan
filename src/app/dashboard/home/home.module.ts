import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { QuraanImagesComponent } from './components/quraanImages/quraanImages.component';
import { ContextMenuModule } from 'primeng/contextmenu';
import { UnderlineMatchDirective } from './components/quraanImages/underlineMatchDirective';


@NgModule({
  declarations: [
    UnderlineMatchDirective,
    HomeComponent,
    QuraanImagesComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    CarouselModule,
    ContextMenuModule
  ]
})
export class HomeModule { }
