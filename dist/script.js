"use strict";
// ===== INTERFACES E TIPOS =====
// ===== VARIÁVEIS GLOBAIS =====
// Array para armazenar todos os animais cadastrados
let animais = [];
// Array para armazenar todos os serviços agendados
let servicos = [];
// Contador para gerar IDs únicos
let nextAnimalId = 1;
let nextServicoId = 1;
// ===== ELEMENTOS DO DOM =====
// Obtém referências aos elementos HTML usando seus IDs
const animalForm = document.getElementById('animal-form');
const servicoForm = document.getElementById('servico-form');
const animalList = document.getElementById('animal-list');
const listaServicos = document.getElementById('lista-servicos');
const animalSelect = document.getElementById('animal-select');
// ===== FUNÇÕES PRINCIPAIS =====
// Função para calcular idade baseada na data de nascimento
function calcularIdade(dataNascimento) {
    const nascimento = new Date(dataNascimento); // Converte string para objeto Date
    const hoje = new Date(); // Data atual
    // Calcula diferença em anos
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    // Ajusta idade se ainda não fez aniversário este ano
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesNasc = nascimento.getMonth();
    const diaNasc = nascimento.getDate();
    if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
        idade--; // Subtrai 1 se ainda não fez aniversário
    }
    return idade; // Retorna idade calculada
}
// Função para cadastrar novo animal
function cadastrarAnimal(event) {
    event.preventDefault(); // Previne comportamento padrão do formulário
    // Obtém valores dos campos do formulário
    const nome = document.getElementById('nome').value;
    const dono = document.getElementById('dono').value;
    const especie = document.getElementById('especie').value;
    const raca = document.getElementById('raca').value;
    const nascimento = document.getElementById('nascimento').value;
    const vacinado = document.getElementById('vacinado').checked;
    // Cria novo objeto Animal
    const novoAnimal = {
        id: nextAnimalId++, // Atribui ID e incrementa contador
        nome,
        dono,
        especie,
        raca,
        nascimento,
        vacinado
    };
    // Adiciona animal ao array
    animais.push(novoAnimal);
    // Atualiza a interface
    atualizarListaAnimais();
    atualizarSelectAnimais();
    // Limpa o formulário
    animalForm.reset();
    // Exibe mensagem de sucesso
    alert('Animal cadastrado com sucesso!');
}
// Função para atualizar a lista de animais na tabela
function atualizarListaAnimais(filtro = 'todos') {
    // Filtra animais baseado no parâmetro
    const animaisFiltrados = animais.filter(animal => {
        if (filtro === 'vacinados')
            return animal.vacinado;
        if (filtro === 'nao-vacinados')
            return !animal.vacinado;
        return true; // 'todos' - não filtra
    });
    // Limpa a tabela
    animalList.innerHTML = '';
    // Para cada animal, cria uma linha na tabela
    animaisFiltrados.forEach(animal => {
        const linha = document.createElement('tr'); // Cria elemento <tr>
        // Calcula idade
        const idade = calcularIdade(animal.nascimento);
        // Preenche a linha com dados do animal
        linha.innerHTML = `
            <td>${animal.nome}</td>
            <td>${animal.dono}</td>
            <td>${animal.especie}</td>
            <td>${animal.raca}</td>
            <td>${idade} anos</td>
            <td>${animal.vacinado ? '✅ Sim' : '❌ Não'}</td>
            <td>
                <button onclick="marcarVacinacao(${animal.id})" class="action-button">
                    ${animal.vacinado ? '❌ Desmarcar Vacina' : '✅ Marcar como Vacinado'}
                </button>
                <button onclick="removerAnimal(${animal.id})" class="action-button delete-button">
                    🗑️ Remover
                </button>
            </td>
        `;
        // Adiciona linha à tabela
        animalList.appendChild(linha);
    });
}
// Função para atualizar o select de animais no agendamento
function atualizarSelectAnimais() {
    // Limpa options existentes (exceto a primeira)
    while (animalSelect.children.length > 1) {
        animalSelect.removeChild(animalSelect.lastChild);
    }
    // Adiciona option para cada animal
    animais.forEach(animal => {
        const option = document.createElement('option'); // Cria elemento <option>
        option.value = animal.id.toString(); // Valor é o ID do animal
        option.textContent = `${animal.nome} (${animal.dono})`; // Texto visível
        animalSelect.appendChild(option); // Adiciona ao select
    });
}
// Função para agendar serviço
function agendarServico(event) {
    event.preventDefault(); // Previne comportamento padrão
    // Obtém valores do formulário
    const animalId = parseInt(document.getElementById('animal-select').value);
    const tipo = document.getElementById('servico').value;
    const data = document.getElementById('data-servico').value;
    // Valida se animal foi selecionado
    if (!animalId) {
        alert('Por favor, selecione um animal.');
        return;
    }
    // Mapeia tipos de serviço para preços
    const precos = {
        'Banho': 30,
        'Tosa': 40,
        'Vacinação': 60,
        'Consulta': 50
    };
    // Obtém preço do serviço
    const preco = precos[tipo.split(' - ')[0]] || 0;
    // Cria novo serviço
    const novoServico = {
        id: nextServicoId++,
        animalId,
        tipo,
        data,
        preco
    };
    // Adiciona serviço ao array
    servicos.push(novoServico);
    // Atualiza interface
    atualizarListaServicos();
    // Limpa formulário
    servicoForm.reset();
    // Exibe mensagem de sucesso
    alert('Serviço agendado com sucesso!');
}
// Função para atualizar lista de serviços agendados
function atualizarListaServicos() {
    // Limpa lista atual
    listaServicos.innerHTML = '';
    // Para cada serviço, cria item na lista
    servicos.forEach(servico => {
        // Encontra animal relacionado ao serviço
        const animal = animais.find(a => a.id === servico.animalId);
        // Cria elemento <li>
        const item = document.createElement('li');
        item.innerHTML = `
            <strong>${servico.tipo}</strong> - 
            Animal: ${animal?.nome || 'Não encontrado'} - 
            Data: ${formatarData(servico.data)} - 
            Preço: R$ ${servico.preco.toFixed(2)}
            <button onclick="cancelarServico(${servico.id})" class="delete-button small-button">
                Cancelar
            </button>
        `;
        // Adiciona à lista
        listaServicos.appendChild(item);
    });
}
// ===== FUNÇÕES UTILITÁRIAS =====
// Função para formatar data (DD/MM/YYYY)
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR'); // Formato brasileiro
}
// Função para marcar/desmarcar vacinação
function marcarVacinacao(animalId) {
    // Encontra animal pelo ID
    const animal = animais.find(a => a.id === animalId);
    if (animal) {
        // Alterna status de vacinação
        animal.vacinado = !animal.vacinado;
        // Atualiza interface
        atualizarListaAnimais();
        // Exibe mensagem
        const acao = animal.vacinado ? 'marcado' : 'desmarcado';
        alert(`Vacinação ${acao} para ${animal.nome}`);
    }
}
// Função para remover animal
function removerAnimal(animalId) {
    // Confirmação antes de remover
    if (confirm('Tem certeza que deseja remover este animal?')) {
        // Filtra array, removendo animal pelo ID
        animais = animais.filter(animal => animal.id !== animalId);
        // Remove serviços relacionados
        servicos = servicos.filter(servico => servico.animalId !== animalId);
        // Atualiza interfaces
        atualizarListaAnimais();
        atualizarListaServicos();
        atualizarSelectAnimais();
        alert('Animal removido com sucesso!');
    }
}
// Função para cancelar serviço
function cancelarServico(servicoId) {
    // Confirmação antes de cancelar
    if (confirm('Tem certeza que deseja cancelar este serviço?')) {
        // Filtra array, removendo serviço pelo ID
        servicos = servicos.filter(servico => servico.id !== servicoId);
        // Atualiza interface
        atualizarListaServicos();
        alert('Serviço cancelado com sucesso!');
    }
}
// ===== CONFIGURAÇÃO DE EVENT LISTENERS =====
// Adiciona evento de submit ao formulário de animais
animalForm.addEventListener('submit', cadastrarAnimal);
// Adiciona evento de submit ao formulário de serviços
servicoForm.addEventListener('submit', agendarServico);
// Adiciona eventos aos botões de filtro
document.getElementById('filter-all')?.addEventListener('click', () => atualizarListaAnimais('todos'));
document.getElementById('filter-vacinados')?.addEventListener('click', () => atualizarListaAnimais('vacinados'));
document.getElementById('filter-nao-vacinados')?.addEventListener('click', () => atualizarListaAnimais('nao-vacinados'));
// ===== INICIALIZAÇÃO =====
// Adiciona alguns animais de exemplo ao carregar a página
function inicializarDadosExemplo() {
    const animaisExemplo = [
        {
            id: nextAnimalId++,
            nome: 'Rex',
            dono: 'João Silva',
            especie: 'Cachorro',
            raca: 'Labrador',
            nascimento: '2020-05-15',
            vacinado: true
        },
        {
            id: nextAnimalId++,
            nome: 'Mimi',
            dono: 'Maria Santos',
            especie: 'Gato',
            raca: 'Siamês',
            nascimento: '2021-08-20',
            vacinado: false
        }
    ];
    animais.push(...animaisExemplo);
    atualizarListaAnimais();
    atualizarSelectAnimais();
}
// Executa inicialização quando página carrega
document.addEventListener('DOMContentLoaded', inicializarDadosExemplo); 
