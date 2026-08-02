import { useState } from 'react';
import {
  Database, Download, FileText, ShoppingCart, Hammer, Boxes, FolderKanban, Building2,
  LayoutDashboard, Banknote, ShieldCheck, TrendingUp, BarChart3, Package,
  Wallet, Target, FileSpreadsheet, Activity, type LucideIcon, Code, X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/format';

type DataSource = 'mock' | 'excel' | 'bigquery';

interface ModuloFonte {
  id: string;
  nome: string;
  descricao: string;
  icon: LucideIcon;
  colunas: string[];
}

const MODULOS: ModuloFonte[] = [
  { id: 'dashboard', nome: 'Dashboard Executivo', descricao: 'Visão geral consolidada', icon: LayoutDashboard, colunas: [] },
  { id: 'financeiro', nome: 'Financeiro', descricao: 'Contas a pagar/receber, tesouraria', icon: Banknote, colunas: ['data', 'empresa', 'categoria', 'fornecedor', 'cliente', 'tipoMovimento', 'status', 'valor'] },
  { id: 'controladoria', nome: 'Controladoria', descricao: 'Conciliação, fechamento, auditoria', icon: ShieldCheck, colunas: ['data', 'conta', 'saldoContabil', 'saldoAuxiliar', 'responsavel'] },
  { id: 'capex', nome: 'CAPEX', descricao: 'Investimentos em capital', icon: Hammer, colunas: ['data', 'projeto', 'categoria', 'empresa', 'valor', 'budget', 'realizado'] },
  { id: 'opex', nome: 'OPEX', descricao: 'Despesas operacionais', icon: Boxes, colunas: ['data', 'centroCusto', 'categoria', 'empresa', 'valor', 'budget'] },
  { id: 'fluxo-caixa', nome: 'Fluxo de Caixa', descricao: 'Projeções e realizado de caixa', icon: Wallet, colunas: ['data', 'empresa', 'categoria', 'tipoMovimento', 'valor'] },
  { id: 'resultado', nome: 'Resultado', descricao: 'DRE e margens', icon: TrendingUp, colunas: ['data', 'empresa', 'categoria', 'tipoMovimento', 'valor', 'depreciacao'] },
  { id: 'ebitda', nome: 'EBITDA', descricao: 'Análise de EBITDA e EBIT', icon: Activity, colunas: ['data', 'empresa', 'categoria', 'tipoMovimento', 'valor', 'depreciacao'] },
  { id: 'budget', nome: 'Budget x Real', descricao: 'Orçado vs realizado', icon: Target, colunas: ['data', 'empresa', 'centroCusto', 'categoria', 'budget', 'realizado', 'forecast'] },
  { id: 'compras', nome: 'Compras', descricao: 'Pedidos, recebimentos, fornecedores', icon: ShoppingCart, colunas: ['data', 'fornecedor', 'empresa', 'categoria', 'documento', 'notaFiscal', 'status', 'valor'] },
  { id: 'estoque', nome: 'Estoque', descricao: 'Saldo, giro e cobertura', icon: Package, colunas: ['data', 'empresa', 'item', 'categoria', 'quantidade', 'valorUnitario'] },
  { id: 'projetos', nome: 'Projetos', descricao: 'Portfólio de projetos', icon: FolderKanban, colunas: ['nome', 'empresa', 'responsavel', 'inicio', 'fim', 'orcamento', 'realizado', 'status', 'progresso'] },
  { id: 'imobilizado', nome: 'Imobilizado', descricao: 'Ativo imobilizado e depreciação', icon: Building2, colunas: ['descricao', 'empresa', 'categoria', 'dataAquisicao', 'valorAquisicao', 'vidaUtilMeses', 'status'] },
  { id: 'indicadores', nome: 'Indicadores', descricao: 'KPIs e métricas', icon: BarChart3, colunas: [] },
  { id: 'lancamentos', nome: 'Lançamentos', descricao: 'Tabela fato universal', icon: FileSpreadsheet, colunas: ['data', 'empresa', 'loja', 'centroCusto', 'categoria', 'fornecedor', 'cliente', 'projeto', 'documento', 'tipoMovimento', 'status', 'responsavel', 'valor', 'budget', 'realizado', 'depreciacao', 'quantidade', 'imobilizado'] },
];

const FONTES_OPCOES: { id: DataSource; nome: string; desc: string }[] = [
  { id: 'mock', nome: 'Mock', desc: 'Usando dados simulados internos. Nenhuma configuração necessária.' },
  { id: 'excel', nome: 'Excel / CSV', desc: 'Importação manual de arquivos. Use os templates abaixo.' },
  { id: 'bigquery', nome: 'BigQuery', desc: 'Conexão direta com o data warehouse no Google Cloud.' },
];

function downloadCSV(nomeArquivo: string, colunas: string[]) {
  const csvHeader = colunas.join(',');
  const blob = new Blob([csvHeader], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nomeArquivo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function getBigQuerySchema(tableName: string, colunas: string[]): string {
  const fields = colunas.map(col => `  ${col} STRING`).join(',\n');
  return `CREATE TABLE \`your-project.your_dataset.${tableName}\` (\n${fields}\n);`;
}

function FontesTab() {
  const [fontes, setFontes] = useState<Record<string, DataSource>>(() =>
    Object.fromEntries(MODULOS.map(m => [m.id, 'mock']))
  );
  const [schemaModal, setSchemaModal] = useState<ModuloFonte | null>(null);

  return (
    <>
      <Card>
        <CardHeader
          title="Fonte de Dados por Módulo"
          subtitle="Selecione a origem dos dados para cada página. A mudança é aplicada imediatamente."
        />
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULOS.map(modulo => (
            <div key={modulo.id} className="rounded-xl border border-border-subtle bg-surface p-4 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 grid place-items-center rounded-lg bg-accent/10 text-accent">
                  <modulo.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-content">{modulo.nome}</h3>
                  <p className="text-xs text-content-muted">{modulo.descricao}</p>
                </div>
              </div>
              <div className="space-y-2 flex-1 flex flex-col">
                {FONTES_OPCOES.map(fonte => {
                  const isActive = fontes[modulo.id] === fonte.id;
                  const isTemplateAvailable = modulo.colunas.length > 0 && (fonte.id === 'excel' || fonte.id === 'bigquery');
                  return (
                    <button
                      key={fonte.id}
                      onClick={() => setFontes(prev => ({ ...prev, [modulo.id]: fonte.id }))}
                      className={cn(
                        'w-full text-left p-2.5 rounded-lg border transition-all',
                        isActive
                          ? 'bg-accent/5 border-accent/30 ring-2 ring-accent/20'
                          : 'border-border-subtle hover:border-border-muted'
                      )}
                    >
                      <p className="text-xs font-semibold text-content">{fonte.nome}</p>
                      <p className="text-[11px] text-content-muted">{fonte.desc}</p>
                      {isActive && (
                        <div className="flex items-center justify-between mt-2">
                          <Badge tone="success">Fonte ativa</Badge>
                          {isTemplateAvailable && fonte.id === 'excel' && (
                            <Button variant="ghost" size="xs" leftIcon={<Download size={12} />} onClick={(e) => { e.stopPropagation(); downloadCSV(`template_${modulo.id}`, modulo.colunas); }}>
                              Template CSV
                            </Button>
                          )}
                          {isTemplateAvailable && fonte.id === 'bigquery' && (
                            <Button variant="ghost" size="xs" leftIcon={<Code size={12} />} onClick={(e) => { e.stopPropagation(); setSchemaModal(modulo); }}>
                              Ver Esquema
                            </Button>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {schemaModal && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSchemaModal(null)} />
          <motion.div
            className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CardHeader title={`Esquema BigQuery: ${schemaModal.nome}`} subtitle={`Estrutura da tabela recomendada para o módulo.`} />
            <pre className="bg-page text-xs text-content-muted p-4 m-4 mt-0 rounded-lg overflow-x-auto">
              <code>{getBigQuerySchema(schemaModal.id, schemaModal.colunas)}</code>
            </pre>
            <button onClick={() => setSchemaModal(null)} className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full text-content-muted hover:bg-surface-hover hover:text-content">
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}

export function FontesPage() {
  return (
    <div className="pb-20 md:pb-6">
      <PageHeader
        title="Fontes de Dados"
        subtitle="Gerencie as origens de dados, importe arquivos e utilize nossos templates para facilitar a carga."
      />
      <div className="space-y-6">
        <FontesTab />
      </div>
    </div>
  );
}
