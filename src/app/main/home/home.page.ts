import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ConstantesModalComponent } from './constantes-modal/constantes-modal.component';
import { TransacaoModalComponent } from './transacao-modal/transacao-modal.component';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// Registrar o idioma português
registerLocaleData(localePt);

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
  totalReceitas: number = 0;
  totalDespesas: number = 0;
  usuarioNome: string = 'Usuário';
  dataAtual: Date = new Date();
  diasDecorridos: number = 0;
  diasTotalMes: number = 0;
  diasRestantesMes: number = 0;
  dicaDoDia: string = '';

  private dicasFinanceiras: string[] = [
    "Reserve pelo menos 10% do seu salário para emergências.",
    "Revise suas assinaturas mensais e cancele as que não usa.",
    "Compare preços antes de fazer compras importantes.",
    "Estabeleça metas financeiras realistas para o ano.",
    "Use aplicativos de cashback para economizar nas compras.",
    "Evite compras por impulso, faça uma lista antes de ir ao mercado.",
    "Pesquise sobre investimentos antes de aplicar seu dinheiro.",
    "Considere comprar produtos de segunda mão para economizar.",
    "Aprenda a cozinhar pratos simples para economizar em refeições fora.",
    "Mantenha um controle mensal de suas despesas para identificar onde pode economizar.",
    "Estabeleça um orçamento mensal para evitar se perder em suas contas.",
    "Evite usar o cartão de crédito para compras que não pode pagar à vista.",
  ];

  constructor(
    private storage: Storage,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.carregarDadosUsuario();
    await this.carregarConstantes();
    await this.calcularSaldoMensal();
    this.calcularProgressoMes();
    this.gerarDicaDoDia();
  }

  async carregarDadosUsuario() {
    this.usuarioNome = (await this.storage.get('nomeUsuario')) || 'Usuário';
  }

  async carregarConstantes() {
    this.salario = (await this.storage.get('salario')) || 0;
    this.contasFixas = (await this.storage.get('contasFixas')) || {};
  }

  async calcularSaldoMensal() {
    const dados = await this.storage.get('gastos') || [];
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    this.totalReceitas = this.salario;
    this.totalDespesas = Object.values(this.contasFixas).reduce((acc, val) => acc + val, 0);

    for (const item of dados) {
      const data = new Date(item.data);
      if (data >= primeiroDiaMes) {
        if (item.tipo === 'entrada') {
          this.totalReceitas += item.valor;
        } else if (item.tipo === 'saida') {
          this.totalDespesas += item.valor;
        }
      }
    }

    this.saldoMensal = this.totalReceitas - this.totalDespesas;
  }

  calcularProgressoMes() {
    const hoje = new Date();
    this.dataAtual = hoje;
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    this.diasDecorridos = hoje.getDate();
    this.diasTotalMes = ultimoDiaMes.getDate();
    this.diasRestantesMes = this.diasTotalMes - this.diasDecorridos;
  }

  gerarDicaDoDia() {
    const indice = Math.floor(Math.random() * this.dicasFinanceiras.length);
    this.dicaDoDia = this.dicasFinanceiras[indice];
  }

  async abrirModalConstantes() {
    const modal = await this.modalCtrl.create({
      component: ConstantesModalComponent
    });

    modal.onDidDismiss().then(async () => {
      await this.carregarConstantes();
      await this.calcularSaldoMensal();
      this.mostrarToast('Dados atualizados com sucesso!');
    });

    await modal.present();
  }

  async abrirModalTransacao(tipo: 'entrada' | 'saida') {
    const modal = await this.modalCtrl.create({
      component: TransacaoModalComponent,
      componentProps: {
        tipoTransacao: tipo
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.status === 'salvo') {
      await this.calcularSaldoMensal();
      this.mostrarToast(`Transação de ${tipo === 'entrada' ? 'entrada' : 'saída'} registrada!`);
    } else if (data?.status === 'cancelado') {
      this.mostrarToast('Cancelado!', 'medium');
    }
  }

  async refreshPage() {
    await this.carregarConstantes();
    await this.calcularSaldoMensal();
    this.calcularProgressoMes();
    this.gerarDicaDoDia();
    this.mostrarToast('Página atualizada!');
  }

  async mostrarToast(mensagem: string, color: 'success' | 'medium' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }
}
