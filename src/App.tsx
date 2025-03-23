// Protótipo do sistema de sugestão de rolagens - Versão inicial em React (estrutura visual)
import { useState } from 'react';

export default function PainelRolagem() {
  const [form, setForm] = useState({
    assessor: '',
    cliente: '',
    tipoOperacao: '',
    strikeAtual: '',
    vencimentoAtual: '',
    premioAtual: '',
    quantidade: '',
    preferencia: '',
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calcularRolagem = () => {
    const strikeNovo = parseFloat(form.strikeAtual) + 1;
    const premioNovo = parseFloat(form.premioAtual) - 0.2;
    const net = parseFloat(form.premioAtual) - premioNovo;

    setResultado({
      strikeNovo,
      premioNovo,
      net,
    });
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h1>Painel de Sugestão de Rolagens</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input name="assessor" placeholder="Nome do Assessor" onChange={handleChange} />
        <input name="cliente" placeholder="Nome do Cliente" onChange={handleChange} />
        <input name="tipoOperacao" placeholder="Tipo de Operação" onChange={handleChange} />
        <input name="strikeAtual" type="number" placeholder="Strike Atual" onChange={handleChange} />
        <input name="vencimentoAtual" placeholder="Vencimento Atual (ex: 18/03)" onChange={handleChange} />
        <input name="premioAtual" type="number" placeholder="Prêmio Atual" onChange={handleChange} />
        <input name="quantidade" type="number" placeholder="Quantidade de Contratos" onChange={handleChange} />
        <input name="preferencia" placeholder="Preferência de Rolagem" onChange={handleChange} />

        <button onClick={calcularRolagem}>Calcular Sugestão</button>
      </div>

      {resultado && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <h2>Sugestão de Rolagem</h2>
          <p><strong>Novo Strike:</strong> {resultado.strikeNovo?.toFixed(2)}</p>
<p><strong>Prêmio Estimado:</strong> R$ {resultado.premioNovo?.toFixed(2)}</p>
<p><strong>Net da Rolagem:</strong> R$ {resultado.net?.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}