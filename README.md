Aluno: Murilo Simonetti Góes

RA: 2840472521021

Curso: ADS(Análise e desenvolvimento de sistemas), 3 período.

Tema: B - Árvore binária de busca:BST

Link do vídeo:

Sobre a árvore binária de busca(BST): A árvore binária de busca(BST) tem como um do seus propósitos o armazenamento de quaisquer valores, e após guardado de maneira organizada, possui capacidades como mecanismos de busca, inserção e remoção desses mesmos dados., Em sua estrutura, ele possui um nó principal no topo(denominado raíz) podendo ter apenas um filho de cada lado(esquerda e direita).Nesse sentido, vem um dos pilares fundamentais da sua lógica de funcionamento: Considerando qualquer nó na árvore, o valor da esquerda deve obrigatoriamente ser menor do que o respectivo nó pai, e já no caso da direita, deve ser maior que o seu nó pai. Algumas de suas funcionalidades são formalmente conhecidas como:

--->Busca: Começa na raiz já comparando o valor atual com o dela. Em caso do valor ser menor ele prossegue para o lado esquerdo, e se for maior, prossegue para o lado direito ignorando o outro lado e continuando a busca pelo valor. Em caso do valor ser igual ao começar, ele encerra a busca logo de cara.

--->Inserção: Partindo da lógica anterior, desce a árvore comparando valores e procurando um nó vazio.Caso encontre, ele assume como novo nó da árvore.

--->Remover: Com alguns detalhes a mais, possui os seguintes princípios: 0 filhos - remove diretamente o nó; Nó com 1 filho - liga o pai do nó removido ao único filho do nó; Nó com 2 filhos - busca o menor valor de uma das subarvores(direita ou esquerda) para substituir e manter a lógica

--->Método In-order: Em ordem crescente vai Esquerda, Raiz, Direita

Pre-order: Primeiramente, antes de qualquer nó filho, coleta a raiz primeiro e depois prossegue para a subarvore esquerda e em seguida para a direita. Portanto segue a linha Raiz, Esquerda, Direita

Post-order: Visita a raiz por último, depois de já ter visitado todos os filhos de ambos os lados(esquerda e direita). Assim segue Esquerda, Direita e por fim Raíz

--->Height: Métrida essencial da BST para dimensionar o tamanho e eficiência da estrutura(através do maior caminho nó e folha). Dessa forma, tem a função essencial de ditar a velocidade das operações da árvore.


Onde é utilizado: No geral, a árvore binária de busca não é utilizada de forma direta porém sim através de seus conceitos. Alguns dos exemplos são: Banco de dados e indexação(para indexar registros e recuperar dados em disco de forma otimizada).

Tabelas de símbolos em compiladores: Utilizam das árvores para armazenar identificadores(variáveis e funções).

Diretório de arquivos: Organização utilizando hierarquia entre os diretórios e arquivos em sistemas operacionais.

| Operação | Melhor Caso (Tempo) | Caso Médio (Tempo) | Pior Caso (Tempo) | Espaço Auxiliar |
| :--- | :--- | :--- | :--- | :--- |
| **Busca (Search)** | O(1) | O(log n) | O(n) | O(h) *(recursão)* / O(1) *(iterativo)* |
| **Inserção (Insert)** | O(1) | O(log n) | O(n) | O(h) *(recursão)* / O(1) *(iterativo)* |
| **Remoção (Delete)** | O(1) | O(log n) | O(n) | O(h) *(recursão)* / O(1) *(iterativo)* |


Pior caso: O pior caso O(n) ocorre quando ela se torna uma árvore desbalanceada(ou também conhecida como árvore degenerada) e ficando parecida com uma lista encadeada geometricamente. Dessa maneira, conforme se adiciona valores de maneira ordenada, a árvore irá inserir sempre na subarvore direita da anterior(seguindo as suas próprias regras). Nesse sentido, a altura passa a ser igual o numero de nós e deixa de ser log(n) que seria a eficiência ideal, fazendo com que os métodos de in-order, pre-order e post-order percam a vantagem da divisão por dois e necessitem de varredura linear em todos os valores, tornando-se O(n).


Diário de engenharia da IA:

Ferramenta utilizada: Gemini

Lista dos 3 principais prompts que foram utilizados:

"faça um simulador visual de árvores binárias de busca(um exemplo)"

"O resultado ficou muito bom, porém poderia adicionar botão de inserção aleatória ($O(\log n)$) vs. inserção ordenada / árvore degenerada($O(n)$)?"

"Funciona abrindo arquivo index html diretamente no navegador(sem necessidade de servidores backend)?"

Relato de 1 erro: Após ele contribuir com o HTML, tive que pedir para ele corrigir o fato da demonstração correr automaticamente até o final sem opções de pausar, avançar um passo por vez ou resetar.

"Voltando ao prompt de árvore binária, ele cumpre esses requisitos?

Execução Passo a Passo: Botões de Executar / Play, Próximo Passo (Step), Pausar e Reiniciar (Reset).
Cenários Pré-configurados: Botões para carregar rapidamente exemplos didáticos (ex.: Caso Médio, Pior Caso, Exemplo Customizado).
Painel de Estado e Métricas: Exibição em tempo real do que está acontecendo no passo atual (log explicativo do passo, número de comparações/operações acumuladas e estado das variáveis auxiliares).
Autocontido: Deve funcionar abrindo o arquivo index.html diretamente no navegador (sem exigir instalação complexa de servidores backend)." e ele ainda não havia entendido, e então mandei:

"Digo do que havia sido gerado anteriormente" e assim compreendeu.



                                                                        
