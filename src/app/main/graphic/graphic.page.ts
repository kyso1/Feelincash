import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ChartConfiguration } from 'chart.js';
import { registerables } from 'chart.js';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-graphic',
  templateUrl: './graphic.page.html',
  styleUrls: ['./graphic.page.scss'],
  standalone: false
})
export class GraphicPage {
  public chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };
  
  public chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => 'R$ ' + value
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            return 'R$ ' + context.raw;
          }
        }
      }
    }
  };

  public chartType = 'bar' as const;
  hasData = false;

  constructor(private storage: Storage) {
    this.storage.create();
    // Registra todos os componentes do Chart.js
    Chart.register(...registerables);
  }

  async loadChart() {
    try {
      const gastos: any[] = await this.storage.get('gastos') || [];
      
      const gastosPorMes = gastos.reduce((acc: Record<string, number>, gasto) => {
        const date = new Date(gasto.data);
        const mesAno = `${date.getMonth() + 1}/${date.getFullYear()}`;
        acc[mesAno] = (acc[mesAno] || 0) + Number(gasto.valor);
        return acc;
      }, {});

      const mesesOrdenados = Object.keys(gastosPorMes).sort((a, b) => {
        const [mesA, anoA] = a.split('/').map(Number);
        const [mesB, anoB] = b.split('/').map(Number);
        return new Date(anoA, mesA - 1).getTime() - new Date(anoB, mesB - 1).getTime();
      });

      this.chartData = {
        labels: mesesOrdenados,
        datasets: [{
          label: 'Total de Gastos Mensais',
          data: mesesOrdenados.map(mes => gastosPorMes[mes]),
          backgroundColor: 'rgba(255, 193, 7, 0.6)',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 1
        }]
      };

      this.hasData = mesesOrdenados.length > 0;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.hasData = false;
    }
  }
}