// Selecionar todos os itens do menu e as abas
const itensMenu = document.querySelectorAll('.menu-item');
const abas = document.querySelectorAll('.aba');
const tituloAba = document.getElementById('titulo-aba');

// Adicionar evento de clique em cada item do menu
itensMenu.forEach(item => {
    item.addEventListener('click', () => {
        // Remover classe ativa de todos os itens
        itensMenu.forEach(i => i.classList.remove('active'));
        // Adicionar classe ativa no item clicado
        item.classList.add('active');

        // Obtém o nome da aba a ser exibida
        const idAba = item.getAttribute('data-tab');

        // Esconder todas as abas
        abas.forEach(aba => aba.classList.remove('ativa'));
        // Exibir a aba selecionada
        document.getElementById(idAba).classList.add('ativa');

        // Atualizar o título do cabeçalho
        tituloAba.textContent = item.textContent.trim();
    });
});
// ------------------- GESTÃO DE MOTOS -------------------
let listaMotos = JSON.parse(localStorage.getItem('motos')) || [];

// Elementos
const btnAbrirCadastro = document.getElementById('btnAbrirCadastro');
const modalMoto = document.getElementById('modalMoto');
const fecharModal = document.querySelector('.fechar-modal');
const btnCancelar = document.getElementById('btnCancelar');
const formMoto = document.getElementById('formMoto');
const tituloModal = document.getElementById('tituloModal');
const buscaMoto = document.getElementById('buscaMoto');

// Abrir modal
btnAbrirCadastro.addEventListener('click', () => {
    tituloModal.textContent = 'Cadastrar Nova Moto';
    formMoto.reset();
    document.getElementById('idMoto').value = '';
    modalMoto.style.display = 'block';
});

// Fechar modal
fecharModal.addEventListener('click', () => modalMoto.style.display = 'none');
btnCancelar.addEventListener('click', () => modalMoto.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modalMoto) modalMoto.style.display = 'none';
});

// Salvar moto
formMoto.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('idMoto').value;
    const modelo = document.getElementById('modelo').value.trim();
    const placa = document.getElementById('placa').value.trim().toUpperCase();
    const ano = parseInt(document.getElementById('ano').value);
    const kmAtual = parseInt(document.getElementById('kmAtual').value);
    const kmUltimaTroca = parseInt(document.getElementById('kmUltimaTroca').value);
    const intervaloTroca = parseInt(document.getElementById('intervaloTroca').value);
    const situacao = document.getElementById('situacao').value;

    const proximaTroca = kmUltimaTroca + intervaloTroca;

    const moto = { id: id || Date.now(), modelo, placa, ano, kmAtual, kmUltimaTroca, intervaloTroca, proximaTroca, situacao };

    if (id) {
        const index = listaMotos.findIndex(m => m.id == id);
        listaMotos[index] = moto;
    } else {
        listaMotos.push(moto);
    }

    salvarNoLocalStorage();
    atualizarTabelaMotos();
    modalMoto.style.display = 'none';
});

