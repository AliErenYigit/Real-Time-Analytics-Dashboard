// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // <-- ekle

import { AppRoutingModule } from './app-routing.module';
import { App } from './app.components';

@NgModule({
  declarations: [
    
    // ileride DashboardComponent vs. eklenecek
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, // <-- buraya ekle
    App,
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }
