import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { IonHeader,IonSelect, IonSelectOption, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonLabel, IonInput } from "@ionic/angular/standalone";

@Component({
  selector: 'app-transacao-modal',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,             
    IonSelectOption,       
    ReactiveFormsModule    
  ],
  templateUrl: './transacao-modal.component.html',
  styleUrls: ['./transacao-modal.component.scss'],
})


export class TransacaoModalComponent implements OnInit {
  @Input() tipoTransacao: 'entrada' | 'saida' = 'saida';
  transacaoForm: FormGroup;
  listaGastos: any[] = [];

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
      nome: ['', Validators.required],
      valor: ['', [Validators.required, this.validarValorMinimo]],
      data: [this.obterDataHoje(), [Validators.required, this.validarDataReal]],
      categoria: [this.tipoTransacao === 'entrada' ? 'Salário' : 'Outros', Validators.required]
    });
  }

  validarValorMinimo(control: AbstractControl) {
    const valor = control.value;
    if (!valor) return null;
    
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    return valorNumerico >= 0.01 ? null : { valorMinimo: true };
  }

  async ngOnInit() {
    await this.storage.create();
    await this.carregarGastos();
  
    this.transacaoForm = this.fb.group({
      nome: ['', Validators.required],
      valor: ['', [Validators.required, this.validarValorMinimo]],
      data: [this.obterDataHoje(), [Validators.required, this.validarDataReal]],
      categoria: [this.tipoTransacao === 'entrada' ? 'Salário' : 'Outros', Validators.required]
    });
  }
  

  async carregarGastos() {
    const dados = await this.storage.get('gastos') || [];
    const hoje = new Date();
    const umMesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
  
    this.listaGastos = dados.filter((gasto: any) => {
      const dataGasto = new Date(gasto.data);
      return dataGasto >= umMesAtras;
    });
  }

  async salvar() {
    if (this.transacaoForm.invalid) {
      this.exibirToast('Por favor, preencha todos os campos corretamente', 'danger');
      return;
    }

    const formValue = this.transacaoForm.value;
    const [dia, mes, ano] = formValue.data.split('/');
    const dataConvertida = new Date(+ano, +mes - 1, +dia);

    const novaTransacao = {
      nome: formValue.nome,
      valor: parseFloat(formValue.valor.replace(',', '.')),
      data: dataConvertida.toISOString(),
      tipo: this.tipoTransacao,
      categoria: formValue.categoria
    };

    try {
      this.listaGastos.push(novaTransacao);
      await this.storage.set('gastos', this.listaGastos);
      this.exibirToast('Transação salva com sucesso!');
      this.modalCtrl.dismiss({ status: 'salvo' });
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      this.exibirToast('Erro ao salvar transação', 'danger');
    }
}

  cancelar() {
    this.modalCtrl.dismiss({ status: 'cancelado' });
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