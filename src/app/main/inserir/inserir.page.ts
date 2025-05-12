import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastController, NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';

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
    private databaseService: DatabaseService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {
    this.gastoForm = this.fb.group({
      nome: ['', Validators.required],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      data: [this.obterDataHoje(), [Validators.required, this.validarDataReal()]],
      tipo: ['saida'],
      categoria: ['Outros', Validators.required]
    });
  }

  async ngOnInit() {
    this.carregarGastos();
  }

  async carregarGastos() {
    const dados: any[] = (await this.databaseService.get('gastos')) || [];
    const hoje = new Date();
    const umMesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
    this.listaGastos = dados.filter((gasto: any) => {
      const dataGasto = new Date(gasto.data);
      return dataGasto >= umMesAtras;
    });
  }
  

  async adicionarGasto() {
    if (this.gastoForm.valid) {
      const { nome, valor, data, tipo, categoria } = this.gastoForm.value;
      const [dia, mes, ano] = data.split('/');
      const dataConvertida = new Date(+ano, +mes - 1, +dia);
  
      const novoGasto = {
        nome,
        valor,
        data: dataConvertida.toISOString(),
        tipo,
        categoria
      };
  
      this.listaGastos.push(novoGasto);
      await this.databaseService.set('gastos', this.listaGastos);
      this.gastoForm.reset({ tipo: 'saida', categoria: 'Outros' });
      this.exibirToast('Gasto salvo com sucesso!');

      // Navegar de volta para a página inicial
      this.navCtrl.navigateBack('/home');
    }
  }

  validarDataReal() {
    return (control: AbstractControl) => {
      const valor = control.value;
      const regex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/;
  
      if (!regex.test(valor)) return { dataInvalida: true };
  
      const [dia, mes, ano] = valor.split('/').map(Number);
      const data = new Date(ano, mes - 1, dia);
      //verifica se a data é válida 
      if (
        data.getFullYear() !== ano ||
        data.getMonth() + 1 !== mes ||
        data.getDate() !== dia
      ) {
        return { dataInvalida: true };
      }
      //verifica se a data é maior que 2024
      const dataMinima = new Date(2024, 0, 1);
      if (data < dataMinima) {
        return { dataMuitoAntiga: true };
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
    this.gastoForm.get('valor')?.setValue(valor, { emitEvent: false });

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
    const dados = await this.databaseService.get<any[]>('gastos');
    console.log('Dados atuais no Storage:', dados);
    if (Array.isArray(dados) && dados.length > 0) {
      console.log('Último gasto:', dados[dados.length - 1]);
      console.log('Data do último gasto:', new Date(dados[dados.length - 1].data));
    }
  }

  async confirmarLimpeza() {
    // Removendo a funcionalidade de limpar todos os gastos
  }

}
