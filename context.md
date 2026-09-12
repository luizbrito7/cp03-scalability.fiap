CP1: Horizontal Pod Autoscaler no Kubernetes 2º Semestre
Venceu ontem às 23:59
•
Vários envios permitidos
Instruções
Objetivo
Nesta atividade, vocês deverão configurar e testar o Horizontal Pod Autoscaler, HPA, em um ambiente Kubernetes.

O objetivo é compreender, na prática, como o Kubernetes realiza o escalonamento automático de pods de acordo com o consumo de recursos da aplicação, principalmente a utilização de CPU.

A atividade poderá ser realizada utilizando a Máquina Virtual DEVASC disponibilizada para a turma ou um ambiente Kubernetes em um provedor de nuvem a escolha da equipe.

Descrição da atividade
A equipe deverá preparar um ambiente Kubernetes, realizar o deploy de uma aplicação, configurar o HPA e executar testes de carga para observar o comportamento do escalonamento automático.

O material disponibilizado utiliza o Nginx como aplicação de exemplo e apresenta a configuração do HPA utilizando métricas de CPU.

Vocês poderão realizar a atividade utilizando AWS, Azure, Google Cloud, Oracle Cloud ou a VM DEVASC. Caso utilizem um ambiente diferente do apresentado nos tutoriais, façam as adaptações necessárias.

Material de apoio
Utilizem os materiais abaixo como referência para realização da atividade:

Atividade: AWS HPA (Sugestão)

https://jagged-passenger-47f.notion.site/Atividade-AWS-HPA-aeb5fb15d19245b0917655dd9aec6e5f

HorizontalPodAutoscaler Walkthrough (VM)

https://jagged-passenger-47f.notion.site/HorizontalPodAutoscaler-Walkthrough-405889bd9fb6464bafc6d2988cf23c51

Etapas da atividade
Preparar o ambiente Kubernetes e verificar se o cluster está funcionando corretamente.
Criar um Deployment para uma aplicação. O material de apoio utiliza o Nginx como exemplo.
Expor a aplicação por meio de um Service e verificar se ela está acessível.
Habilitar o Metrics Server ou serviço equivalente para disponibilizar as métricas necessárias ao funcionamento do HPA.
Criar e aplicar o Horizontal Pod Autoscaler.
Como referência, o roteiro utiliza a seguinte configuração:

Mínimo de réplicas: 2

Máximo de réplicas: 10

Utilização de CPU desejada: 50%

Verificar a situação inicial dos pods e do HPA.
Realizar um teste de carga sobre a aplicação.
O material de apoio apresenta exemplos utilizando Apache Benchmark, Siege e wrk. A equipe poderá escolher uma dessas ferramentas.

Durante o teste de carga, acompanhar o comportamento do HPA e a quantidade de pods.
Registrar o que aconteceu com a quantidade de réplicas durante o aumento da carga.
Após finalizar o teste, observar novamente o comportamento dos pods e do HPA.
Evidências obrigatórias
A entrega deverá conter capturas de tela legíveis que comprovem a realização da atividade.

Apresentem evidências de:

Cluster Kubernetes funcionando.
Deployment criado.
Pods em execução antes do teste de carga.
HPA configurado.
Consulta das informações do HPA.
Execução do teste de carga.
Comportamento dos pods durante ou após o aumento da carga.
Quantidade de réplicas após a atuação do HPA.
Aplicação funcionando no ambiente utilizado.
Os prints devem apresentar informações suficientes para que seja possível compreender o que foi executado. Evitem capturas isoladas que não permitam identificar o comando, o recurso ou o resultado apresentado.

Relatório
Além das evidências, a equipe deverá responder às questões abaixo:

O que é o Horizontal Pod Autoscaler?
Qual métrica foi utilizada para realizar o escalonamento?
Qual foi o número mínimo e máximo de réplicas utilizado pela equipe?
O que aconteceu com a quantidade de pods quando a carga sobre a aplicação aumentou?
O que aconteceu após a redução ou encerramento da carga?
Qual é a função do Metrics Server no funcionamento do HPA?
Qual seria a vantagem de utilizar HPA em uma aplicação executada em um ambiente de nuvem?
Quais dificuldades foram encontradas durante a atividade e como foram resolvidas?
Critérios de avaliação
Configuração correta do ambiente Kubernetes: 1,5 ponto

Configuração do HPA: 2,0 pontos

Execução do teste de carga: 1,5 ponto

Evidências do escalonamento dos pods: 2,0 pontos

Análise e explicação dos resultados: 2,0 pontos

Organização e clareza da entrega: 1,0 ponto

Total: 10,0 pontos

Entrega
Prazo: até 10/09

Entrega em equipe.

Enviar um único arquivo PDF pelo Teams contendo:

Nome e RM dos integrantes

Ambiente utilizado

Capturas de tela da atividade

Respostas das questões

Breve conclusão sobre os resultados observados

A utilização de um provedor de nuvem não é obrigatória. A atividade poderá ser realizada utilizando a VM DEVASC disponibilizada para a turma.

Bons estudos!

Meu trabalho