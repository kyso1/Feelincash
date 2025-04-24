import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-inserir',
  templateUrl: './inserir.page.html',
  styleUrls: ['./inserir.page.scss'],
  standalone: false
})
export class InserirPage implements OnInit {
  gastoForm: FormGroup;
  listaGastos: any[] = [];

  constructor(
    private storage: Storage,
    private fb: FormBuilder,
    private toastCtrl: ToastController
  ) {
    this.gastoForm = this.fb.group({
      nome: ['', Validators.required],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      data: [
        '',
        [Validators.required, this.validarDataReal()],
      ],
    });
  }

  async ngOnInit() {
    await this.storage.create();
    this.carregarGastos();
  }

  async carregarGastos() {
    const dados = await this.storage.get('gastos');
    this.listaGastos = dados || [];
  }

  async adicionarGasto() {
    if (this.gastoForm.valid) {
      const { nome, valor, data } = this.gastoForm.value;
      const [dia, mes, ano] = data.split('/');
      const dataConvertida = new Date(+ano, +mes - 1, +dia);

      const novoGasto = {
        nome,
        valor,
        data: dataConvertida.toISOString(),
      };

      this.listaGastos.push(novoGasto);
      await this.storage.set('gastos', this.listaGastos);
      this.gastoForm.reset();
      this.exibirToast('Gasto salvo com sucesso!');
    }
  }

  async limparGastos() {
    await this.storage.remove('gastos');
    this.listaGastos = [];
    this.exibirToast('Todos os gastos foram apagados.');
  }

  // Validador customizado de data real
  validarDataReal() {
    return (control: AbstractControl) => {
      const regex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!regex.test(control.value)) return { dataInvalida: true };

      const [dia, mes, ano] = control.value.split('/').map(Number);
      const data = new Date(ano, mes - 1, dia);
      if (
        data.getFullYear() !== ano ||
        data.getMonth() + 1 !== mes ||
        data.getDate() !== dia
      ) {
        return { dataInvalida: true };
      }
      return null;
    };
  }

  // Autoformatação do campo data
  formatarDataInput(event: any) {
    let valor = event.detail.value.replace(/\D/g, '');
    if (valor.length > 2 && valor.length <= 4)
      valor = valor.slice(0, 2) + '/' + valor.slice(2);
    else if (valor.length > 4)
      valor = valor.slice(0, 2) + '/' + valor.slice(2, 4) + '/' + valor.slice(4, 8);
    this.gastoForm.get('data')?.setValue(valor, { emitEvent: false });
  }

  async exibirToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    toast.present();
  }

  async verificarDados() {
    const dados = await this.storage.get('gastos');
    console.log('Dados atuais no Storage:', dados);
    if (dados) {
      console.log('Último gasto:', dados[dados.length - 1]);
      console.log('Data do último gasto:', new Date(dados[dados.length - 1].data));
    }
  }

}
