import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ConstantesModalComponent } from './constantes-modal/constantes-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  saldoMensal: number = 0;
  salario: number = 0;
  contasFixas: { [key: string]: number } = {};

  constructor(
    private storage: Storage,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.carregarConstantes();
    await this.calcularSaldoMensal();
  }

  async carregarConstantes() {
    this.salario = (await this.storage.get('salario')) || 0;
    this.contasFixas = (await this.storage.get('contasFixas')) || {};
  }

  async calcularSaldoMensal() {
    const dados = await this.storage.get('gastos') || [];
    const hoje = new Date();
    const umMesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());

    let entradas = 0;
    let saidas = 0;

    for (const item of dados) {
      const data = new Date(item.data);
      if (data >= umMesAtras) {
        if (item.tipo === 'entrada') entradas += item.valor;
        else if (item.tipo === 'saida') saidas += item.valor;
      }
    }

    const totalFixas = Object.values(this.contasFixas).reduce((acc, val) => acc + val, 0);
    this.saldoMensal = this.salario + entradas - saidas - totalFixas;
  }

  async abrirModalConstantes() {
    const modal = await this.modalCtrl.create({
      component: ConstantesModalComponent
    });

    modal.onDidDismiss().then(async () => {
      await this.carregarConstantes();
      await this.calcularSaldoMensal();
    });

    await modal.present();
  }
}
