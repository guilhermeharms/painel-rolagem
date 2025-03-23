// Protótipo do sistema de sugestão de rolagens - Versão inicial em React (estrutura visual)
import { useState, ChangeEvent } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface Formulario {
  assessor: string;
  cliente: string;
  tipoOperacao: string;
  precoAtivo: string;
  strikeAtual: string;
  strikeSecundario?: string;
  premioAtual: string;
  vencimentoDias: string;
  volatilidade: string;
  quantidade: string;
  preferencia: string;
}

interface Resultado {
  estrutura: string;
  strikeNovo: number;
  strikeSecundario?: number;
  premioEstimado: number;
  net: number;
  riscoMaximo: number;
  retornoMaximo: number;
  payoff: { preco: number; resultado: number }[];
}

export default function PainelRolagem() {
  const [form, setForm] = useState<Formulario>({
    assessor: '',
    cliente: '',
    tipoOperacao: '',
    precoAtivo: '',
    strikeAtual: '',
    strikeSecundario: '',
    premioAtual: '',
    vencimentoDias: '',
    volatilidade: '',
    quantidade: '',
    preferencia: '',
  });

  const [resultado, setResultado] = useState<Resultado | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calcularPremioTeorico = (S: number, K: number, T: number, vol: number) => {
    const d1 = (Math.log(S / K)) / (vol * Math.sqrt(T));
    const nd1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
    const call = (S - K) * 0.5 + vol * S * Math.sqrt(T) * nd1;
    return Math.max(call, 0.01);
  };

  const calcularPayoffSpread = (K1: number, K2: number, premio: number, quantidade: number) => {
    const pontos: { preco: number; resultado: number }[] = [];
    for (let p = K1 - 5; p <= K2 + 5; p += 0.5) {
      let resultado = 0;
      if (p <= K1) resultado = premio * quantidade;
      else if (p >= K2) resultado = (premio - (K2 - K1)) * quantidade;
      else resultado = (premio - (p - K1)) * quantidade;
      pontos.push({ preco: parseFloat(p.toFixed(2)), resultado: parseFloat(resultado.toFixed(2)) });
    }
    return pontos;
  };

  const calcularRolagem = () => {
    const S = parseFloat(form.precoAtivo);
    const K1 = parseFloat(form.strikeAtual);
    const K2 = parseFloat(form.strikeSecundario || '0');
    const premioAtual = parseFloat(form.premioAtual);
    const dias = parseInt(form.vencimentoDias);
    const T = dias / 252;
    const vol = parseFloat(form.volatilidade) / 100;
    const qtd = parseInt(form.quantidade);

    if (form.tipoOperacao.toLowerCase().includes("put spread")) {
      const premioVenda = calcularPremioTeorico(S, K2, T, vol);
      const premioCompra = calcularPremioTeorico(S, K1, T, vol);
      const premioLiquido = premioVenda - premioCompra;
      const riscoMaximo = (K2 - K1) - premioLiquido;
      const retornoMaximo = premioLiquido;
      const payoff = calcularPayoffSpread(K1, K2, premioLiquido, qtd);

      setResultado({
        estrutura: 'Put Spread Vendida',
        strikeNovo: K2,
        strikeSecundario: K1,
        premioEstimado: premioLiquido,
        net: premioLiquido - premioAtual,
        riscoMaximo: riscoMaximo * qtd,
        retornoMaximo: retornoMaximo * qtd,
        payoff
      });
    } else {
      const strikeNovo = K1 + 1;
      const premioNovo = calcularPremioTeorico(S, strikeNovo, T, vol);
      const net = premioNovo - premioAtual;
      const payoff = calcularPayoffSpread(strikeNovo - 2, strikeNovo, premioNovo, qtd);

      setResultado({
        estrutura: 'Call ou Put Simples',
        strikeNovo,
        premioEstimado: premioNovo,
        net,
        riscoMaximo: 0,
        retornoMaximo: premioNovo * qtd,
        payoff
      });
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
      <h1>Painel de Sugestão de Rolagens</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input name="assessor" placeholder="Nome do Assessor" onChange={handleChange} />
        <input name="cliente" placeholder="Nome do Cliente" onChange={handleChange} />
        <input name="tipoOperacao" placeholder="Tipo de Operação (call, put, put spread...)" onChange={handleChange} />
        <input name="precoAtivo" placeholder="Preço do Ativo" type="number" onChange={handleChange} />
        <input name="strikeAtual" placeholder="Strike Atual (da Put comprada)" type="number" onChange={handleChange} />
        <input name="strikeSecundario" placeholder="Strike Secundário (da Put vendida)" type="number" onChange={handleChange} />
        <input name="premioAtual" placeholder="Prêmio Atual (recebido)" type="number" onChange={handleChange} />
        <input name="vencimentoDias" placeholder="Dias para o Vencimento" type="number" onChange={handleChange} />
        <input name="volatilidade" placeholder="Volatilidade Implícita (%)" type="number" onChange={handleChange} />
        <input name="quantidade" placeholder="Quantidade de Contratos" type="number" onChange={handleChange} />
        <input name="preferencia" placeholder="Preferência de Rolagem (crédito, risco, tática...)" onChange={handleChange} />

        <button onClick={calcularRolagem}>Calcular Sugestão</button>
      </div>

      {resultado && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <h2>Sugestão de Rolagem ({resultado.estrutura})</h2>
          <p><strong>Strike Principal:</strong> {resultado.strikeNovo.toFixed(2)}</p>
          {resultado.strikeSecundario && (
            <p><strong>Strike Secundário:</strong> {resultado.strikeSecundario.toFixed(2)}</p>
          )}
          <p><strong>Prêmio Estimado:</strong> R$ {resultado.premioEstimado.toFixed(2)}</p>
          <p><strong>Net da Rolagem:</strong> R$ {resultado.net.toFixed(2)}</p>
          <p><strong>Retorno Máximo:</strong> R$ {resultado.retornoMaximo.toFixed(2)}</p>
          <p><strong>Risco Máximo:</strong> R$ {resultado.riscoMaximo.toFixed(2)}</p>

          <h3>Gráfico de Payoff</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={resultado.payoff}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="preco" label={{ value: 'Preço do Ativo', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Resultado (R$)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="resultado" stroke="#8884d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
