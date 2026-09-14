# FluxCD

GitOps: o cluster observa `fluxcd/nginx/` neste repo e aplica sozinho.

## Como funciona

`terraform/03-fluxcd.tf` instala:
1. `flux2` (helm chart): controllers (source, kustomize, helm, notification).
2. `flux2-sync`: cria `GitRepository` + `Kustomization` apontando pra `https://github.com/luizbrito7/cp03-scalability.fiap`, branch `main`, path `./fluxcd/nginx`.

Qualquer push em `fluxcd/nginx/` na branch `main` é sincronizado automaticamente no cluster (sem `kubectl apply` manual).

## Manifests (`fluxcd/nginx/`)

- `namespace.yaml`: namespace `app`.
- `configmap.yaml`: `nginx.conf` customizado (OpenResty). `/` retorna `ok` estático; `/load?n=<iterações>` roda um loop Lua (`content_by_lua_block`) que consome CPU real por request — conteúdo estático puro não gerava CPU suficiente pra estourar o threshold do HPA sob carga de teste.
- `deployment.yaml`: imagem `openresty/openresty:alpine` (mesmo core nginx + módulo Lua compilado), 2 réplicas, `requests: 50m cpu / 64Mi`, `limits: 100m cpu / 128Mi`, monta o `configmap.yaml` acima em `/usr/local/openresty/nginx/conf/nginx.conf`. Request baixo de propósito (satura rápido sob carga real), mas alto o bastante pra absorver o pico de boot do próprio nginx sem disparar scale-up sozinho. Valores menores testados (10m, 30m) causaram loop de scale-up por ressonância: pod novo bota, pico de boot dispara scale-up, mais pods novos bootam, mais picos, até bater no teto sem carga real nenhuma.
- `service.yaml`: `LoadBalancer`, expõe porta 80 (Azure provisiona IP público).
- `hpa.yaml`: `HorizontalPodAutoscaler` (`autoscaling/v2`), `minReplicas: 2`, `maxReplicas: 10`, target CPU `averageUtilization: 50`. Tem `behavior` custom em `scaleUp`/`scaleDown` (`stabilizationWindowSeconds: 30`, `+1 pod / 15s` cada direção) pra reagir mais rápido e de forma gradual que o default do Kubernetes (scale-up quase instantâneo, scale-down só após 5min) — facilita observar o ciclo completo num teste de carga curto (~60-90s).
- `kustomization.yaml`: agrupa os 5 arquivos acima.

Teste de carga: `loadtest/k6-hpa-test.js` (na raiz do repo), aponta pro `/load` do Service exposto.

## Verificar sync

```bash
kubectl get pods -n flux-system
kubectl get gitrepository,kustomization -n flux-system
kubectl get deploy,svc,hpa -n app
```