// Atualizar tabela
function atualizarTabelaMotos(filtradas = listaMotos) {
    const corpo = document.getElementById('corpoTabelaMotos');
    corpo.innerHTML = '';

    if (filtradas.length === 0) {
        corpo.innerHTML = `<tr><td colspan="8" class="vazio">Nenhuma moto encontrada.</td></tr>`;
        return;
    }

    filtradas.forEach(moto => {
        const kmRestante = moto.proximaTroca - moto.kmAtual;
        const alertaTroca = kmRestante <= 500 ? 'text-danger' : '';

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${moto.modelo}</td>
            <td>${moto.placa}</td>
            <td>${moto.ano}</td>
            <td>${moto.kmAtual.toLocaleString()} km</td>
            <td>${moto.kmUltimaTroca.toLocaleString()} km</td>
            <td class="${alertaTroca}">${moto.proximaTroca.toLocaleString()} km<br>
                <small>Faltam ${kmRestante.toLocaleString()} km</small>
            </td>
            <td><span class="badge badge-${moto.situacao}">${traduzirSituacao(moto.situacao)}</span></td>
            <td class="acoes">
                <button class="btn-acao btn-editar" onclick="editarMoto(${moto.id})"><i class="fa fa-pencil"></i></button>
                <button class="btn-acao btn-troca" onclick="registrarTrocaOleo(${moto.id})"><i class="fa fa-oil"></i> Troca</button>
                <button class="btn-acao btn-excluir" onclick="excluirMoto(${moto.id})"><i class="fa fa-trash"></i></button>
            </td>
        `;
        corpo.appendChild(linha);
    });
}

// Funções auxiliares
function traduzirSituacao(sit) {
    const nomes = {
        disponivel: 'Disponível',
        alugada: 'Alugada',
        manutencao: 'Em Manutenção',
        inativa: 'Inativa'
    };
    return nomes[sit] || sit;
}

function editarMoto(id) {
    const moto = listaMotos.find(m => m.id == id);
    if (!moto) return;

    tituloModal.textContent = 'Editar Moto';
    document.getElementById('idMoto').value = moto.id;
    document.getElementById('modelo').value = moto.modelo;
    document.getElementById('placa').value = moto.placa;
    document.getElementById('ano').value = moto.ano;
    document.getElementById('kmAtual').value = moto.kmAtual;
    document.getElementById('kmUltimaTroca').value = moto.kmUltimaTroca;
    document.getElementById('intervaloTroca').value = moto.intervaloTroca;
    document.getElementById('situacao').value = moto.situacao;

    modalMoto.style.display = 'block';
}

function excluirMoto(id) {
    if (!confirm('Tem certeza que deseja excluir esta moto?')) return;
    listaMotos = listaMotos.filter(m => m.id != id);
    salvarNoLocalStorage();
    atualizarTabelaMotos();
}

function registrarTrocaOleo(id) {
    const novaKm = prompt('Digite a quilometragem atual no momento da troca:');
    if (!novaKm || isNaN(novaKm) || parseInt(novaKm) <= 0) return;

    const moto = listaMotos.find(m => m.id == id);
    if (!moto) return;

    moto.kmAtual = parseInt(novaKm);
    moto.kmUltimaTroca = parseInt(novaKm);
    moto.proximaTroca = moto.kmUltimaTroca + moto.intervaloTroca;

    salvarNoLocalStorage();
    atualizarTabelaMotos();
    alert('Troca de óleo registrada com sucesso!');
}

function salvarNoLocalStorage() {
    localStorage.setItem('motos', JSON.stringify(listaMotos));
}

// Busca em tempo real
buscaMoto.addEventListener('input', () => {
    const termo = buscaMoto.value.toLowerCase();
    const filtradas = listaMotos.filter(m =>
        m.modelo.toLowerCase().includes(termo) ||
        m.placa.toLowerCase().includes(termo) ||
        m.ano.toString().includes(termo)
    );
    atualizarTabelaMotos(filtradas);
});

// Carregar dados ao iniciar
atualizarTabelaMotos();

// ------------------- DASHBOARD FUNCIONAL -------------------

// Função principal para atualizar todo o painel
function atualizarDashboard() {
    // Dados das motos
    const totalMotos = listaMotos.length;
    const disponiveis = listaMotos.filter(m => m.situacao === 'disponivel').length;
    const alugadas = listaMotos.filter(m => m.situacao === 'alugada').length;
    const manutencao = listaMotos.filter(m => m.situacao === 'manutencao').length;
    
    const trocasPendentes = listaMotos.filter(m => {
        const kmRestante = m.proximaTroca - m.kmAtual;
        return kmRestante <= 500;
    }).length;

    // Dados das locações (já preparado)
    const locacoesAtivas = listaLocacoes.filter(l => l.status === 'ativa').length;
    const receitaMes = listaLocacoes
        .filter(l => {
            const dataLocacao = new Date(l.dataInicio);
            const hoje = new Date();
            return dataLocacao.getMonth() === hoje.getMonth() && dataLocacao.getFullYear() === hoje.getFullYear();
        })
        .reduce((total, loc) => total + loc.valorTotal, 0);

    // Atualizar valores nos cards
    document.getElementById('totalMotos').textContent = totalMotos;
    document.getElementById('motosDisponiveis').textContent = disponiveis;
    document.getElementById('motosAlugadas').textContent = alugadas;
    document.getElementById('motosManutencao').textContent = manutencao;
    document.getElementById('trocasPendentes').textContent = trocasPendentes;
    document.getElementById('receitaMes').textContent = receitaMes.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // Atualizar alertas
    atualizarListaAlertas();

    // Atualizar últimas locações
    atualizarUltimasLocacoes();
}

// Gerar lista de avisos
function atualizarListaAlertas() {
    const container = document.getElementById('listaAlertas');
    const alertas = [];

    // Avisos de troca de óleo
    listaMotos.forEach(moto => {
        const kmRestante = moto.proximaTroca - moto.kmAtual;
        if (kmRestante <= 0) {
            alertas.push({
                tipo: 'perigo',
                texto: `Moto ${moto.modelo} - Placa ${moto.placa}: Troca de óleo ATRASADA!`
            });
        } else if (kmRestante <= 500) {
            alertas.push({
                tipo: 'aviso',
                texto: `Moto ${moto.modelo} - Placa ${moto.placa}: Troca de óleo em ${kmRestante} km.`
            });
        }
    });

    if (alertas.length === 0) {
        container.innerHTML = `<p class="vazio">Nenhum aviso no momento.</p>`;
        return;
    }

    container.innerHTML = alertas.map(a => `
        <div class="alerta alerta-${a.tipo}">
            <i class="fa fa-exclamation-triangle"></i>
            ${a.texto}
        </div>
    `).join('');
}

// Gerar lista das últimas locações
function atualizarUltimasLocacoes() {
    const container = document.getElementById('listaUltimasLocacoes');
    const ultimas = [...listaLocacoes].sort((a,b) => new Date(b.dataInicio) - new Date(a.dataInicio)).slice(0, 5);

    if (ultimas.length === 0) {
        container.innerHTML = `<p class="vazio">Nenhuma locação registrada ainda.</p>`;
        return;
    }

    container.innerHTML = ultimas.map(loc => {
        const moto = listaMotos.find(m => m.id == loc.idMoto);
        return `
            <div class="item-resumo">
                <div>
                    <strong>${moto ? moto.modelo : 'Moto excluída'}</strong><br>
                    <small>Motorista: ${loc.nomeMotorista}</small>
                </div>
                <div>
                    <span class="badge badge-${loc.status}">${loc.status === 'ativa' ? 'Ativa' : 'Finalizada'}</span><br>
                    <small>${new Date(loc.dataInicio).toLocaleDateString('pt-BR')}</small>
                </div>
            </div>
        `;
    }).join('');
}

// ------------------- ESTRUTURA PARA LOCAÇÕES -------------------
// Essa variável será usada na aba de Locações que vamos criar em seguida
let listaLocacoes = JSON.parse(localStorage.getItem('locacoes')) || [];

// ------------------- CHAMADAS GERAIS -------------------
// Sempre que carregar a página ou alterar dados, atualiza tudo
window.addEventListener('load', () => {
    atualizarTabelaMotos();
    atualizarDashboard();
});

// Modificando a função de salvar para também atualizar o Dashboard
function salvarNoLocalStorage() {
    localStorage.setItem('motos', JSON.stringify(listaMotos));
    localStorage.setItem('locacoes', JSON.stringify(listaLocacoes));
    atualizarDashboard(); // Sempre atualiza o painel após salvar
}

// Atualizar também quando trocar de aba
itensMenu.forEach(item => {
    item.addEventListener('click', () => {
        // ... o código que já existia continua aqui ...
        atualizarDashboard(); // Atualiza dados ao abrir qualquer aba
    });
});

// ------------------- GESTÃO DE LOCAÇÕES -------------------

// Elementos
const btnNovaLocacao = document.getElementById('btnNovaLocacao');
const modalLocacao = document.getElementById('modalLocacao');
const fecharModalLocacao = modalLocacao.querySelector('.fechar-modal');
const btnCancelarLocacao = document.getElementById('btnCancelarLocacao');
const formLocacao = document.getElementById('formLocacao');
const tituloModalLocacao = document.getElementById('tituloModalLocacao');
const idMotoLocacao = document.getElementById('idMotoLocacao');
const buscaLocacao = document.getElementById('buscaLocacao');
const filtroStatus = document.getElementById('filtroStatus');

// Abrir modal de nova locação
btnNovaLocacao.addEventListener('click', () => {
    tituloModalLocacao.textContent = 'Nova Locação';
    formLocacao.reset();
    document.getElementById('idLocacao').value = '';
    document.getElementById('campoDataFim').style.display = 'none';
    carregarMotosDisponiveis();
    modalLocacao.style.display = 'block';
});

// Fechar modal
fecharModalLocacao.addEventListener('click', () => modalLocacao.style.display = 'none');
btnCancelarLocacao.addEventListener('click', () => modalLocacao.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modalLocacao) modalLocacao.style.display = 'none';
});

// Carregar apenas motos disponíveis no cadastro
function carregarMotosDisponiveis() {
    idMotoLocacao.innerHTML = `<option value="">Escolha uma moto disponível</option>`;
    const disponiveis = listaMotos.filter(m => m.situacao === 'disponivel');
    disponiveis.forEach(moto => {
        const opcao = document.createElement('option');
        opcao.value = moto.id;
        opcao.textContent = `${moto.modelo} - Placa: ${moto.placa} (${moto.ano})`;
        idMotoLocacao.appendChild(opcao);
    });
}

// Salvar locação
formLocacao.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('idLocacao').value;
    const idMoto = document.getElementById('idMotoLocacao').value;
    const nomeMotorista = document.getElementById('nomeMotorista').value.trim();
const contatoMotorista = document.getElementById('contatoMotorista').value.trim();

const enderecoMotorista = document.getElementById('enderecoMotorista').value.trim();
const cpfMotorista = document.getElementById('cpfMotorista').value.trim();
const numeroHabilitacao = document.getElementById('numeroHabilitacao').value.trim();
const vencimentoHabilitacao = document.getElementById('vencimentoHabilitacao').value;
const categoriaHabilitacao = document.getElementById('categoriaHabilitacao').value;

const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value || null;
    const valorDiario = parseFloat(document.getElementById('valorDiario').value);

    // Calcular valor total
    let valorTotal = 0;
    let status = 'ativa';

    if (dataFim) {
        const dias = calcularDiasEntreDatas(dataInicio, dataFim);
        valorTotal = dias * valorDiario;
        status = 'finalizada';
    }

    const locacao = {
    id: id || Date.now(),

    // Dados da moto
    idMoto: parseInt(idMoto),

    // Dados pessoais do motorista
    nomeMotorista,
    contatoMotorista,
    enderecoMotorista,
    cpfMotorista,

    // Dados da habilitação
    numeroHabilitacao,
    vencimentoHabilitacao,
    categoriaHabilitacao,

    // Dados da locação
    dataInicio,
    dataFim,
    valorDiario,
    valorTotal,
    status
};

    // Atualizar situação da moto
    const moto = listaMotos.find(m => m.id == idMoto);
    if (!id && moto) moto.situacao = 'alugada';

    if (id) {
        const index = listaLocacoes.findIndex(l => l.id == id);
        listaLocacoes[index] = locacao;
    } else {
        listaLocacoes.push(locacao);
    }

    salvarNoLocalStorage();
    atualizarTabelaLocacoes();
    modalLocacao.style.display = 'none';
});

// Função para calcular dias entre duas datas
function calcularDiasEntreDatas(inicio, fim) {
    const data1 = new Date(inicio);
    const data2 = new Date(fim);
    const diferenca = data2.getTime() - data1.getTime();
    return Math.ceil(diferenca / (1000 * 60 * 60 * 24)) + 1;
}

// Atualizar tabela de locações
function atualizarTabelaLocacoes(listaFiltrada = listaLocacoes) {
    const corpo = document.getElementById('corpoTabelaLocacoes');
    corpo.innerHTML = '';

    if (listaFiltrada.length === 0) {
        corpo.innerHTML = `<tr><td colspan="10" class="vazio">Nenhuma locação encontrada.</td></tr>`;
        return;
    }

    listaFiltrada.forEach(loc => {
        const moto = listaMotos.find(m => m.id == loc.idMoto) || {};
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${moto.modelo || 'Moto excluída'}</td>
            <td>${moto.placa || '-'}</td>
            <td>${loc.nomeMotorista}</td>
            <td>${loc.contatoMotorista}</td>
            <td>${new Date(loc.dataInicio).toLocaleDateString('pt-BR')}</td>
            <td>${loc.dataFim ? new Date(loc.dataFim).toLocaleDateString('pt-BR') : 'Em andamento'}</td>
            <td>R$ ${loc.valorDiario.toFixed(2).replace('.', ',')}</td>
            <td>R$ ${loc.valorTotal.toFixed(2).replace('.', ',')}</td>
            <td><span class="badge badge-${loc.status}">${loc.status === 'ativa' ? 'Ativa' : 'Finalizada'}</span></td>
            <td class="acoes">
                ${loc.status === 'ativa' ? `
                    <button class="btn-acao btn-verde" onclick="finalizarLocacao(${loc.id})" title="Finalizar">
                        <i class="fa fa-check"></i>
                    </button>
                ` : ''}
                <button class="btn-acao btn-excluir" onclick="excluirLocacao(${loc.id})" title="Excluir">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        `;
        corpo.appendChild(linha);
    });
}

