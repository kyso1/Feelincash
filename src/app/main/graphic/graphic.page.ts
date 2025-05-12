import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ChartConfiguration, ChartType } from 'chart.js';
import { registerables } from 'chart.js';
import { Chart } from 'chart.js';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-graphic',
  templateUrl: './graphic.page.html',
  styleUrls: ['./graphic.page.scss'],
  standalone: false
})
export class GraphicPage implements OnInit {
  segment: string = '30dias';
  hasData = false;

  // Dados para os gráficos
  chart30DiasData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  chartMensalData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  chartCategoriasData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };

  // Opções para gráficos de barras
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => 'R$ ' + value.toLocaleString('pt-BR'),
          color: '#666'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#666'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        bodyColor: '#fff',
        titleColor: '#fff',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const rawValue = context.raw as number;
            return ` R$ ${rawValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          }
          
        }
      }
    }
  };

  // Opções para gráfico de pizza
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: '#333',
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        bodyColor: '#fff',
        titleColor: '#fff',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = Number(context.raw) || 0;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return ` ${label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
          }          
        }
      }
    }
  };

  // Cores para as categorias
  private categoryColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
    '#FF9F40', '#8AC24A', '#F06292', '#7986CB', '#A1887F'
  ];

  constructor(private databaseService: DatabaseService) {
    Chart.register(...registerables);
  }

  async ngOnInit() {
    await this.carregarDados();
  }

  async ionViewWillEnter() {
    await this.carregarDados();
  }

  segmentChanged() {
    // Atualiza o gráfico quando o segmento muda
    this.loadCharts();
  }

  async carregarDados() {
    const dados: any[] = (await this.databaseService.get('gastos')) || [];
    // Processar os dados para os gráficos
    this.processarDadosParaGraficos(dados);
  }

  private processarDadosParaGraficos(dados: any[]) {
    this.processar30Dias(dados);
    this.processarMensal(dados);
    this.processarCategorias(dados);
  }

  async loadCharts() {
    try {
      const gastos: any[] = await this.databaseService.get('gastos') || [];
      this.hasData = gastos.length > 0;

      if (!this.hasData) return;

      // Processa dados para os últimos 30 dias
      this.processar30Dias(gastos);
      
      // Processa dados mensais
      this.processarMensal(gastos);
      
      // Processa dados por categoria
      this.processarCategorias(gastos);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.hasData = false;
    }
  }

  private processar30Dias(gastos: any[]) {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    const gastosFiltrados = gastos.filter(gasto => {
      const dataGasto = new Date(gasto.data);
      return dataGasto >= trintaDiasAtras && gasto.tipo === 'saida';
    });

    // Agrupa por dia
    const gastosPorDia = gastosFiltrados.reduce((acc, gasto) => {
      const date = new Date(gasto.data);
      const diaMes = `${date.getDate()}/${date.getMonth() + 1}`;
      acc[diaMes] = (acc[diaMes] || 0) + Number(gasto.valor);
      return acc;
    }, {});

    const diasOrdenados = Object.keys(gastosPorDia).sort((a, b) => {
      const [diaA, mesA] = a.split('/').map(Number);
      const [diaB, mesB] = b.split('/').map(Number);
      return new Date(2023, mesA - 1, diaA).getTime() - new Date(2023, mesB - 1, diaB).getTime();
    });

    this.chart30DiasData = {
      labels: diasOrdenados,
      datasets: [{
        label: 'Gastos diários',
        data: diasOrdenados.map(dia => gastosPorDia[dia]),
        backgroundColor: '#36A2EB',
        borderColor: '#2980B9',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  }

  private processarMensal(gastos: any[]) {
    const gastosPorMes = gastos.reduce((acc: Record<string, number>, gasto) => {
      if (gasto.tipo === 'saida') {
        const date = new Date(gasto.data);
        const mesAno = `${date.getMonth() + 1}/${date.getFullYear()}`;
        acc[mesAno] = (acc[mesAno] || 0) + Number(gasto.valor);
      }
      return acc;
    }, {});

    const mesesOrdenados = Object.keys(gastosPorMes).sort((a, b) => {
      const [mesA, anoA] = a.split('/').map(Number);
      const [mesB, anoB] = b.split('/').map(Number);
      return new Date(anoA, mesA - 1).getTime() - new Date(anoB, mesB - 1).getTime();
    });

    this.chartMensalData = {
      labels: mesesOrdenados,
      datasets: [{
        label: 'Total de Gastos Mensais',
        data: mesesOrdenados.map(mes => gastosPorMes[mes]),
        backgroundColor: '#FF6384',
        borderColor: '#E74C3C',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  }

  private processarCategorias(gastos: any[]) {
    const gastosPorCategoria = gastos.reduce((acc: Record<string, number>, gasto) => {
      if (gasto.tipo === 'saida') {
        acc[gasto.categoria] = (acc[gasto.categoria] || 0) + Number(gasto.valor);
      }
      return acc;
    }, {});

    const categoriasOrdenadas = Object.keys(gastosPorCategoria).sort((a, b) => 
      gastosPorCategoria[b] - gastosPorCategoria[a]
    );

    this.chartCategoriasData = {
      labels: categoriasOrdenadas,
      datasets: [{
        data: categoriasOrdenadas.map(cat => gastosPorCategoria[cat]),
        backgroundColor: this.categoryColors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    };
  }
}