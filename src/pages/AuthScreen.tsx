import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ShieldCheck, AlertCircle, Loader2, Zap, HardDriveDownload } from 'lucide-react';
import { useAuth, type Perfil, garantirUsuarioDemo } from '../hooks/useAuth';
import { useDataSourcesStore } from '../store/dataSources';
import { generateMockDataset } from '../lib/mockData';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Field } from '../components/ui/Select';

const PERFIS: Perfil[] = ['Administrador', 'Diretoria', 'Controladoria', 'Contabilidade', 'Financeiro', 'Compras'];
const DEMO_USER_EMAIL = 'demo@controladoria.com';

export function AuthScreen() {
  const { signIn, signUp, demoSignIn, loading, error } = useAuth();
  const { commitImport, importedRecords } = useDataSourcesStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('Diretoria');

  const [installing, setInstalling] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (!error) navigate('/');
    } else {
      const { error } = await signUp(email, password, nome || email.split('@')[0], perfil);
      if (!error) {
        const { error: loginErr } = await signIn(email, password);
        if (!loginErr) navigate('/');
      }
    }
  };

  const enterDemo = () => {
    demoSignIn();
    navigate('/');
  };

  const installLocalDemo = async () => {
    setInstalling(true);
    await new Promise(r => setTimeout(r, 600)); // Simula o processo
    const mockData = generateMockDataset();
    commitImport(mockData, 'replace', {
      fileName: 'Demonstração Local',
      fileSize: 0, // Não aplicável
      importedAt: new Date().toISOString(),
      importedBy: 'Sistema',
      rowCount: mockData.length,
      mode: 'replace',
      status: 'success',
      notes: 'Dados de demonstração instalados localmente.',
    });
    setInstalling(false);
    demoSignIn();
    navigate('/');
  };

  const fillDemo = async () => {
    setEmail(DEMO_USER_EMAIL);
    setPassword('demo123');
    setNome('Usuário Demo');
    setPerfil('Diretoria');
    await garantirUsuarioDemo();
    const { error: loginErr } = await signIn(DEMO_USER_EMAIL, 'demo123');
    if (loginErr) {
      const { error: signupErr } = await signUp(DEMO_USER_EMAIL, 'demo123', 'Usuário Demo', 'Diretoria');
      if (!signupErr) {
        const { error: retry } = await signIn(DEMO_USER_EMAIL, 'demo123');
        if (!retry) navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-page p-6">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[540px] p-12 relative overflow-hidden h-[640px]">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, var(--accent-primary) 0, transparent 40%), radial-gradient(circle at 80% 70%, var(--status-info) 0, transparent 45%)' }} />
        <div className="relative">
          <img src="/cerne-logo-full-v2.svg" alt="Cerne" className="h-24" />
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold text-content leading-tight max-w-sm mt-4"
          >
            Uma visão única, interativa e confiável de toda a empresa.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-sm text-content-muted mt-3 max-w-sm leading-relaxed"
          >
            KPIs em tempo real, drill-down até o lançamento, alertas inteligentes e dados consolidados — para o Diretor Financeiro e de Controladoria tomarem decisões com confiança.
          </motion.p>
        </div>
        <div className="relative grid grid-cols-3 gap-3 max-w-sm">
          {[
            { v: '13', l: 'KPIs' },
            { v: '15+', l: 'Gráficos' },
            { v: '16', l: 'Módulos' },
          ].map((s) => (
            <div key={s.l} className="card-base p-4">
              <p className="text-2xl font-bold text-accent">{s.v}</p>
              <p className="text-[10px] uppercase tracking-wide text-content-muted mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex items-center justify-center w-full lg:w-[440px] p-6 lg:p-0">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <img src="/cerne-logo-full-v2.svg" alt="Cerne" className="lg:hidden h-24 mb-8" />

          <h2 className="text-xl font-semibold text-content">{mode === 'login' ? 'Entrar na plataforma' : 'Criar sua conta'}</h2>
          <p className="text-sm text-content-muted mt-1">{mode === 'login' ? 'Acesse com suas credenciais corporativas.' : 'Preencha os dados para começar.'}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <Field label="Nome">
                <div className="relative">
                  <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="pl-9" required />
                </div>
              </Field>
            )}
            <Field label="E-mail">
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" className="pl-9" required autoComplete="email" />
              </div>
            </Field>
            <Field label="Senha">
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              </div>
            </Field>
            {mode === 'signup' && (
              <Field label="Perfil de acesso">
                <Select value={perfil} onChange={(v) => setPerfil(v as Perfil)} options={PERFIS.map((p) => ({ label: p, value: p }))} />
              </Field>
            )}

            {error && (
              <div className="flex items-start gap-2 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Aguarde…</> : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}
