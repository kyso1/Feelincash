import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

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
  ordenacao: string = '';

  constructor(private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
    this.carregarTransacoes();
  }

  async carregarTransacoes() {
    const dados = await this.storage.get('gastos');
    this.transacoes = dados || [];
    this.aplicarFiltroOrdenacao();
  }

  aplicarFiltroOrdenacao() {
    this.transacoesFiltradas = this.transacoes.filter((item) => {
      const data = new Date(item.data);
      const mesOk = this.filtroMes ? data.getMonth() + 1 === +this.filtroMes : true;
      const anoOk = this.filtroAno ? data.getFullYear() === +this.filtroAno : true;
      return mesOk && anoOk;
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

  selecionarOrdenacao(tipo: string) {
    this.ordenacao = tipo;
    this.aplicarFiltroOrdenacao();
  }

  async excluirTransacao(index: number) {
    this.transacoes.splice(index, 1);
    await this.storage.set('gastos', this.transacoes);
    this.aplicarFiltroOrdenacao();
  }
}