// Finalizar locação
function finalizarLocacao(id) {
    const locacao = listaLocacoes.find(l => l.id == id);
    if (!locacao || locacao.status !== 'ativa') return;

    const dataFim = prompt('Digite a data de finalização (AAAA-MM-DD):');
    if (!dataFim || isNaN(Date.parse(dataFim))) {
        alert('Data inválida!');
        return;
    }

    const dias = calcularDiasEntreDatas(locacao.dataInicio, dataFim);
    const valorTotal = dias * locacao.valorDiario;

    locacao.dataFim = dataFim;
    locacao.valorTotal = valorTotal;
    locacao.status = 'finalizada';

    // Devolver moto para disponível
    const moto = listaMotos.find(m => m.id == locacao.idMoto);
    if (moto) moto.situacao = 'disponivel';

    salvarNoLocalStorage();
    atualizarTabelaLocacoes();
    alert(`Locação finalizada! Valor total: R$ ${valorTotal.toFixed(2).replace('.', ',')}`);
}

// Excluir locação
function excluirLocacao(id) {
    if (!confirm('Tem certeza que deseja excluir esta locação?')) return;
    const locacao = listaLocacoes.find(l => l.id == id);
    if (locacao && locacao.status === 'ativa') {
        const moto = listaMotos.find(m => m.id == locacao.idMoto);
        if (moto) moto.situacao = 'disponivel';
    }
    listaLocacoes = listaLocacoes.filter(l => l.id != id);
    salvarNoLocalStorage();
    atualizarTabelaLocacoes();
}

// Busca e filtros
buscaLocacao.addEventListener('input', aplicarFiltrosLocacao);
filtroStatus.addEventListener('change', aplicarFiltrosLocacao);

function aplicarFiltrosLocacao() {
    const termo = buscaLocacao.value.toLowerCase();
    const status = filtroStatus.value;

    let filtradas = listaLocacoes.filter(loc => {
        const moto = listaMotos.find(m => m.id == loc.idMoto) || {};
        return (
            loc.nomeMotorista.toLowerCase().includes(termo) ||
            (moto.placa || '').toLowerCase().includes(termo) ||
            (moto.modelo || '').toLowerCase().includes(termo)
        );
    });

    if (status !== 'todas') {
        filtradas = filtradas.filter(l => l.status === status);
    }

    atualizarTabelaLocacoes(filtradas);
}

// Atualizar tudo ao carregar a página
window.addEventListener('load', () => {
    atualizarTabelaMotos();
    atualizarTabelaLocacoes();
    atualizarDashboard();
});

// ------------------- GESTÃO DE CLIENTES E COMPRAS -------------------

// Variáveis
let listaClientes = JSON.parse(localStorage.getItem('clientes')) || [];
let listaCompras = JSON.parse(localStorage.getItem('compras')) || [];

// Elementos
const btnNovoCliente = document.getElementById('btnNovoCliente');
const modalCliente = document.getElementById('modalCliente');
const fecharModalCliente = modalCliente.querySelector('.fechar-modal');
const btnCancelarCliente = document.getElementById('btnCancelarCliente');
const formCliente = document.getElementById('formCliente');
const tituloModalCliente = document.getElementById('tituloModalCliente');
const buscaCliente = document.getElementById('buscaCliente');
const filtroTipoCliente = document.getElementById('filtroTipoCliente');

const btnNovaCompra = document.getElementById('btnNovaCompra');
const modalCompra = document.getElementById('modalCompra');
const fecharModalCompra = modalCompra.querySelector('.fechar-modal');
const btnCancelarCompra = document.getElementById('btnCancelarCompra');
const formCompra = document.getElementById('formCompra');

// Abrir modal de novo cliente
btnNovoCliente.addEventListener('click', () => {
    tituloModalCliente.textContent = 'Novo Cadastro';
    formCliente.reset();
    document.getElementById('idCliente').value = '';
    modalCliente.style.display = 'block';
});

// Fechar modais
fecharModalCliente.addEventListener('click', () => modalCliente.style.display = 'none');
btnCancelarCliente.addEventListener('click', () => modalCliente.style.display = 'none');
fecharModalCompra.addEventListener('click', () => modalCompra.style.display = 'none');
btnCancelarCompra.addEventListener('click', () => modalCompra.style.display = 'none');

window.addEventListener('click', (e) => {
    if (e.target === modalCliente) modalCliente.style.display = 'none';
    if (e.target === modalCompra) modalCompra.style.display = 'none';
});

