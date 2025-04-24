import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InserirPageRoutingModule } from './inserir-routing.module';
import { InserirPage } from './inserir.page';
import { IonicStorageModule } from '@ionic/storage-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    IonicStorageModule.forRoot(), // Ou mova para AppModule se preferir
    InserirPageRoutingModule
  ],
  declarations: [InserirPage]
})
export class InserirPageModule {}
