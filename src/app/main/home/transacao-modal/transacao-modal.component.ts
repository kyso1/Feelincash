import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-transacao-modal',
  templateUrl: './transacao-modal.component.html',
  styleUrls: ['./transacao-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class TransacaoModalComponent implements OnInit {
  @Input() tipoTransacao: 'entrada' | 'saida' = 'saida';

  transacaoForm: FormGroup;

  categorias = {
    entrada: ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros'],
    saida: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros']
  };

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private storage: Storage,
    private fb: FormBuilder
  ) {
    this.transacaoForm = this.fb.group({
      descricao: ['', Validators.required],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      data: [this.obterDataHoje(), [Validators.required, this.validarDataReal()]],
      categoria: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.storage.create();
  }

  async salvar() {
    if (this.transacaoForm.valid) {
      const { descricao, valor, data, categoria } = this.transacaoForm.value;
      const [dia, mes, ano] = data.split('/');
      const dataConvertida = new Date(+ano, +mes - 1, +dia);

      const novaTransacao = {
        nome: descricao,
        valor: parseFloat(valor),
        data: dataConvertida.toISOString(),
        tipo: this.tipoTransacao,
        categoria
      };

      const transacoes = await this.storage.get('gastos') || [];
      transacoes.push(novaTransacao);
      await this.storage.set('gastos', transacoes);

      this.exibirToast('Transação salva com sucesso!');
      this.modalCtrl.dismiss();
    }
  }

  cancelar() {
    this.exibirToast('Cancelado!', 'medium');
    this.modalCtrl.dismiss();
  }
  

  validarDataReal() {
    return (control: AbstractControl) => {
      const valor = control.value;
      const regex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/;

      if (!regex.test(valor)) return { dataInvalida: true };

      const [dia, mes, ano] = valor.split('/').map(Number);
      const data = new Date(ano, mes - 1, dia);
      if (
        data.getFullYear() !== ano ||
        data.getMonth() + 1 !== mes ||
        data.getDate() !== dia
      ) {
        return { dataInvalida: true };
      }

      const dataMinima = new Date(2024, 0, 1);
      if (data < dataMinima) {
        return { dataMuitoAntiga: true };
      }

      return null;
    };
  }

  formatarDataInput(event: any) {
    let valor = event.detail.value.replace(/\D/g, '');
    if (valor.length > 2 && valor.length <= 4)
      valor = valor.slice(0, 2) + '/' + valor.slice(2);
    else if (valor.length > 4)
      valor = valor.slice(0, 2) + '/' + valor.slice(2, 4) + '/' + valor.slice(4, 8);
    this.transacaoForm.get('data')?.setValue(valor, { emitEvent: false });
  }

  obterDataHoje(): string {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  formatarValorInput(event: any) {
    let valor = event.detail.value.replace(/\D/g, '');
    if (valor.length > 2) {
      valor = valor.slice(0, -2) + ',' + valor.slice(-2);
    }
    this.transacaoForm.get('valor')?.setValue(valor, { emitEvent: false });
  }

  async exibirToast(msg: string, color: 'success' | 'medium' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
      color
    });
    toast.present();
  }  
}