// Salvar cliente
formCliente.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('idCliente').value;
    const tipo = document.getElementById('tipoCliente').value;
    const nome = document.getElementById('nomeCliente').value.trim();
    const documento = document.getElementById('documentoCliente').value.replace(/\D/g, '');
    const telefone = document.getElementById('telefoneCliente').value.trim();
    const endereco = document.getElementById('enderecoCliente').value.trim();
    const obs = document.getElementById('obsCliente').value.trim();

    const cliente = {
        id: id || Date.now(),
        tipo,
        nome,
        documento,
        telefone,
        endereco,
        obs
    };

    if (id) {
        const index = listaClientes.findIndex(c => c.id == id);
        listaClientes[index] = cliente;
    } else {
        listaClientes.push(cliente);
    }

    salvarDadosClientes();
    atualizarTabelaClientes();
    modalCliente.style.display = 'none';
});

// Atualizar tabela de clientes
function atualizarTabelaClientes(listaFiltrada = listaClientes) {
    const corpo = document.getElementById('corpoTabelaClientes');
    corpo.innerHTML = '';

    if (listaFiltrada.length === 0) {
        corpo.innerHTML = `<tr><td colspan="6" class="vazio">Nenhum cadastro encontrado.</td></tr>`;
        return;
    }

    listaFiltrada.forEach(cliente => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || cliente.documento}</td>
            <td>${cliente.telefone}</td>
            <td><span class="badge badge-${cliente.tipo}">${cliente.tipo === 'motorista' ? 'Motorista' : 'Fornecedor'}</span></td>
            <td>${cliente.endereco || '-'}</td>
            <td class="acoes">
                <button class="btn-acao btn-editar" onclick="editarCliente(${cliente.id})"><i class="fa fa-pencil"></i></button>
                <button class="btn-acao btn-excluir" onclick="excluirCliente(${cliente.id})"><i class="fa fa-trash"></i></button>
            </td>
        `;
        corpo.appendChild(linha);
    });
}

// Editar cliente
function editarCliente(id) {
    const cliente = listaClientes.find(c => c.id == id);
    if (!cliente) return;

    tituloModalCliente.textContent = 'Editar Cadastro';
    document.getElementById('idCliente').value = cliente.id;
    document.getElementById('tipoCliente').value = cliente.tipo;
    document.getElementById('nomeCliente').value = cliente.nome;
    document.getElementById('documentoCliente').value = cliente.documento;
    document.getElementById('telefoneCliente').value = cliente.telefone;
    document.getElementById('enderecoCliente').value = cliente.endereco || '';
    document.getElementById('obsCliente').value = cliente.obs || '';

    modalCliente.style.display = 'block';
}

// Excluir cliente
function excluirCliente(id) {
    if (!confirm('Tem certeza que deseja excluir este cadastro?')) return;
    listaClientes = listaClientes.filter(c => c.id != id);
    salvarDadosClientes();
    atualizarTabelaClientes();
}

// Busca e filtro
buscaCliente.addEventListener('input', aplicarFiltrosClientes);
filtroTipoCliente.addEventListener('change', aplicarFiltrosClientes);

function aplicarFiltrosClientes() {
    const termo = buscaCliente.value.toLowerCase();
    const tipo = filtroTipoCliente.value;

    let filtrados = listaClientes.filter(c =>
        c.nome.toLowerCase().includes(termo) ||
        c.documento.includes(termo) ||
        c.telefone.includes(termo)
    );

    if (tipo !== 'todos') {
        filtrados = filtrados.filter(c => c.tipo === tipo);
    }

    atualizarTabelaClientes(filtrados);
}

// ------------------- REGISTRO DE COMPRAS DE PEÇAS -------------------

// Abrir modal de compra
btnNovaCompra.addEventListener('click', () => {
    formCompra.reset();
    document.getElementById('idCompra').value = '';
    carregarFornecedores();
    carregarMotosParaCompra();
    modalCompra.style.display = 'block';
});

// Carregar apenas fornecedores
function carregarFornecedores() {
    const select = document.getElementById('idFornecedor');
    select.innerHTML = `<option value="">Selecione</option>`;
    const fornecedores = listaClientes.filter(c => c.tipo === 'fornecedor');

    if (fornecedores.length === 0) {
        select.innerHTML = `<option value="" disabled>Cadastre um fornecedor primeiro</option>`;
        return;
    }

    fornecedores.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.nome;
        select.appendChild(opt);
    });
}

// Carregar motos para vincular à compra
function carregarMotosParaCompra() {
    const select = document.getElementById('idMotoCompra');
    select.innerHTML = `<option value="">Nenhuma / Geral</option>`;
    listaMotos.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `${m.modelo} - ${m.placa}`;
        select.appendChild(opt);
    });
}

// Salvar compra
formCompra.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('idCompra').value;
    const idFornecedor = document.getElementById('idFornecedor').value;
    const idMoto = document.getElementById('idMotoCompra').value || null;
    const descricao = document.getElementById('descricaoCompra').value.trim();
    const qtd = parseInt(document.getElementById('qtdCompra').value);
    const valorUnit = parseFloat(document.getElementById('valorUnitCompra').value);
    const valorTotal = qtd * valorUnit;
    const data = document.getElementById('dataCompra').value;
    const obs = document.getElementById('obsCompra').value.trim();

    const compra = {
        id: id || Date.now(),
        idFornecedor: parseInt(idFornecedor),
        idMoto: idMoto ? parseInt(idMoto) : null,
        descricao,
        qtd,
        valorUnit,
        valorTotal,
        data,
        obs
    };

    if (id) {
        const index = listaCompras.findIndex(c => c.id == id);
        listaCompras[index] = compra;
    } else {
        listaCompras.push(compra);
    }

    salvarDadosClientes();
    modalCompra.style.display = 'none';
    alert('Compra registrada com sucesso!');
});

// Função para salvar tudo no armazenamento
function salvarDadosClientes() {
    localStorage.setItem('clientes', JSON.stringify(listaClientes));
    localStorage.setItem('compras', JSON.stringify(listaCompras));
    atualizarDashboard(); // Atualiza também os valores do painel
}

// Carregar dados ao abrir
window.addEventListener('load', () => {
    atualizarTabelaClientes();
});
// ------------------- GESTÃO FINANCEIRA -------------------

// Variáveis
let listaMovimentacoes = JSON.parse(localStorage.getItem('movimentacoes')) || [];

// Elementos
const btnNovaMovimentacao = document.getElementById('btnNovaMovimentacao');
const modalMovimentacao = document.getElementById('modalMovimentacao');
const fecharModalMov = modalMovimentacao.querySelector('.fechar-modal');
const btnCancelarMov = document.getElementById('btnCancelarMov');
const formMovimentacao = document.getElementById('formMovimentacao');
const tituloModalMov = document.getElementById('tituloModalMov');
const filtroMes = document.getElementById('filtroMes');
const filtroTipoMov = document.getElementById('filtroTipoMov');
const buscaMovimentacao = document.getElementById('buscaMovimentacao');

// Definir mês atual como padrão
const hoje = new Date();
filtroMes.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

// Abrir modal
btnNovaMovimentacao.addEventListener('click', () => {
    tituloModalMov.textContent = 'Nova Movimentação';
    formMovimentacao.reset();
    document.getElementById('idMov').value = '';
    modalMovimentacao.style.display = 'block';
});

// Fechar modal
fecharModalMov.addEventListener('click', () => modalMovimentacao.style.display = 'none');
btnCancelarMov.addEventListener('click', () => modalMovimentacao.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modalMovimentacao) modalMovimentacao.style.display = 'none';
});

// --- FUNÇÕES DE INTEGRAÇÃO AUTOMÁTICA ---

// Converter locação finalizada em receita
function gerarReceitaDeLocacao(locacao) {
    const moto = listaMotos.find(m => m.id === locacao.idMoto);
    const descricao = `Locação - ${moto ? `${moto.modelo} / ${moto.placa}` : 'Moto excluída'}`;

    const jaExiste = listaMovimentacoes.some(m => m.origemId === locacao.id && m.origem === 'locacao');
    if (jaExiste) return;

    const novaMov = {
        id: Date.now(),
        tipo: 'receita',
        descricao: descricao,
        valor: locacao.valorTotal,
        data: locacao.dataFim,
        observacao: `Motorista: ${locacao.nomeMotorista}`,
        origem: 'locacao',
        origemId: locacao.id
    };

    listaMovimentacoes.push(novaMov);
    salvarDadosFinanceiros();
}

// Converter compra de peça em despesa
function gerarDespesaDeCompra(compra) {
    const fornecedor = listaClientes.find(f => f.id === compra.idFornecedor);
    const moto = compra.idMoto ? listaMotos.find(m => m.id === compra.idMoto) : null;
    const descricao = `Compra: ${compra.descricao} ${moto ? `| Moto: ${moto.modelo} / ${moto.placa}` : ''}`;

    const jaExiste = listaMovimentacoes.some(m => m.origemId === compra.id && m.origem === 'compra');
    if (jaExiste) return;

    const novaMov = {
        id: Date.now(),
        tipo: 'despesa',
        descricao: descricao,
        valor: compra.valorTotal,
        data: compra.data,
        observacao: `Fornecedor: ${fornecedor ? fornecedor.nome : 'Não cadastrado'}`,
        origem: 'compra',
        origemId: compra.id
    };

    listaMovimentacoes.push(novaMov);
    salvarDadosFinanceiros();
}

// Sincronizar todos os dados automaticamente
function sincronizarMovimentacoes() {
    // Adicionar receitas das locações finalizadas
    listaLocacoes.filter(l => l.status === 'finalizada').forEach(loc => gerarReceitaDeLocacao(loc));

    // Adicionar despesas das compras
    listaCompras.forEach(compra => gerarDespesaDeCompra(compra));

    // Remover movimentações de registros excluídos
    listaMovimentacoes = listaMovimentacoes.filter(mov => {
        if (mov.origem === 'locacao') return listaLocacoes.some(l => l.id === mov.origemId);
        if (mov.origem === 'compra') return listaCompras.some(c => c.id === mov.origemId);
        return true; // Mantém movimentações manuais
    });

    salvarDadosFinanceiros();
}

// Salvar tudo
function salvarDadosFinanceiros() {
    localStorage.setItem('movimentacoes', JSON.stringify(listaMovimentacoes));
    atualizarFinanceiro();
    atualizarDashboard();
}

// --- ATUALIZAR DADOS DA ABA FINANCEIRA ---

function atualizarFinanceiro() {
    sincronizarMovimentacoes();

    const mesSelecionado = filtroMes.value;
    const [ano, mes] = mesSelecionado.split('-');

    // Filtrar por mês
    const movMes = listaMovimentacoes.filter(mov => {
        const dataMov = new Date(mov.data);
        return dataMov.getFullYear() === parseInt(ano) && (dataMov.getMonth() + 1) === parseInt(mes);
    });

    const receitaTotal = movMes.filter(m => m.tipo === 'receita').reduce((soma, m) => soma + m.valor, 0);
    const despesaTotal = movMes.filter(m => m.tipo === 'despesa').reduce((soma, m) => soma + m.valor, 0);
    const saldo = receitaTotal - despesaTotal;

    // Atualizar cards
    document.getElementById('receitaMesFinanceiro').textContent = receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('despesaMesFinanceiro').textContent = despesaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('saldoMesFinanceiro').textContent = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('saldoMesFinanceiro').className = saldo >= 0 ? 'valor-positivo valor' : 'valor-negativo valor';

    // Atualizar tabela
    atualizarTabelaMovimentacoes(movMes);
}

function atualizarTabelaMovimentacoes(listaFiltrada) {
    const termoBusca = buscaMovimentacao.value.toLowerCase();
    const tipoFiltro = filtroTipoMov.value;

    let filtradas = listaFiltrada.filter(mov =>
        mov.descricao.toLowerCase().includes(termoBusca) ||
        mov.observacao.toLowerCase().includes(termoBusca)
    );

    if (tipoFiltro !== 'todas') filtradas = filtradas.filter(m => m.tipo === tipoFiltro);

    const corpo = document.getElementById('corpoTabelaMov');
    corpo.innerHTML = '';

    if (filtradas.length === 0) {
        corpo.innerHTML = `<tr><td colspan="6" class="vazio">Nenhuma movimentação encontrada.</td></tr>`;
        return;
    }

    filtradas.forEach(mov => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${new Date(mov.data).toLocaleDateString('pt-BR')}</td>
            <td><span class="badge badge-${mov.tipo}">${mov.tipo === 'receita' ? 'Receita' : 'Despesa'}</span></td>
            <td>${mov.descricao}</td>
            <td>${mov.observacao || '-'}</td>
            <td class="${mov.tipo === 'receita' ? 'valor-positivo' : 'valor-negativo'}">
                R$ ${mov.valor.toFixed(2).replace('.', ',')}
            </td>
            <td class="acoes">
                ${mov.origem ? `<small>Automático</small>` : `<button class="btn-acao btn-excluir" onclick="excluirMovimentacao(${mov.id})"><i class="fa fa-trash"></i></button>`}
            </td>
        `;
        corpo.appendChild(linha);
    });
}

