import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { QuraanImagesComponent } from './components/quraanImages/quraanImages.component';
import { ContextMenuModule } from 'primeng/contextmenu';
import { UnderlineMatchDirective } from './components/quraanImages/underlineMatchDirective';
import { MushafLineFitDirective } from './components/quraanImages/mushafLineFit.directive';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { AyaCompareDialogComponent } from './components/aya-compare-dialog/aya-compare-dialog.component';


@NgModule({
  declarations: [
    UnderlineMatchDirective,
    MushafLineFitDirective,
    HomeComponent,
    QuraanImagesComponent,
    AyaCompareDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HomeRoutingModule,
    CarouselModule,
    ContextMenuModule,
    MaterialModule
  ]
})
export class HomeModule { }
