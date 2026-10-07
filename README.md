# Breu Run 🏆 | Calendário Regional de Corridas de Rua

Plataforma desenvolvida para centralizar e profissionalizar o calendário de corridas de rua, reunindo eventos das principais empresas de cronometragem (**Chip Amazônia**, **Chip Breu Branco**, **Chip Pará**, **Supera Chip Cronos**, etc.).

---

## 📱 Funcionalidades do Protótipo (MVP Mobile-First)

### 1. 🔍 Listagem & Filtros Rápidos
* **Filtro Horizontal Deslizante de Cidades/Polos:** Tailândia, Marabá, Breu Branco, Parauapebas, Belém, Castanhal, Tucuruí, Canaã dos Carajás, Paragominas, Barcarena, Santarém, etc. Cada cidade exibe o contador de provas ativas.
* **Filtros Avançados:** Por **Mês** (Outubro, Novembro, Dezembro 2026, etc.), **Distâncias** (5 km, 10 km, 21 km Meia, 42 km Maratona) e **Empresa de Chip**.
* **Busca Instantânea:** Digite o nome da prova, organizador, bairro ou cidade.
* **Filtro de Inscrições Abertas:** Alternância em 1 toque para ver apenas o que está vendendo agora.
* **Minhas Provas Salvas (Favoritas ❤️):** Permite ao atleta favoritar as provas para montar seu calendário anual pessoal (salvo no navegador).

### 2. 🎴 Card da Corrida (Otimizado para Celular)
* **Bloco Visual de Data:** Dia grande em destaque + mês e dia da semana.
* **Informações Essenciais:** Nome da prova, organizador credenciado, local com cidade e link para Google Maps.
* **Badges de Percurso:** Tags de `[5 km]`, `[10 km]`, `[21 km]`, etc.
* **Selo da Empresa de Chip:** Identificação visual de cronometragem eletrônica (Chip Amazônia, Chip Breu Branco, Chip Pará).
* **Preço & Virada de Lote:** Exibição do valor a partir de R$ e alerta do lote atual.
* **Botão Direto "Inscreva-se Aqui":** Redirecionamento com 1 clique para o site oficial da empresa de cronometragem.
* **Compartilhar no WhatsApp:** Gera automaticamente um texto formatado pronto para enviar em grupos de corrida e assessorias esportivas.

### 3. 📄 Modal de Detalhes da Prova
* Visualização completa de Kit do Atleta (camisa poliamida, medalha finisher, sacochila, chip).
* Premiação geral e por faixas etárias.
* Altimetria e perfil do percurso.
* Botão **"Salvar no Google Agenda"** (adiciona o evento no calendário do celular do atleta com lembrete).

### 4. ⚡ Painel Administrativo Rápido (Cadastrar Prova)
* Formulário intuitivo para cadastrar novos eventos em segundos sem mexer em código.
* Suporte a título, data, horário, cidade, percursos, empresa de chip, valor, lote e link de inscrição.
* Opção de marcar como **"Destaque Oficial"** (para monetização de patrocinadores).
* Novos eventos cadastrados aparecem imediatamente na listagem e persistem no `localStorage`.

### 5. 💰 Espaços Estratégicos de Monetização
* **Selo & Card de Destaque no Topo:** Espaço para cobrar dos organizadores para fixar o evento.
* **Banner de Captação Comercial:** Espaço para marcas locais (lojas esportivas, suplementos, academias).
* **Vitrines de Afiliados:** Recomendações sutis de géis de carboidrato, cintos de hidratação, meias e relógios GPS.
* **Vitrine para Cronometristas:** Canal de contato direto para atrair novas empresas de chip.

### 6. 🔔 Notificações & Captação de Atletas (WhatsApp VIP)
* Modal para entrada direta no Grupo VIP Pará Run.
* Cadastro de número com seleção da cidade preferida para receber alertas de abertura de 1º lote.

---

## 🗄️ Base Inicial Pré-Alimentada (+22 Eventos Reais do Pará)
O protótipo já vem com mais de 20 provas estruturadas cobrindo todo o estado:
* **Tailândia:** 4ª Corrida Noturna Cidade de Tailândia, 1ª Corrida Agro & Dendê, Corrida da Primavera.
* **Marabá:** 5ª Meia Maratona das Pontes, Corrida Noturna da Folha 32, Corrida da Solidariedade.
* **Breu Branco:** Circuito Chip Breu Branco (Etapa Lago), Circuito Verão 5k.
* **Parauapebas:** Desafio Serra dos Carajás, Corrida Noturna dos Minérios, Meia Maratona Carajás Trail Run.
* **Belém:** Corrida do Círio, Desafio Mangal das Garças 10k.
* **Castanhal, Tucuruí, Canaã dos Carajás, Paragominas, Barcarena, Abaetetuba, Bragança e Santarém.**

---

## 🚀 Como Executar o Protótipo

Na pasta do projeto, execute:

```bash
cd calendario-corridas
npm run dev
```

Abra o navegador no endereço exibido (geralmente `http://localhost:5173/`).

---

## 🛠️ Próxima Etapa: Backend & Supabase

Com o protótipo visual validado, o próximo passo da arquitetura é:
1. Criar projeto no **Supabase** (PostgreSQL gratuito com autenticação e API REST instantânea).
2. Rodar a migration com a tabela `corridas` e políticas de leitura pública (RLS).
3. Conectar a chamada `fetch` ou SDK `@supabase/supabase-js` para substituir o estado local por persistência na nuvem multiusuário.