// Salvar movimentação manual
formMovimentacao.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('idMov').value;
    const mov = {
        id: id || Date.now(),
        tipo: document.getElementById('tipoMov').value,
        descricao: document.getElementById('descricaoMov').value.trim(),
        valor: parseFloat(document.getElementById('valorMov').value),
        data: document.getElementById('dataMov').value,
        observacao: document.getElementById('obsMov').value.trim(),
        origem: null
    };

    if (id) {
        const index = listaMovimentacoes.findIndex(m => m.id == id);
        listaMovimentacoes[index] = mov;
    } else {
        listaMovimentacoes.push(mov);
    }

    salvarDadosFinanceiros();
    modalMovimentacao.style.display = 'none';
});

// Excluir movimentação manual
function excluirMovimentacao(id) {
    if (!confirm('Excluir esta movimentação?')) return;
    listaMovimentacoes = listaMovimentacoes.filter(m => m.id != id);
    salvarDadosFinanceiros();
}

// Atualizar ao alterar filtros
filtroMes.addEventListener('change', atualizarFinanceiro);
filtroTipoMov.addEventListener('change', atualizarFinanceiro);
buscaMovimentacao.addEventListener('input', atualizarFinanceiro);

// --- AJUSTE NO DASHBOARD PARA MOSTRAR SALDO ---
function atualizarDashboard() {
    const totalMotos = listaMotos.length;
    const disponiveis = listaMotos.filter(m => m.situacao === 'disponivel').length;
    const alugadas = listaMotos.filter(m => m.situacao === 'alugada').length;
    const manutencao = listaMotos.filter(m => m.situacao === 'manutencao').length;
    const trocasPendentes = listaMotos.filter(m => m.proximaTroca - m.kmAtual <= 500).length;

    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const receitaMes = listaMovimentacoes
        .filter(m => m.tipo === 'receita' && new Date(m.data).getMonth() + 1 === mesAtual && new Date(m.data).getFullYear() === anoAtual)
        .reduce((soma, m) => soma + m.valor, 0);

    const despesaMes = listaMovimentacoes
        .filter(m => m.tipo === 'despesa' && new Date(m.data).getMonth() + 1 === mesAtual && new Date(m.data).getFullYear() === anoAtual)
        .reduce((soma, m) => soma + m.valor, 0);

    const saldoMes = receitaMes - despesaMes;

    document.getElementById('totalMotos').textContent = totalMotos;
    document.getElementById('motosDisponiveis').textContent = disponiveis;
    document.getElementById('motosAlugadas').textContent = alugadas;
    document.getElementById('motosManutencao').textContent = manutencao;
    document.getElementById('trocasPendentes').textContent = trocasPendentes;
    document.getElementById('receitaMes').textContent = saldoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    atualizarListaAlertas();
    atualizarUltimasLocacoes();
}

