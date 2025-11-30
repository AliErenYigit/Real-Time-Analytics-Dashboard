// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { App } from './app.component';

@NgModule({
  declarations: [
    
    // ileride DashboardComponent vs. eklenecek
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    App,
  ],
  providers: [provideHttpClient(withFetch())],
  bootstrap: [App]
})
export class AppModule { }
