import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GraphicPageRoutingModule } from './graphic-routing.module';
import { GraphicPage } from './graphic.page';
import { BaseChartDirective } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GraphicPageRoutingModule,
    BaseChartDirective
  ],
  declarations: [GraphicPage],
})
export class GraphicPageModule {}