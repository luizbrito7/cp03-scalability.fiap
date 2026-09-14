# Relatório CP3: Horizontal Pod Autoscaler

## Equipe

| Nome | RM |
|---|---|
| Anderson Huang | rm565920@fiap.com.br |
| Bruno Henrique | rm566277@fiap.com.br |
| Ronaldo Attamah | rm564630@fiap.com.br |
| Luiz Brito | rm562192@fiap.com.br |
| Guylherme Miguel | rm562374@fiap.com.br |

**Ambiente utilizado**: Azure (AKS), provisionado via Terraform ([terraform/](../../terraform/README.md)), app sincronizada via FluxCD ([fluxcd/](../../fluxcd/README.md)).

## Evidências

> Prints a anexar no PDF final, um por item, com comando + resultado visível.
> Vídeo de apoio (cobre execução do teste + comportamento dos pods + réplicas em tempo real): [`evidence/loadtest-run.mp4`](evidence/loadtest-run.mp4)

- [ ] Cluster Kubernetes funcionando (`kubectl get nodes`)
- [ ] Deployment criado (`kubectl get deploy -n app`)
- [ ] Pods em execução antes do teste de carga (`kubectl get pods -n app`)
- [ ] HPA configurado (`kubectl get hpa -n app`)
- [ ] Consulta das informações do HPA (`kubectl describe hpa nginx -n app`)
- [x] Execução do teste de carga (`k6 run loadtest/k6-hpa-test.js` — ver [`loadtest/k6-hpa-test.js`](../../loadtest/k6-hpa-test.js)) — coberto no vídeo
- [x] Comportamento dos pods durante/após aumento de carga (`kubectl get pods -n app -w`) — coberto no vídeo
- [x] Quantidade de réplicas após atuação do HPA (`kubectl get hpa -n app -w`) — coberto no vídeo
- [ ] Aplicação funcionando (`curl http://<EXTERNAL_IP>/` ou navegador)

Itens marcados `[x]` já têm evidência em vídeo; ainda assim, tirar 1-2 prints de frames chave (pico de réplicas, volta ao mínimo) pra facilitar leitura no PDF — vídeo sozinho não é aceito como "captura de tela".

## Questões

**O que é o Horizontal Pod Autoscaler?**
Controlador nativo do Kubernetes que ajusta automaticamente o número de réplicas de um Deployment (ou ReplicaSet/StatefulSet) com base em métricas observadas (CPU, memória, ou métricas customizadas/externas), mantendo a utilização próxima de um alvo definido, sem intervenção manual.

**Qual métrica foi utilizada para realizar o escalonamento?**
Utilização de CPU (`averageUtilization`), medida em relação ao `request` de CPU definido no Deployment.

**Qual foi o número mínimo e máximo de réplicas utilizado pela equipe?**
Mínimo: 2. Máximo: 10.

**O que aconteceu com a quantidade de pods quando a carga sobre a aplicação aumentou?**
Observado em execução real: com carga do k6 (50 VUs) contra o endpoint `/load` (endpoint Lua que consome CPU real por request), a métrica subiu de `2%/50%` (idle) para `137%/50%`, e o HPA escalou progressivamente 2 → 3 → 4 réplicas em ~30s, respeitando a política de `+1 pod / 15s` configurada em `behavior.scaleUp`.

**O que aconteceu após a redução ou encerramento da carga?**
Observado: ao final do teste de carga (k6 finalizando as 50 VUs), a métrica de CPU caiu abaixo do alvo; com `behavior.scaleDown` configurado pra `stabilizationWindowSeconds: 30` e `+1 pod removido / 15s` (mais rápido que o default de 300s), as réplicas já começaram a reduzir nos segundos seguintes e voltaram ao mínimo (2) pouco depois do fim da carga.

**Qual é a função do Metrics Server no funcionamento do HPA?**
Coleta as métricas de uso de CPU/memória de pods e nodes via kubelet (Resource Metrics API) e as expõe pro `kube-apiserver`. O HPA consulta essa API periodicamente para decidir se escala; sem o Metrics Server ele não tem dado de CPU/memória para atuar.

**Qual seria a vantagem de utilizar HPA em uma aplicação executada em um ambiente de nuvem?**
Ajusta a capacidade automaticamente conforme a demanda real, evitando superprovisionamento constante (custo desnecessário com réplicas ociosas) e subdimensionamento (indisponibilidade em picos), aproveitando a elasticidade que a nuvem já oferece em nível de infraestrutura.

**Quais dificuldades foram encontradas durante a atividade e como foram resolvidas?**
- Versão do Kubernetes `1.33` indisponível na região `westeurope` fora do plano Long-Term Support: resolvido fixando `kubernetes_version = "1.34"`.
- `terraform apply` interrompido antes de concluir a criação do cluster: resolvido reexecutando o apply.
- Request de CPU ajustado muito baixo (10m, depois 30m) para acelerar o teste causou loop de scale-up sem carga real: o pico de CPU do próprio boot do nginx já estourava 50% do request, disparando novo scale-up (que criava mais pods, mais boots, mais picos) até o teto de 10 réplicas. Resolvido voltando ao request original (50m), que absorve o pico de boot sem perder sensibilidade à carga real de teste.
- Ferramentas sugeridas no roteiro (Apache Benchmark, Siege, wrk) deram resultado inconsistente/difícil de interpretar. Trocado por **k6**, que gera relatório estruturado (requests/s, latência, taxa de erro) direto no terminal.
- Nginx servindo conteúdo estático puro não gera CPU suficiente pra estourar o threshold de 50%, mesmo sob carga considerável (111 req/s, 50 VUs) — CPU real ficou em ~2%, HPA nunca escalou. Resolvido trocando a imagem por `openresty/openresty:alpine` (mesmo core nginx, com módulo Lua compilado) e adicionando um endpoint `/load` que executa um loop de cálculo controlável via `?n=`, gerando CPU real por request.
- Binário k6 via snap falhou silenciosamente (exit 255, sem output) ao ser executado de forma não-interativa; causa raiz identificada via `journalctl` — AppArmor bloqueando `snap-confine` de herdar file descriptors redirecionados. Resolvido instalando o binário estático oficial do k6 (tarball do GitHub releases) fora do snap.

## Conclusão

O HPA se comportou conforme esperado: em estado idle a aplicação manteve 2 réplicas (mínimo configurado) com CPU bem abaixo do alvo. Sob carga real de CPU (via k6 + endpoint `/load`), o HPA reagiu em segundos, escalando 2 → 4 réplicas de forma gradual (política `+1 pod/15s`), e reduziu de volta ao mínimo pouco depois do fim da carga, também de forma gradual (mesma política no `scaleDown`, ajustada de 300s default pra 30s de janela de estabilização). O ajuste do `behavior` no manifesto do HPA foi essencial pra tornar o comportamento visível e demonstrável dentro de uma janela curta de teste (~60-90s), em vez do default do Kubernetes (scale-up quase instantâneo, mas scale-down só após 5 minutos).