// --- CHAMADAS GERAIS ---
window.addEventListener('load', () => {
    atualizarTabelaMotos();
    atualizarTabelaLocacoes();
    atualizarTabelaClientes();
    atualizarFinanceiro();
    atualizarDashboard();
});

// Ajustar funções de salvar para também atualizar o financeiro
function salvarNoLocalStorage() {
    localStorage.setItem('motos', JSON.stringify(listaMotos));
    localStorage.setItem('locacoes', JSON.stringify(listaLocacoes));
    localStorage.setItem('clientes', JSON.stringify(listaClientes));
    localStorage.setItem('compras', JSON.stringify(listaCompras));
    sincronizarMovimentacoes();
}
// ------------------- GESTÃO DE RELATÓRIOS -------------------

// Elementos
const tipoRelatorio = document.getElementById('tipoRelatorio');
const mesRelatorio = document.getElementById('mesRelatorio');
const anoRelatorio = document.getElementById('anoRelatorio');
const filtroMotoRelatorio = document.getElementById('filtroMotoRelatorio');
const btnGerarRelatorio = document.getElementById('btnGerarRelatorio');
const btnImprimirRelatorio = document.getElementById('btnImprimirRelatorio');
const tituloRelatorio = document.getElementById('tituloRelatorio');
const periodoRelatorio = document.getElementById('periodoRelatorio');
const conteudoRelatorio = document.getElementById('conteudoRelatorio');
const dataGeracao = document.getElementById('dataGeracao');
const cabecalhoRelatorio = document.querySelector('.relatorio-cabecalho');

// Definir valores padrão atuais
const hojeRel = new Date();
mesRelatorio.value = `${hojeRel.getFullYear()}-${String(hojeRel.getMonth() + 1).padStart(2, '0')}`;
anoRelatorio.value = hojeRel.getFullYear();

// Mostrar/esconder filtros conforme tipo de relatório
tipoRelatorio.addEventListener('change', () => {
    const tipo = tipoRelatorio.value;
    filtroMotoRelatorio.style.display = tipo === 'motos' ? 'block' : 'none';
    mesRelatorio.style.display = tipo === 'mensal' ? 'block' : 'none';
    anoRelatorio.style.display = tipo === 'anual' || tipo === 'motos' || tipo === 'locacoes' ? 'block' : 'none';

    if (tipo === 'motos') carregarMotosParaRelatorio();
});

// Carregar motos para seleção no relatório por moto
function carregarMotosParaRelatorio() {
    filtroMotoRelatorio.innerHTML = `<option value="">Selecione uma moto</option>`;
    listaMotos.forEach(moto => {
        const opt = document.createElement('option');
        opt.value = moto.id;
        opt.textContent = `${moto.modelo} - ${moto.placa}`;
        filtroMotoRelatorio.appendChild(opt);
    });
}

// Gerar relatório
btnGerarRelatorio.addEventListener('click', () => {
    const tipo = tipoRelatorio.value;
    cabecalhoRelatorio.style.display = 'block';
    dataGeracao.textContent = new Date().toLocaleString('pt-BR');

    switch (tipo) {
        case 'mensal':
            gerarRelatorioMensal();
            break;
        case 'anual':
            gerarRelatorioAnual();
            break;
        case 'motos':
            gerarRelatorioPorMoto();
            break;
        case 'locacoes':
            gerarRelatorioLocacoes();
            break;
    }
});

