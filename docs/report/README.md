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

- [ ] Cluster Kubernetes funcionando (`kubectl get nodes`)
- [ ] Deployment criado (`kubectl get deploy -n app`)
- [ ] Pods em execução antes do teste de carga (`kubectl get pods -n app`)
- [ ] HPA configurado (`kubectl get hpa -n app`)
- [ ] Consulta das informações do HPA (`kubectl describe hpa nginx -n app`)
- [ ] Execução do teste de carga (`ab -k -c 500 -n 20000000 -t 300 http://<EXTERNAL_IP>/`)
- [ ] Comportamento dos pods durante/após aumento de carga (`kubectl get pods -n app -w`)
- [ ] Quantidade de réplicas após atuação do HPA (`kubectl get hpa -n app -w`)
- [ ] Aplicação funcionando (`curl http://<EXTERNAL_IP>/` ou navegador)

## Questões

**O que é o Horizontal Pod Autoscaler?**
Controlador nativo do Kubernetes que ajusta automaticamente o número de réplicas de um Deployment (ou ReplicaSet/StatefulSet) com base em métricas observadas (CPU, memória, ou métricas customizadas/externas), mantendo a utilização próxima de um alvo definido, sem intervenção manual.

**Qual métrica foi utilizada para realizar o escalonamento?**
Utilização de CPU (`averageUtilization`), medida em relação ao `request` de CPU definido no Deployment.

**Qual foi o número mínimo e máximo de réplicas utilizado pela equipe?**
Mínimo: 2. Máximo: 10.

**O que aconteceu com a quantidade de pods quando a carga sobre a aplicação aumentou?**
_preencher com dado observado_. Esperado: o HPA detectou CPU acima do alvo de 50% e escalou progressivamente as réplicas (respeitando o ciclo de reconciliação do controller, ~15s) até o teto de 10, conforme a carga se manteve.

**O que aconteceu após a redução ou encerramento da carga?**
_preencher com dado observado_. Esperado: após o fim do `ab`, a métrica de CPU caiu abaixo do alvo; o HPA aguardou a janela de estabilização (default 5min) e reduziu as réplicas de volta ao mínimo (2).

**Qual é a função do Metrics Server no funcionamento do HPA?**
Coleta as métricas de uso de CPU/memória de pods e nodes via kubelet (Resource Metrics API) e as expõe pro `kube-apiserver`. O HPA consulta essa API periodicamente para decidir se escala; sem o Metrics Server ele não tem dado de CPU/memória para atuar.

**Qual seria a vantagem de utilizar HPA em uma aplicação executada em um ambiente de nuvem?**
Ajusta a capacidade automaticamente conforme a demanda real, evitando superprovisionamento constante (custo desnecessário com réplicas ociosas) e subdimensionamento (indisponibilidade em picos), aproveitando a elasticidade que a nuvem já oferece em nível de infraestrutura.

**Quais dificuldades foram encontradas durante a atividade e como foram resolvidas?**
- Versão do Kubernetes `1.33` indisponível na região `westeurope` fora do plano Long-Term Support: resolvido fixando `kubernetes_version = "1.34"`.
- `terraform apply` interrompido antes de concluir a criação do cluster: resolvido reexecutando o apply.
- Request de CPU ajustado muito baixo (10m, depois 30m) para acelerar o teste causou loop de scale-up sem carga real: o pico de CPU do próprio boot do nginx já estourava 50% do request, disparando novo scale-up (que criava mais pods, mais boots, mais picos) até o teto de 10 réplicas. Resolvido voltando ao request original (50m), que absorve o pico de boot sem perder sensibilidade à carga real do `ab`.

## Conclusão

_preencher após o teste de carga: resumo do comportamento observado (escala pra cima sob carga, escala pra baixo após, tempo aproximado de reação do HPA)._
