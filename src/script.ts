// ===== INTERFACES E TIPOS =====

// Interface para definir a estrutura de um Animal
interface Animal {
    id: number;                    // ID único interno para controle do sistema
    idUnico: number;               // ID único sequencial visível para o usuário (1, 2, 3...)
    nome: string;                  // Nome do animal
    dono: string;                  // Nome do dono do animal
    especie: string;               // Espécie (Cachorro, Gato, etc.)
    raca: string;                  // Raça do animal
    nascimento: string;            // Data de nascimento no formato YYYY-MM-DD
    vacinado: boolean;             // Status de vacinação (true = vacinado, false = não vacinado)
}

// Interface para definir a estrutura de um Serviço
interface Servico {
    id: number;                    // ID único interno para controle do sistema
    idUnico: number;               // ID único sequencial visível para o usuário (1, 2, 3...)
    animalId: number;              // ID do animal relacionado a este serviço
    tipo: string;                  // Tipo de serviço (Banho, Tosa, etc.)
    data: string;                  // Data do serviço no formato YYYY-MM-DD
    preco: number;                 // Preço do serviço em reais
}

// ===== VARIÁVEIS GLOBAIS =====

let animais: Animal[] = [];        // Array para armazenar todos os animais cadastrados
let servicos: Servico[] = [];      // Array para armazenar todos os serviços agendados

// Contadores para geração de IDs únicos
let nextAnimalId = 1;              // Próximo ID interno para animais
let nextServicoId = 1;             // Próximo ID interno para serviços
let nextIdUnicoAnimal = 1;         // Próximo ID visível para animais (sequencial)
let nextIdUnicoServico = 1;        // Próximo ID visível para serviços (sequencial)

// ===== ELEMENTOS DO DOM =====

// Obtém referências aos elementos HTML usando seus IDs
const animalForm = document.getElementById('animal-form') as HTMLFormElement;           // Formulário de cadastro de animais
const servicoForm = document.getElementById('servico-form') as HTMLFormElement;         // Formulário de agendamento de serviços
const animalList = document.getElementById('animal-list') as HTMLTableSectionElement;   // Tabela onde os animais são listados
const listaServicos = document.getElementById('lista-servicos') as HTMLUListElement;    // Lista onde os serviços são exibidos
const animalSelect = document.getElementById('animal-select') as HTMLSelectElement;     // Select para escolher animal no agendamento

// Elementos dos cards de estatísticas
const totalAnimaisElement = document.getElementById('total-animais') as HTMLElement;    // Elemento do card total de animais
const totalServicosElement = document.getElementById('total-servicos') as HTMLElement;  // Elemento do card total de serviços
const proximosServicosElement = document.getElementById('proximos-servicos') as HTMLElement; // Elemento do card próximos serviços

// Elementos do modo escuro
const btnDark = document.getElementById('btndark') as HTMLButtonElement;                // Botão para alternar modo escuro
const body = document.body as HTMLBodyElement;                                          // Elemento body da página

// Elementos dos botões de filtro
const filterAll = document.getElementById('filter-all') as HTMLButtonElement;           // Botão filtro "Todos"
const filterVacinados = document.getElementById('filter-vacinados') as HTMLButtonElement; // Botão filtro "Vacinados"
const filterNaoVacinados = document.getElementById('filter-nao-vacinados') as HTMLButtonElement; // Botão filtro "Não Vacinados"

// Elemento para notificações toast
const toast = document.getElementById('toast') as HTMLElement;                          // Elemento para exibir notificações

// NOVOS ELEMENTOS: Navegação por abas
const navButtons = document.querySelectorAll('.nav-button');                            // Todos os botões do menu de navegação
const contentSections = document.querySelectorAll('.content-section');                  // Todas as seções de conteúdo

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Formata uma data no formato YYYY-MM-DD para DD/MM/YYYY
 * @param dataString - Data no formato YYYY-MM-DD
 * @returns Data formatada como DD/MM/YYYY
 */
function formatarData(dataString: string): string {
    // Divide a string da data em partes (ano, mês, dia)
    const [year, month, day] = dataString.split('-');
    // Retorna no formato brasileiro DD/MM/YYYY
    return `${day}/${month}/${year}`;
}

/**
 * Calcula a idade do animal baseada na data de nascimento
 * @param dataNascimento - Data de nascimento no formato YYYY-MM-DD
 * @returns Idade em anos
 */
function calcularIdade(dataNascimento: string): number {
    // Converte a string de data para objeto Date
    const nascimento = new Date(dataNascimento);
    // Obtém a data atual
    const hoje = new Date();
    
    // Calcula diferença básica em anos
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    
    // Obtém informações de mês e dia para ajuste preciso
    const mesAtual = hoje.getMonth();      // Mês atual (0-11)
    const diaAtual = hoje.getDate();       // Dia atual
    const mesNasc = nascimento.getMonth(); // Mês de nascimento
    const diaNasc = nascimento.getDate();  // Dia de nascimento
    
    // Verifica se ainda não fez aniversário este ano
    if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
        idade--; // Subtrai 1 ano se ainda não fez aniversário
    }
    
    return idade; // Retorna idade calculada
}

/**
 * Exibe uma notificação toast na tela
 * @param mensagem - Texto da notificação
 * @param tipo - Tipo da notificação ('sucesso' ou 'erro')
 */
function mostrarToast(mensagem: string, tipo: 'sucesso' | 'erro' = 'sucesso'): void {
    // Define o texto da notificação
    toast.textContent = mensagem;
    // Reseta as classes
    toast.className = 'toast';
    
    // Adiciona classe de erro se necessário
    if (tipo === 'erro') {
        toast.classList.add('error');
    }
    
    // Mostra a notificação
    toast.classList.add('show');
    
    // Esconde a notificação após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== FUNÇÕES DE PERSISTÊNCIA =====

/**
 * Salva todos os dados no localStorage do navegador
 */
function salvarDados(): void {
    // Converte os arrays e contadores para string e salva no localStorage
    localStorage.setItem('animais', JSON.stringify(animais));
    localStorage.setItem('servicos', JSON.stringify(servicos));
    localStorage.setItem('nextAnimalId', nextAnimalId.toString());
    localStorage.setItem('nextServicoId', nextServicoId.toString());
    localStorage.setItem('nextIdUnicoAnimal', nextIdUnicoAnimal.toString());
    localStorage.setItem('nextIdUnicoServico', nextIdUnicoServico.toString());
}

/**
 * Carrega todos os dados do localStorage do navegador
 */
function carregarDados(): void {
    // Recupera os dados salvos do localStorage
    const animaisSalvos = localStorage.getItem('animais');
    const servicosSalvos = localStorage.getItem('servicos');
    const nextAnimalIdSalvo = localStorage.getItem('nextAnimalId');
    const nextServicoIdSalvo = localStorage.getItem('nextServicoId');
    const nextIdUnicoAnimalSalvo = localStorage.getItem('nextIdUnicoAnimal');
    const nextIdUnicoServicoSalvo = localStorage.getItem('nextIdUnicoServico');

    // Se existirem dados salvos, carrega eles
    if (animaisSalvos) {
        animais = JSON.parse(animaisSalvos);
    }
    if (servicosSalvos) {
        servicos = JSON.parse(servicosSalvos);
    }
    if (nextAnimalIdSalvo) {
        nextAnimalId = parseInt(nextAnimalIdSalvo);
    }
    if (nextServicoIdSalvo) {
        nextServicoId = parseInt(nextServicoIdSalvo);
    }
    if (nextIdUnicoAnimalSalvo) {
        nextIdUnicoAnimal = parseInt(nextIdUnicoAnimalSalvo);
    }
    if (nextIdUnicoServicoSalvo) {
        nextIdUnicoServico = parseInt(nextIdUnicoServicoSalvo);
    }
}

// ===== FUNÇÕES DE NAVEGAÇÃO POR ABAS =====

/**
 * Alterna entre as seções de conteúdo baseado no botão clicado
 * @param targetSectionId - ID da seção que deve ser mostrada
 */
function mostrarSecao(targetSectionId: string): void {
    // Remove a classe active de todas as seções
    contentSections.forEach(section => {
        section.classList.remove('active'); // Oculta todas as seções
    });
    
    // Remove a classe active de todos os botões
    navButtons.forEach(button => {
        button.classList.remove('nav-button--active'); // Remove destaque de todos os botões
    });
    
    // Adiciona a classe active à seção alvo
    const targetSection = document.getElementById(targetSectionId); // Encontra a seção pelo ID
    if (targetSection) {
        targetSection.classList.add('active'); // Mostra a seção
    }
    
    // Adiciona a classe active ao botão correspondente
    const activeButton = document.querySelector(`[data-target="${targetSectionId}"]`); // Encontra o botão pelo data-target
    if (activeButton) {
        activeButton.classList.add('nav-button--active'); // Destaca o botão
    }
    
    // Atualiza listas específicas quando certas seções são abertas
    if (targetSectionId === 'lista-section') {
        atualizarListaAnimais(); // Atualiza a lista de animais quando a seção é aberta
    } else if (targetSectionId === 'servicos-section') {
        atualizarListaServicos(); // Atualiza a lista de serviços quando a seção é aberta
    }
}

/**
 * Configura os event listeners para os botões de navegação
 */
function setupNavegacao(): void {
    // Adiciona event listener para cada botão do menu
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-target'); // Obtém o ID da seção alvo
            if (targetSection) {
                mostrarSecao(targetSection); // Mostra a seção correspondente
            }
        });
    });
}

// ===== FUNÇÕES PRINCIPAIS =====

/**
 * Atualiza os cards de estatísticas na página
 */
function atualizarEstatisticas(): void {
    // Atualiza o número total de animais
    totalAnimaisElement.textContent = animais.length.toString();
    // Atualiza o número total de serviços
    totalServicosElement.textContent = servicos.length.toString();
    
    // Calcula serviços nos próximos 7 dias
    const hoje = new Date();                    // Data atual
    const seteDias = new Date();               // Data de 7 dias no futuro
    seteDias.setDate(hoje.getDate() + 7);      // Adiciona 7 dias
    
    // Filtra serviços que estão entre hoje e 7 dias no futuro
    const proximosServicos = servicos.filter(servico => {
        const dataServico = new Date(servico.data);
        return dataServico >= hoje && dataServico <= seteDias;
    });
    
    // Atualiza o card de próximos serviços
    proximosServicosElement.textContent = proximosServicos.length.toString();
}

/**
 * Processa o cadastro de um novo animal
 * @param event - Evento de submit do formulário
 */
function cadastrarAnimal(event: Event): void {
    event.preventDefault(); // Previne o comportamento padrão do formulário (recarregar página)
    
    // Obtém valores dos campos do formulário
    const nome = (document.getElementById('nome') as HTMLInputElement).value;
    const dono = (document.getElementById('dono') as HTMLInputElement).value;
    const especie = (document.getElementById('especie') as HTMLSelectElement).value;
    const raca = (document.getElementById('raca') as HTMLInputElement).value;
    const nascimento = (document.getElementById('nascimento') as HTMLInputElement).value;
    const vacinado = (document.getElementById('vacinado') as HTMLInputElement).checked;
    
    // Validação de data de nascimento
    const dataNascimento = new Date(nascimento);
    const hoje = new Date();
    
    // Verifica se a data de nascimento é futura
    if (dataNascimento > hoje) {
        mostrarToast('A data de nascimento não pode ser futura!', 'erro');
        return; // Interrompe a função se a data for inválida
    }
    
    // Valida se todos os campos obrigatórios estão preenchidos
    if (!nome || !dono || !especie || !raca || !nascimento) {
        mostrarToast('Por favor, preencha todos os campos obrigatórios.', 'erro');
        return; // Interrompe a função se campos estiverem vazios
    }
    
    // Cria novo objeto Animal com os dados do formulário
    const novoAnimal: Animal = {
        id: nextAnimalId++,           // Atribui ID interno e incrementa contador
        idUnico: nextIdUnicoAnimal++, // Atribui ID visível e incrementa contador
        nome: nome,
        dono: dono,
        especie: especie,
        raca: raca,
        nascimento: nascimento,
        vacinado: vacinado
    };
    
    // Adiciona o novo animal ao array
    animais.push(novoAnimal);
    
    // Salva os dados no localStorage
    salvarDados();
    
    // Atualiza a interface
    atualizarListaAnimais();
    atualizarSelectAnimais();
    atualizarEstatisticas();
    
    // Limpa o formulário
    animalForm.reset();
    
    // Exibe mensagem de sucesso
    mostrarToast(`Animal ${novoAnimal.nome} cadastrado com sucesso! ID: #${novoAnimal.idUnico}`);
    
    // Opcional: Mudar para a seção de animais cadastrados após cadastro
    setTimeout(() => {
        mostrarSecao('lista-section'); // Mostra a lista de animais após cadastro
    }, 1000);
}

/**
 * Atualiza a lista de animais na tabela
 * @param filtro - Tipo de filtro a ser aplicado ('todos', 'vacinados', 'nao-vacinados')
 */
function atualizarListaAnimais(filtro: string = 'todos'): void {
    // Filtra animais baseado no parâmetro recebido
    const animaisFiltrados = animais.filter(animal => {
        if (filtro === 'vacinados') return animal.vacinado;        // Mostra apenas vacinados
        if (filtro === 'nao-vacinados') return !animal.vacinado;   // Mostra apenas não vacinados
        return true;                                               // 'todos' - não aplica filtro
    });
    
    // Limpa a tabela antes de preencher
    animalList.innerHTML = '';
    
    // Para cada animal filtrado, cria uma linha na tabela
    animaisFiltrados.forEach(animal => {
        const linha = document.createElement('tr'); // Cria elemento <tr> (linha da tabela)
        const idade = calcularIdade(animal.nascimento); // Calcula idade do animal
        
        // Preenche a linha com os dados do animal
        linha.innerHTML = `
            <td><strong>#${animal.idUnico}</strong></td> <!-- Coluna ID único -->
            <td>${animal.nome}</td>                      <!-- Coluna Nome -->
            <td>${animal.dono}</td>                      <!-- Coluna Dono -->
            <td>${animal.especie}</td>                   <!-- Coluna Espécie -->
            <td>${animal.raca}</td>                      <!-- Coluna Raça -->
            <td>${idade} anos</td>                       <!-- Coluna Idade -->
            <td>${animal.vacinado ? '✅ Sim' : '❌ Não'}</td> <!-- Coluna Vacinado -->
            <td>
                <!-- Botão para marcar/desmarcar vacinação -->
                <button onclick="marcarVacinacao(${animal.id})" class="action-button">
                    ${animal.vacinado ? '❌ Desmarcar Vacina' : '✅ Marcar como Vacinado'}
                </button>
                <!-- Botão para remover animal -->
                <button onclick="removerAnimal(${animal.id})" class="action-button delete-button">
                    🗑️ Remover
                </button>
            </td>
        `;
        
        // Adiciona a linha criada à tabela
        animalList.appendChild(linha);
    });
}

/**
 * Atualiza o select de animais no formulário de agendamento
 */
function atualizarSelectAnimais(): void {
    // Limpa options existentes (mantém apenas a primeira opção padrão)
    while (animalSelect.children.length > 1) {
        animalSelect.removeChild(animalSelect.lastChild!);
    }
    
    // Adiciona uma nova option para cada animal cadastrado
    animais.forEach(animal => {
        const option = document.createElement('option'); // Cria elemento <option>
        option.value = animal.id.toString();             // Valor é o ID interno do animal
        option.textContent = `#${animal.idUnico} - ${animal.nome} (${animal.dono})`; // Texto visível
        animalSelect.appendChild(option);                // Adiciona o option ao select
    });
}

/**
 * Alterna o status de vacinação de um animal
 * @param id - ID interno do animal
 */
function marcarVacinacao(id: number): void {
    // Encontra o animal pelo ID interno
    const animal = animais.find(a => a.id === id);
    
    if (animal) {
        // Inverte o status de vacinação (true vira false, false vira true)
        animal.vacinado = !animal.vacinado;
        
        // Salva a alteração no localStorage
        salvarDados();
        
        // Exibe mensagem de status
        mostrarToast(`Status de vacinação de ${animal.nome} atualizado para: ${animal.vacinado ? 'Vacinado' : 'Não Vacinado'}.`);
        
        // Atualiza a lista para refletir a mudança
        const filtroAtivo = document.querySelector('.filter-button--active')?.id.replace('filter-', '') || 'todos';
        atualizarListaAnimais(filtroAtivo);
    } else {
        mostrarToast('Animal não encontrado.', 'erro');
    }
}

/**
 * Remove um animal do sistema
 * @param id - ID interno do animal a ser removido
 */
function removerAnimal(id: number): void {
    // Encontra o animal pelo ID
    const animal = animais.find(a => a.id === id);
    if (!animal) return; // Sai da função se animal não for encontrado

    // Confirmação para evitar exclusão acidental
    if (!confirm(`Tem certeza que deseja remover o animal "${animal.nome}" (ID: #${animal.idUnico})?`)) {
        return; // Sai da função se o usuário cancelar
    }

    // Remove o animal do array
    animais = animais.filter(a => a.id !== id);
    // Remove também todos os serviços agendados para este animal
    servicos = servicos.filter(s => s.animalId !== id);

    // Salva as alterações no localStorage
    salvarDados();

    // Exibe mensagem de confirmação
    mostrarToast(`Animal ${animal.nome} e seus serviços foram removidos.`);
    
    // Atualiza todas as listas e estatísticas
    atualizarListaAnimais();
    atualizarSelectAnimais();
    atualizarListaServicos();
    atualizarEstatisticas();
}

/**
 * Processa o agendamento de um novo serviço
 * @param event - Evento de submit do formulário
 */
function agendarServico(event: Event): void {
    event.preventDefault(); // Previne o comportamento padrão do formulário
    
    // Obtém valores do formulário de agendamento
    const animalId = parseInt((document.getElementById('animal-select') as HTMLSelectElement).value);
    const tipoSelect = (document.getElementById('servico') as HTMLSelectElement);
    const tipo = tipoSelect.value;
    const data = (document.getElementById('data-servico') as HTMLInputElement).value;
    
    // Validação de data do serviço
    const dataServico = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas a data
    
    // Verifica se a data do serviço é futura
    if (dataServico <= hoje) {
        mostrarToast('A data do serviço deve ser futura!', 'erro');
        return; // Interrompe a função se a data for inválida
    }
    
    // Valida se um animal e serviço foram selecionados
    if (!animalId || !tipo) {
        mostrarToast('Por favor, selecione um animal e um tipo de serviço.', 'erro');
        return; // Interrompe a função se seleção for inválida
    }
    
    // Extrai o preço do texto da option selecionada
    const optionText = tipoSelect.options[tipoSelect.selectedIndex].textContent || "";
    const precoMatch = optionText.match(/R\$\s*([\d,]+)/); // Encontra o padrão "R$ XX,XX"
    const precoString = precoMatch ? precoMatch[1].replace(',', '.') : '0'; // Converte para formato numérico
    const preco = parseFloat(precoString); // Converte para número
    
    // Busca o animal relacionado para validação
    const animal = animais.find(a => a.id === animalId);
    if (!animal) {
        mostrarToast('Animal selecionado não encontrado.', 'erro');
        return; // Interrompe a função se animal não for encontrado
    }

    // Cria novo objeto Servico
    const novoServico: Servico = {
        id: nextServicoId++,           // Atribui ID interno e incrementa contador
        idUnico: nextIdUnicoServico++, // Atribui ID visível e incrementa contador
        animalId: animalId,
        tipo: tipo,
        data: data,
        preco: preco
    };
    
    // Adiciona o novo serviço ao array
    servicos.push(novoServico);
    
    // Salva os dados no localStorage
    salvarDados();
    
    // Atualiza a interface
    atualizarListaServicos();
    atualizarEstatisticas();
    
    // Limpa o formulário
    servicoForm.reset();
    
    // Exibe mensagem de sucesso
    mostrarToast(`Serviço de ${tipo} agendado para ${animal.nome} em ${formatarData(data)}. Valor: R$ ${preco.toFixed(2).replace('.', ',')}. ID: #${novoServico.idUnico}`);
    
    // Opcional: Mudar para a seção de serviços agendados após agendamento
    setTimeout(() => {
        mostrarSecao('servicos-section'); // Mostra a lista de serviços após agendamento
    }, 1000);
}

/**
 * Atualiza a lista de serviços agendados
 */
function atualizarListaServicos(): void {
    // Limpa a lista antes de preencher
    listaServicos.innerHTML = '';

    // Ordena os serviços pela data mais próxima
    const servicosOrdenados = servicos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    // Se não há serviços, exibe mensagem
    if (servicosOrdenados.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum serviço agendado.';
        listaServicos.appendChild(li);
        return; // Sai da função
    }
    
    // Para cada serviço, cria um item na lista
    servicosOrdenados.forEach(servico => {
        const li = document.createElement('li'); // Cria elemento <li> (item da lista)
        
        // Encontra o animal relacionado para obter o nome e dono
        const animal = animais.find(a => a.id === servico.animalId);
        const nomeAnimal = animal ? animal.nome : 'Animal Desconhecido'; // Fallback se animal foi removido
        const nomeDono = animal ? animal.dono : 'Dono Desconhecido';
        
        // Preenche o item da lista com os dados do serviço
        li.innerHTML = `
            <div>
                <strong>#${servico.idUnico}</strong> - 
                <strong>${servico.tipo}</strong> para 
                ${nomeAnimal} (Dono: ${nomeDono}) em 
                ${formatarData(servico.data)} - R$ ${servico.preco.toFixed(2).replace('.', ',')}
            </div>
            <!-- Botão para remover serviço -->
            <button onclick="removerServico(${servico.id})" class="action-button delete-button remove-servico-btn">❌</button>
        `;
        
        // Adiciona o item à lista
        listaServicos.appendChild(li);
    });
}

/**
 * Remove um serviço agendado
 * @param id - ID interno do serviço a ser removido
 */
function removerServico(id: number): void {
    // Encontra o serviço pelo ID
    const servico = servicos.find(s => s.id === id);
    if (!servico) return; // Sai da função se serviço não for encontrado

    // Confirmação para evitar exclusão acidental
    if (!confirm(`Tem certeza que deseja remover o agendamento #${servico.idUnico} (${servico.tipo})?`)) {
        return; // Sai da função se o usuário cancelar
    }

    // Remove o serviço do array
    servicos = servicos.filter(s => s.id !== id);

    // Salva as alterações no localStorage
    salvarDados();

    // Exibe mensagem de confirmação
    mostrarToast(`Serviço #${servico.idUnico} removido.`);
    
    // Atualiza as listas
    atualizarListaServicos();
    atualizarEstatisticas();
}

// ===== FUNÇÕES DE CONTROLE =====

/**
 * Alterna entre modo escuro e modo claro
 */
function toggleDarkMode(): void {
    // Alterna a classe 'dark-mode' no <body>
    body.classList.toggle('dark-mode');
    
    // Armazena a preferência no Local Storage
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode.toString());

    // Atualiza o texto do botão
    btnDark.textContent = isDarkMode ? '☀️ Modo claro' : '🌙 Modo escuro';
}

/**
 * Carrega a preferência do modo escuro do localStorage
 */
function loadDarkModePreference(): void {
    // Recupera a preferência salva
    const darkModeEnabled = localStorage.getItem('darkMode');
    
    // Se a preferência for 'true' ou se não houver preferência e o sistema operacional for escuro
    if (darkModeEnabled === 'true' || (darkModeEnabled === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        body.classList.add('dark-mode');
        btnDark.textContent = '☀️ Modo claro';
    } else {
        btnDark.textContent = '🌙 Modo escuro';
    }
}

/**
 * Manipula o clique nos botões de filtro
 * @param event - Evento de clique
 */
function handleFilterClick(event: Event): void {
    const target = event.target as HTMLButtonElement;
    
    // Verifica se o clique foi em um botão de filtro
    if (target.classList.contains('filter-button')) {
        // Remove a classe ativa de todos os botões
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('filter-button--active');
        });
        
        // Adiciona a classe ativa ao botão clicado
        target.classList.add('filter-button--active');
        
        // Extrai o tipo de filtro do ID do botão
        const filterType = target.id.replace('filter-', '');
        
        // Atualiza a lista com o filtro selecionado
        atualizarListaAnimais(filterType);
    }
}

// ===== VALIDAÇÃO DE FORMULÁRIOS EM TEMPO REAL =====

/**
 * Configura a validação em tempo real dos formulários
 */
function setupFormValidation(): void {
    // Validação de data de nascimento
    const nascimentoInput = document.getElementById('nascimento') as HTMLInputElement;
    nascimentoInput.addEventListener('change', function() {
        const dataNascimento = new Date(this.value);
        const hoje = new Date();
        
        // Adiciona classes CSS para feedback visual
        if (dataNascimento > hoje) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
    });
    
    // Validação de data de serviço
    const dataServicoInput = document.getElementById('data-servico') as HTMLInputElement;
    dataServicoInput.addEventListener('change', function() {
        const dataServico = new Date(this.value);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas a data
        
        // Adiciona classes CSS para feedback visual
        if (dataServico <= hoje) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
    });
}

// ===== ASSOCIAÇÃO DE EVENTOS E INICIALIZAÇÃO =====

// Associa eventos aos formulários
animalForm.addEventListener('submit', cadastrarAnimal);  // Formulário de cadastro de animais
servicoForm.addEventListener('submit', agendarServico); // Formulário de agendamento de serviços

// Associa eventos aos botões de filtro
filterAll.addEventListener('click', handleFilterClick);
filterVacinados.addEventListener('click', handleFilterClick);
filterNaoVacinados.addEventListener('click', handleFilterClick);

// Associa evento ao botão de modo escuro
btnDark.addEventListener('click', toggleDarkMode);

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carrega preferências salvas
    loadDarkModePreference();
    // Configura validação de formulários
    setupFormValidation();
    // Configura navegação por abas
    setupNavegacao();
    // Carrega dados do localStorage
    carregarDados();
    
    // Atualiza todas as interfaces
    atualizarSelectAnimais();
    atualizarEstatisticas();
    
    // Garante que a seção de cadastro esteja ativa por padrão
    mostrarSecao('cadastro-section');
});