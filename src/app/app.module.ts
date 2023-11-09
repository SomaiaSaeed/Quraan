import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { LayoutComponent } from './dashboard/layout/layout.component';
import { HeaderComponent } from './dashboard/layout/components/header/header.component';
import { FooterComponent } from './dashboard/layout/components/footer/footer.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoaderInterceptor } from './core/interceptor/loader.interceptor';
@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    HttpClientModule,
    FormsModule,
    NgxSpinnerModule,
  ],
  exports:[],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
