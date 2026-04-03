import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FehresRoutingModule } from './fehres-routing.module';
import { FehresComponent } from './fehres.component';

@NgModule({
  declarations: [FehresComponent],
  imports: [CommonModule, FehresRoutingModule]
})
export class FehresModule { }
