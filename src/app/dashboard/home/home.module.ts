import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuModule } from 'primeng/menu';

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
    CarouselModule,
    ContextMenuModule,
    MenuModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeModule { }
