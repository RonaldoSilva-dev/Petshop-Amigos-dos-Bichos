// ===== MODO ESCURO - CÓDIGO CORRIGIDO =====

// Aguarda o DOM estar completamente carregado antes de executar o código
document.addEventListener('DOMContentLoaded', function() {
    
    // Obtém referência ao botão de modo escuro pelo ID
    const btndark = document.getElementById('btndark');
    
    // Verifica se o botão existe antes de adicionar o event listener
    if (btndark) {
        // Adiciona um listener para o evento de clique no botão
        btndark.addEventListener('click', function() {
            // 🎯 CORREÇÃO 1: Alterna a classe 'dark-mode' no body
            // Isso vai aplicar/remover os estilos do modo escuro
            document.body.classList.toggle('dark-mode');
            
            // 🎯 CORREÇÃO 2: A lógica de mudar o texto deve estar DENTRO do clique
            // Verifica se o body TEM a classe 'dark-mode' (modo escuro ativo)
            if (document.body.classList.contains('dark-mode')) {
                // Se ESTÁ no modo escuro, muda o texto para "Modo Claro"
                this.innerHTML = '☀️ Modo Claro'; // ✅ 'this' agora se refere ao botão
            } else {
                // Se NÃO ESTÁ no modo escuro, mantém "Modo Escuro"  
                this.innerHTML = '🌙 Modo Escuro'; // ✅ 'this' agora se refere ao botão
            }
        });
    }
});