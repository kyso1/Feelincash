import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-constantes-modal',
  templateUrl: './constantes-modal.component.html',
  styleUrls: ['./constantes-modal.component.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class ConstantesModalComponent implements OnInit {
  form: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private storage: Storage
  ) {
    this.form = this.fb.group({
      salario: [0],
      aluguel: [0],
      agua: [0],
      luz: [0],
      internet: [0],
      contasFixasExtras: this.fb.array([]),
    });
  }

  get contasFixasExtras() {
    return this.form.get('contasFixasExtras') as FormArray;
  }

  adicionarContaExtra() {
    const novaConta = this.fb.group({
      nome: [''],
      valor: ['']
    });
    this.contasFixasExtras.push(novaConta);
  }

  removerContaExtra(index: number) {
    this.contasFixasExtras.removeAt(index);
  }

  formatarValorExtraInput(event: any, index: number) {
    let valor = event.detail.value.replace(/\D/g, '');
    if (valor.length > 2) {
      valor = valor.slice(0, -2) + ',' + valor.slice(-2);
    }
    this.contasFixasExtras.at(index).get('valor')?.setValue(valor, { emitEvent: false });
  }

  async ngOnInit() {
    await this.storage.create();

    const salario = await this.storage.get('salario');
    const contasFixas = await this.storage.get('contasFixas') || {};

    this.form.patchValue({
      salario: salario,
      aluguel: contasFixas.aluguel,
      agua: contasFixas.agua,
      luz: contasFixas.luz,
      internet: contasFixas.internet
    });

    this.form.patchValue({
      salario,
      aluguel: contasFixas.aluguel,
      agua: contasFixas.agua,
      luz: contasFixas.luz,
      internet: contasFixas.internet
    });
    
    if (contasFixas.extras && Array.isArray(contasFixas.extras)) {
      contasFixas.extras.forEach((extra: any) => {
        this.contasFixasExtras.push(this.fb.group({
          nome: [extra.nome],
          valor: [extra.valor]
        }));
      });
    }
  }

  async salvar() {
    const { salario, aluguel, agua, luz, internet, contasFixasExtras } = this.form.value;
    await this.storage.set('salario', salario);
    await this.storage.set('contasFixas', { aluguel, agua, luz, internet, extras: contasFixasExtras });
    this.modalCtrl.dismiss();
  }
  

  fechar() {
    this.modalCtrl.dismiss();
  }

  formatarValorInput(event: any, campo: string) {
    let valor = event.detail.value.replace(/\D/g, '');
    if (valor.length > 2) {
      valor = valor.slice(0, -2) + ',' + valor.slice(-2);
    }
    this.form.get(campo)?.setValue(valor, { emitEvent: false });
  }
}
