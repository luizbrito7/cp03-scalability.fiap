# Terraform

Sobe AKS na Azure e instala FluxCD via Helm.

## Arquivos

- `00-provider.tf`: providers `azurerm`/`helm`, locals (`project`, `env`, `location`).
- `01-vnet.tf`: resource group, vnet, subnet dedicada ao AKS.
- `02-aks.tf`: módulo `Azure/aks/azurerm`, node pool `Standard_B2s` com autoscale 1-2, RBAC desabilitado, sku Free.
- `03-fluxcd.tf`: `helm_release` do `flux2` + `flux2-sync` apontando pra este repo, path `./fluxcd/nginx`, branch `main`.

## Notas

- `kubernetes_version = "1.34"`: a `1.33.x` na região `westeurope` só está disponível via Long-Term Support (LTS), fora do escopo dessa atividade.
- `role_based_access_control_enabled = false`: simplifica acesso via `az aks get-credentials`, sem AAD/RBAC extra.
- Sem `sops`/secrets no `flux2-sync`: essa atividade não usa segredo nenhum, então o bloco de decryption foi removido (evita reconcile quebrado por secret inexistente).

## Comandos

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve

# credenciais do cluster
az aks get-credentials --resource-group rg-rm562192-dev --name aks-rm562192-dev
```

State e plano ficam locais (`.gitignore` exclui `*.tfstate`, `.terraform/`, `tfplan`): contêm `kube_config` sensível, nunca commitar.