// Relatório Mensal
function gerarRelatorioMensal() {
    const [ano, mes] = mesRelatorio.value.split('-');
    const nomeMes = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long' });

    tituloRelatorio.textContent = 'Relatório Financeiro Mensal';
    periodoRelatorio.textContent = `${nomeMes} de ${ano}`;

    const movimentos = listaMovimentacoes.filter(mov => {
        const data = new Date(mov.data);
        return data.getFullYear() == ano && (data.getMonth() + 1) == mes;
    });

    const receita = movimentos.filter(m => m.tipo === 'receita').reduce((s, m) => s + m.valor, 0);
    const despesa = movimentos.filter(m => m.tipo === 'despesa').reduce((s, m) => s + m.valor, 0);
    const saldo = receita - despesa;

    conteudoRelatorio.innerHTML = `
        <div class="resumo-bloco">
            <div class="resumo-item receita">
                <h4>Total de Receitas</h4>
                <p class="resumo-valor valor-positivo">R$ ${receita.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="resumo-item despesa">
                <h4>Total de Despesas</h4>
                <p class="resumo-valor valor-negativo">R$ ${despesa.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="resumo-item saldo">
                <h4>Saldo Final</h4>
                <p class="resumo-valor ${saldo >= 0 ? 'valor-positivo' : 'valor-negativo'}">R$ ${saldo.toFixed(2).replace('.', ',')}</p>
            </div>
        </div>

        <h4>Detalhamento das Movimentações</h4>
        ${movimentos.length > 0 ? `
        <table class="tabela-relatorio">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                ${movimentos.map(m => `
                    <tr>
                        <td>${new Date(m.data).toLocaleDateString('pt-BR')}</td>
                        <td><span class="badge badge-${m.tipo}">${m.tipo === 'receita' ? 'Receita' : 'Despesa'}</span></td>
                        <td>${m.descricao}</td>
                        <td class="${m.tipo === 'receita' ? 'valor-positivo' : 'valor-negativo'}">R$ ${m.valor.toFixed(2).replace('.', ',')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<p class="vazio">Nenhuma movimentação registrada neste período.</p>'}
    `;
}

// Relatório Anual
function gerarRelatorioAnual() {
    const ano = anoRelatorio.value;
    tituloRelatorio.textContent = 'Relatório Financeiro Anual';
    periodoRelatorio.textContent = `Ano de ${ano}`;

    const movimentos = listaMovimentacoes.filter(mov => new Date(mov.data).getFullYear() == ano);

    const receitaTotal = movimentos.filter(m => m.tipo === 'receita').reduce((s, m) => s + m.valor, 0);
    const despesaTotal = movimentos.filter(m => m.tipo === 'despesa').reduce((s, m) => s + m.valor, 0);
    const saldoTotal = receitaTotal - despesaTotal;

    // Agrupar por mês
    const porMes = Array.from({length: 12}, (_, i) => {
        const mes = i + 1;
        const movMes = movimentos.filter(m => new Date(m.data).getMonth() + 1 === mes);
        return {
            mes: new Date(ano, i).toLocaleDateString('pt-BR', { month: 'long' }),
            receita: movMes.filter(m => m.tipo === 'receita').reduce((s, m) => s + m.valor, 0),
            despesa: movMes.filter(m => m.tipo === 'despesa').reduce((s, m) => s + m.valor, 0)
        };
    });

    conteudoRelatorio.innerHTML = `
        <div class="resumo-bloco">
            <div class="resumo-item receita">
                <h4>Receita Total do Ano</h4>
                <p class="resumo-valor valor-positivo">R$ ${receitaTotal.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="resumo-item despesa">
                <h4>Despesa Total do Ano</h4>
                <p class="resumo-valor valor-negativo">R$ ${despesaTotal.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="resumo-item saldo">
                <h4>Saldo Anual</h4>
                <p class="resumo-valor ${saldoTotal >= 0 ? 'valor-positivo' : 'valor-negativo'}">R$ ${saldoTotal.toFixed(2).replace('.', ',')}</p>
            </div>
        </div>

        <h4>Resumo Mensal</h4>
        <table class="tabela-relatorio">
            <thead>
                <tr>
                    <th>Mês</th>
                    <th>Receitas</th>
                    <th>Despesas</th>
                    <th>Saldo</th>
                </tr>
            </thead>
            <tbody>
                ${porMes.map(m => `
                    <tr>
                        <td>${m.mes}</td>
                        <td class="valor-positivo">R$ ${m.receita.toFixed(2).replace('.', ',')}</td>
                        <td class="valor-negativo">R$ ${m.despesa.toFixed(2).replace('.', ',')}</td>
                        <td class="${(m.receita - m.despesa) >= 0 ? 'valor-positivo' : 'valor-negativo'}">
                            R$ ${(m.receita - m.despesa).toFixed(2).replace('.', ',')}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Relatório por Moto
function gerarRelatorioPorMoto() {
    const idMoto = parseInt(filtroMotoRelatorio.value);
    const ano = anoRelatorio.value;
    if (!idMoto) {
        conteudoRelatorio.innerHTML = `<p class="vazio">Selecione uma moto para gerar o relatório.</p>`;
        return;
    }

    const moto = listaMotos.find(m => m.id === idMoto);
    tituloRelatorio.textContent = `Relatório - ${moto.modelo}`;
    periodoRelatorio.textContent = `Placa: ${moto.placa} | Ano de ${ano}`;

    const locacoes = listaLocacoes.filter(l => l.idMoto === idMoto && new Date(l.dataInicio).getFullYear() == ano);
    const compras = listaCompras.filter(c => c.idMoto === idMoto && new Date(c.data).getFullYear() == ano);

    const receita = locacoes.reduce((s, l) => s + l.valorTotal, 0);
    const despesa = compras.reduce((s, c) => s + c.valorTotal, 0);
    const saldo = receita - despesa;

    conteudoRelatorio.innerHTML = `
        <div class="resumo-bloco">
            <div class="resumo-item receita">
                <h4>Total Recebido</h4>
                <p class="resumo-valor valor-positivo">R$ ${receita.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="resumo-item despesa">
                <h4>Total Gasto</h4>
                <p class="resumo-valor valor-negativo">R$ ${despesa.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="resumo-item saldo">
                <h4>Resultado</h4>
                <p class="resumo-valor ${saldo >= 0 ? 'valor-positivo' : 'valor-negativo'}">R$ ${saldo.toFixed(2).replace('.', ',')}</p>
            </div>
        </div>

        <h4>Histórico de Locações</h4>
        ${locacoes.length > 0 ? `
        <table class="tabela-relatorio">
            <thead>
                <tr>
                    <th>Período</th>
                    <th>Motorista</th>
                    <th>Valor</th>
                    <th>Situação</th>
                </tr>
            </thead>
            <tbody>
                ${locacoes.map(l => `
                    <tr>
                        <td>${new Date(l.dataInicio).toLocaleDateString('pt-BR')} a ${l.dataFim ? new Date(l.dataFim).toLocaleDateString('pt-BR') : 'Em andamento'}</td>
                        <td>${l.nomeMotorista}</td>
                        <td>R$ ${l.valorTotal.toFixed(2).replace('.', ',')}</td>
                        <td><span class="badge badge-${l.status}">${l.status === 'ativa' ? 'Ativa' : 'Finalizada'}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<p class="vazio">Nenhuma locação registrada.</p>'}

        <h4 style="margin-top: 2rem;">Compras e Manutenções</h4>
        ${compras.length > 0 ? `
        <table class="tabela-relatorio">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Quantidade</th>
                    <th>Valor Total</th>
                </tr>
            </thead>
            <tbody>
                ${compras.map(c => `
                    <tr>
                        <td>${new Date(c.data).toLocaleDateString('pt-BR')}</td>
                        <td>${c.descricao}</td>
                        <td>${c.qtd}</td>
                        <td>R$ ${c.valorTotal.toFixed(2).replace('.', ',')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<p class="vazio">Nenhuma compra ou serviço registrado.</p>'}
    `;
}

// Relatório de Locações
function gerarRelatorioLocacoes() {
    const ano = anoRelatorio.value;
    tituloRelatorio.textContent = 'Relatório de Locações';
    periodoRelatorio.textContent = `Ano de ${ano}`;

    const locacoes = listaLocacoes.filter(l => new Date(l.dataInicio).getFullYear() == ano);
    const totalReceita = locacoes.reduce((s, l) => s + l.valorTotal, 0);
    const ativas = locacoes.filter(l => l.status === 'ativa').length;
    const finalizadas = locacoes.filter(l => l.status === 'finalizada').length;

    conteudoRelatorio.innerHTML = `
        <div class="resumo-bloco">
            <div class="resumo-item">
                <h4>Total de Locações</h4>
                <p class="resumo-valor">${locacoes.length}</p>
            </div>
            <div class="resumo-item">
                <h4>Finalizadas</h4>
                <p class="resumo-valor">${finalizadas}</p>
            </div>
            <div class="resumo-item">
                <h4>Em Andamento</h4>
                <p class="resumo-valor">${ativas}</p>
            </div>
            <div class="resumo-item receita">
                <h4>Valor Total Faturado</h4>
                <p class="resumo-valor valor-positivo">R$ ${totalReceita.toFixed(2).replace('.', ',')}</p>
            </div>
        </div>

        <h4>Lista Completa</h4>
        ${locacoes.length > 0 ? `
        <table class="tabela-relatorio">
            <thead>
                <tr>
                    <th>Moto</th>
                    <th>Motorista</th>
                    <th>Período</th>
                    <th>Valor</th>
                    <th>Situação</th>
                </tr>
            </thead>
            <tbody>
                ${locacoes.map(l => {
                    const moto = listaMotos.find(m => m.id === l.idMoto);
                    return `
                    <tr>
                        <td>${moto ? `${moto.modelo} - ${moto.placa}` : 'Moto excluída'}</td>
                        <td>${l.nomeMotorista}</td>
                        <td>${new Date(l.dataInicio).toLocaleDateString('pt-BR')} a ${l.dataFim ? new Date(l.dataFim).toLocaleDateString('pt-BR') : 'Em andamento'}</td>
                        <td>R$ ${l.valorTotal.toFixed(2).replace('.', ',')}</td>
                        <td><span class="badge badge-${l.status}">${l.status === 'ativa' ? 'Ativa' : 'Finalizada'}</span></td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        ` : '<p class="vazio">Nenhuma locação registrada neste período.</p>'}
    `;
}

// Função para imprimir
btnImprimirRelatorio.addEventListener('click', () => {
    if (conteudoRelatorio.innerHTML.includes('vazio')) {
        alert('Gere um relatório primeiro para poder imprimir!');
        return;
    }
    window.print();
});

function atualizarSistema() {
    atualizarTabelaMotos();

    if (typeof atualizarDashboard === "function") {
        atualizarDashboard();
    }

    if (typeof atualizarTabelaLocacoes === "function") {
        atualizarTabelaLocacoes();
    }

    if (typeof carregarMotosDisponiveis === "function") {
        carregarMotosDisponiveis();
    }

    if (typeof atualizarTabelaClientes === "function") {
        atualizarTabelaClientes();
    }

    if (typeof atualizarFinanceiro === "function") {
        atualizarFinanceiro();
    }

    if (typeof gerarRelatorio === "function") {
        gerarRelatorio();
    }
}
// ======================================================
//                    SISTEMA DE BACKUP
// ======================================================

const btnExportarBackup = document.getElementById('btnExportarBackup');
const btnImportarBackup = document.getElementById('btnImportarBackup');
const arquivoBackup = document.getElementById('arquivoBackup');
const statusBackup = document.getElementById('statusBackup');


// ======================================================
// SALVAR BACKUP
// ======================================================

if (btnExportarBackup) {

    btnExportarBackup.addEventListener('click', () => {

        try {

            const backup = {};

            // Pega TODOS os dados armazenados no localStorage
            for (let i = 0; i < localStorage.length; i++) {

                const chave = localStorage.key(i);

                backup[chave] = localStorage.getItem(chave);

            }


            // Informações do backup
            const arquivoBackupCompleto = {

                sistema: "LocaçãoMotos",

                versao: "1.0",

                dataBackup: new Date().toISOString(),

                dados: backup

            };


            // Converter para JSON
            const json = JSON.stringify(
                arquivoBackupCompleto,
                null,
                2
            );


            // Criar arquivo
            const blob = new Blob(
                [json],
                {
                    type: "application/json"
                }
            );


            // Criar endereço temporário
            const url = URL.createObjectURL(blob);


            // Criar link para download
            const link = document.createElement('a');

            link.href = url;

            const data = new Date();

            const ano = data.getFullYear();

            const mes = String(data.getMonth() + 1).padStart(2, '0');

            const dia = String(data.getDate()).padStart(2, '0');

            const hora = String(data.getHours()).padStart(2, '0');

            const minuto = String(data.getMinutes()).padStart(2, '0');


            link.download =
                `backup-locacao-motos-${ano}-${mes}-${dia}-${hora}-${minuto}.json`;


            // Fazer download
            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);


            // Liberar memória
            URL.revokeObjectURL(url);


            // Mensagem
            mostrarStatusBackup(
                'Backup realizado com sucesso!',
                'sucesso'
            );

            alert(
                'Backup realizado com sucesso!\n\n' +
                'Guarde o arquivo em um local seguro.'
            );

        } catch (erro) {

            console.error(
                'Erro ao criar backup:',
                erro
            );

            mostrarStatusBackup(
                'Erro ao criar o backup.',
                'erro'
            );

            alert(
                'Não foi possível criar o backup.'
            );

        }

    });

}


// ======================================================
// ABRIR SELEÇÃO DO ARQUIVO
// ======================================================

if (btnImportarBackup) {

    btnImportarBackup.addEventListener('click', () => {

        arquivoBackup.click();

    });

}


// ======================================================
// RESTAURAR BACKUP
// ======================================================

if (arquivoBackup) {

    arquivoBackup.addEventListener('change', (event) => {

        const arquivo = event.target.files[0];

        if (!arquivo) {
            return;
        }


        // Verificar extensão
        if (
            !arquivo.name.toLowerCase().endsWith('.json')
        ) {

            alert(
                'Arquivo inválido!\n\n' +
                'Selecione um arquivo de backup .JSON.'
            );

            arquivoBackup.value = '';

            return;

        }


        // Confirmação
        const confirmar = confirm(

            'ATENÇÃO!\n\n' +

            'A restauração do backup irá substituir os ' +
            'dados atuais do sistema.\n\n' +

            'Recomendamos fazer um backup dos dados atuais ' +
            'antes de continuar.\n\n' +

            'Deseja realmente restaurar este backup?'

        );


        if (!confirmar) {

            arquivoBackup.value = '';

            return;

        }


        const leitor = new FileReader();


        leitor.onload = function(e) {

            try {

                const conteudo = e.target.result;

                const backup = JSON.parse(conteudo);


                // Verificar estrutura do arquivo
                if (
                    !backup ||
                    !backup.dados ||
                    typeof backup.dados !== 'object'
                ) {

                    throw new Error(
                        'Estrutura de backup inválida.'
                    );

                }


                // Confirmar novamente
                const confirmarFinal = confirm(

                    'Backup encontrado!\n\n' +

                    'Data do backup: ' +

                    (
                        backup.dataBackup
                            ? new Date(
                                backup.dataBackup
                            ).toLocaleString('pt-BR')
                            : 'Não informada'
                    ) +

                    '\n\nDeseja continuar a restauração?'

                );


                if (!confirmarFinal) {

                    arquivoBackup.value = '';

                    return;

                }


                // Limpar dados atuais
                localStorage.clear();


                // Restaurar dados
                Object.keys(backup.dados).forEach(chave => {

                    localStorage.setItem(
                        chave,
                        backup.dados[chave]
                    );

                });


                mostrarStatusBackup(
                    'Backup restaurado com sucesso!',
                    'sucesso'
                );


                alert(

                    'Backup restaurado com sucesso!\n\n' +

                    'O sistema será recarregado agora.'

                );


                // Recarregar sistema
                location.reload();


            } catch (erro) {

                console.error(
                    'Erro ao restaurar backup:',
                    erro
                );


                mostrarStatusBackup(
                    'Arquivo de backup inválido.',
                    'erro'
                );


                alert(

                    'ERRO AO RESTAURAR BACKUP!\n\n' +

                    'O arquivo selecionado não é um backup válido ' +
                    'deste sistema.'

                );

            }


            arquivoBackup.value = '';

        };


        leitor.onerror = function() {

            alert(
                'Não foi possível ler o arquivo de backup.'
            );

            arquivoBackup.value = '';

        };


        leitor.readAsText(arquivo);

    });

}


// ======================================================
// STATUS DO BACKUP
// ======================================================

function mostrarStatusBackup(
    mensagem,
    tipo
) {

    if (!statusBackup) {
        return;
    }


    statusBackup.textContent = mensagem;


    statusBackup.className =
        'status-backup ' + tipo;


    setTimeout(() => {

        statusBackup.textContent = '';

        statusBackup.className =
            'status-backup';

    }, 5000);

}
// Você pode adicionar aqui futuramente:
// - Conexão com banco de dados
// - Validações de formulários
// - Carregamento de dados dinâmicos
// - Cálculos financeiros e de disponibilidade