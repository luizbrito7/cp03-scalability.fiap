# FluxCD

GitOps: o cluster observa `fluxcd/nginx/` neste repo e aplica sozinho.

## Como funciona

`terraform/03-fluxcd.tf` instala:
1. `flux2` (helm chart): controllers (source, kustomize, helm, notification).
2. `flux2-sync`: cria `GitRepository` + `Kustomization` apontando pra `https://github.com/luizbrito7/cp03-scalability.fiap`, branch `main`, path `./fluxcd/nginx`.

Qualquer push em `fluxcd/nginx/` na branch `main` é sincronizado automaticamente no cluster (sem `kubectl apply` manual).

## Manifests (`fluxcd/nginx/`)

- `namespace.yaml`: namespace `app`.
- `deployment.yaml`: nginx, 2 réplicas, `requests: 30m cpu / 64Mi`, `limits: 100m cpu / 128Mi`. Request baixo de propósito (satura rápido sob carga real), mas não tão baixo a ponto do pico de boot do próprio nginx (alguns ms de CPU na inicialização) já estourar o alvo sozinho — valor menor (ex.: 10m) causa loop de scale-up por ressonância: pod novo bota, pico de boot dispara scale-up, mais pods novos boot, mais picos, até bater no teto sem carga real nenhuma.
- `service.yaml`: `LoadBalancer`, expõe porta 80 (Azure provisiona IP público).
- `hpa.yaml`: `HorizontalPodAutoscaler` (`autoscaling/v2`), `minReplicas: 2`, `maxReplicas: 10`, target CPU `averageUtilization: 50`.
- `kustomization.yaml`: agrupa os 4 arquivos acima.

## Verificar sync

```bash
kubectl get pods -n flux-system
kubectl get gitrepository,kustomization -n flux-system
kubectl get deploy,svc,hpa -n app
```
