import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: false
})
export class TransactionsPage implements OnInit {
  transacoes: any[] = [];
  transacoesFiltradas: any[] = [];

  filtroMes: string = '';
  filtroAno: string = '';
  filtroTipo: string = '';
  filtroCategoria: string = '';
  ordenacao: string = 'data';

  constructor(
    private databaseService: DatabaseService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.carregarTransacoes();
  }

  async carregarTransacoes() {
    const dados: any[] = (await this.databaseService.get('gastos')) || [];
    this.transacoes = dados;
    this.aplicarFiltroOrdenacao();
  }

  aplicarFiltroOrdenacao() {
    this.transacoesFiltradas = this.transacoes.filter((item) => {
      const data = new Date(item.data);
      const mesOk = this.filtroMes ? data.getMonth() + 1 === +this.filtroMes : true;
      const anoOk = this.filtroAno ? data.getFullYear() === +this.filtroAno : true;
      const tipoOk = this.filtroTipo ? item.tipo === this.filtroTipo : true;
      const categoriaOk = this.filtroCategoria ? item.categoria === this.filtroCategoria : true;
      return mesOk && anoOk && tipoOk && categoriaOk;
    });

    switch (this.ordenacao) {
      case 'nome':
        this.transacoesFiltradas.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'valor':
        this.transacoesFiltradas.sort((a, b) => b.valor - a.valor);
        break;
      case 'data':
        this.transacoesFiltradas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        break;
    }
  }

  selecionarMes(mes: string) {
    this.filtroMes = mes;
    this.aplicarFiltroOrdenacao();
  }

  selecionarAno(ano: string) {
    this.filtroAno = ano;
    this.aplicarFiltroOrdenacao();
  }

  selecionarTipo(tipo: string) {
    this.filtroTipo = tipo;
    this.aplicarFiltroOrdenacao();
  }

  selecionarCategoria(categoria: string) {
    this.filtroCategoria = categoria;
    this.aplicarFiltroOrdenacao();
  }

  selecionarOrdenacao(tipo: string) {
    this.ordenacao = tipo;
    this.aplicarFiltroOrdenacao();
  }

  async excluirTransacao(index: number) {
    const indexReal = this.transacoes.findIndex(
      t => t === this.transacoesFiltradas[index]
    );
    if (indexReal !== -1) {
      this.transacoes.splice(indexReal, 1);
      await this.databaseService.set('gastos', this.transacoes);
      this.aplicarFiltroOrdenacao();
    }
  }

  async exibirToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
      color: 'danger',
    });
    toast.present();
  }

  async confirmarLimpeza() {
    const alert = await this.alertCtrl.create({
      header: 'Limpar todos os gastos?',
      message: 'Essa ação não pode ser desfeita.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Confirmar',
          role: 'destructive',
          handler: () => {
            this.limparGastos();
          },
        },
      ],
    });
    await alert.present();
  }

  async limparGastos() {
    await this.databaseService.remove('gastos');
    this.transacoes = [];
    this.transacoesFiltradas = [];
    this.exibirToast('Todos os gastos foram apagados.');
  }
}
