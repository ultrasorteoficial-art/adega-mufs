# Adega Mufs - Monitoramento de Concorrência - TODO

## Novo Escopo - Sistema Aberto (Sem Login)

### Banco de Dados
- [x] Tabela de produtos
- [x] Tabela de concorrentes (Dinho, Adega Brasil, Franco, Diversos)
- [x] Tabela de preços
- [x] Tabela de histórico de preços
- [x] Tabela de clientes (nome, código)
- [x] Tabela de SKUs (até 10 por cliente)
- [x] Tabela de evidências (fotos/arquivos)

### Backend (tRPC Procedures)
- [x] Procedure para criar/obter cliente
- [x] Procedure para criar/listar SKUs de cliente
- [x] Procedure para upload de evidências
- [ ] Procedure para registrar preço com dados de cliente
- [ ] Procedure para listar preços com informações de cliente

### Frontend - Fluxo Principal
- [x] Remover página de login
- [x] Criar formulário unificado de registro
- [x] Campo: Nome do Cliente
- [x] Campo: Código do Cliente
- [x] Campo: 10 SKUs principais
- [ ] Campo: Produto
- [ ] Campo: Concorrente
- [ ] Campo: Valor do Preço
- [ ] Upload de fotos/arquivos de evidências
- [ ] Validação de dados

### Frontend - Visualização
- [x] Tabela comparativa de preços (mantém)
- [x] Dashboard com visão geral (mantém)
- [x] Histórico de preços (mantém)
- [x] Exportação PDF/Excel (mantém)

### Upload de Arquivos
- [ ] Implementar upload para S3
- [ ] Suportar imagens (JPG, PNG)
- [ ] Suportar documentos (PDF, DOC)
- [ ] Validação de tamanho de arquivo
- [ ] Exibição de evidências

### Testes
- [x] Testes de criação de cliente
- [x] Testes de SKUs
- [ ] Testes de upload
- [ ] Testes de registro de preço com cliente

### Deploy
- [ ] Criar checkpoint final
- [ ] Validar fluxo completo
