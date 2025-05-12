import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
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
    private databaseService: DatabaseService
  ) {
    this.form = this.fb.group({
      salario: ['0,00'],
      aluguel: ['0,00'],
      agua: ['0,00'],
      luz: ['0,00'],
      internet: ['0,00'],
      contasFixasExtras: this.fb.array([]),
    });
  }

  get contasFixasExtras() {
    return this.form.get('contasFixasExtras') as FormArray;
  }

  adicionarContaExtra() {
    const novaConta = this.fb.group({
      nome: [''],
      valor: ['0,00']
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
    const salario = (await this.databaseService.get<number>('salario')) || 0;
    const contasFixas = (await this.databaseService.get<{ [key: string]: any }>('contasFixas')) || {};

    this.form.patchValue({
      salario: this.formatarValorParaExibicao(salario),
      aluguel: this.formatarValorParaExibicao(contasFixas['aluguel'] || 0),
      agua: this.formatarValorParaExibicao(contasFixas['agua'] || 0),
      luz: this.formatarValorParaExibicao(contasFixas['luz'] || 0),
      internet: this.formatarValorParaExibicao(contasFixas['internet'] || 0)
    });
    
    if (contasFixas['extras'] && Array.isArray(contasFixas['extras'])) {
      contasFixas['extras'].forEach((extra: any) => {
        this.contasFixasExtras.push(this.fb.group({
          nome: [extra.nome],
          valor: [this.formatarValorParaExibicao(extra.valor)]
        }));
      });
    }
  }

  private formatarValorParaExibicao(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
  }

  private parseValorInput(valorString: string): number {
    return parseFloat(valorString.replace(',', '.'));
  }

  async salvar() {
    const formValue = this.form.value;
    const salario = this.parseValorInput(formValue.salario);
    const contasFixas = {
      aluguel: this.parseValorInput(formValue.aluguel),
      agua: this.parseValorInput(formValue.agua),
      luz: this.parseValorInput(formValue.luz),
      internet: this.parseValorInput(formValue.internet),
      extras: formValue.contasFixasExtras.map((extra: any) => ({
        nome: extra.nome,
        valor: this.parseValorInput(extra.valor)
      }))
    };

    await this.databaseService.set('salario', salario);
    await this.databaseService.set('contasFixas', contasFixas);
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