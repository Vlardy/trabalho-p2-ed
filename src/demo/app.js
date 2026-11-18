/**
 * ESTRUTURA DE DADOS: ÁRVORE BINÁRIA DE BUSCA (BST) COM TRACE GENERATION
 */
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BSTSimulator {
    constructor() {
        this.root = null;
        this.snapshots = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.playInterval = null;
        this.speed = 1.0;
    }

    // Clona profundamente a árvore para salvar em cada snapshot
    cloneTree(node) {
        if (!node) return null;
        const newNode = new Node(node.value);
        newNode.left = this.cloneTree(node.left);
        newNode.right = this.cloneTree(node.right);
        return newNode;
    }

    // Calcula o total de nós (n)
    countNodes(node) {
        if (!node) return 0;
        return 1 + this.countNodes(node.left) + this.countNodes(node.right);
    }

    // Calcula a altura da árvore (h)
    getHeight(node) {
        if (!node) return 0;
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    // Registra um frame na linha do tempo
    recordSnapshot(state) {
        this.snapshots.push({
            tree: this.cloneTree(state.tree !== undefined ? state.tree : this.root),
            currentVal: state.currentVal ?? null,
            visitedVals: [...(state.visitedVals || [])],
            stackedVals: [...(state.stackedVals || [])],
            collectedVals: [...(state.collectedVals || [])],
            foundVal: state.foundVal ?? null,
            notFoundVal: state.notFoundVal ?? null,
            log: state.log,
            comparisons: state.comparisons ?? 0,
            vars: {
                operacao: state.vars?.operacao || '-',
                alvo: state.vars?.alvo ?? '-',
                no_atual: state.vars?.no_atual ?? 'NULL',
                no_pai: state.vars?.no_pai ?? 'NULL',
                direcao: state.vars?.direcao || '-',
                estrutura: state.vars?.estrutura || '[ ]',
                status: state.vars?.status || 'Em andamento'
            }
        });
    }

    // Inserção silenciosa (usada para montar cenários instantâneos)
    insertSilent(value) {
        const newNode = new Node(value);
        if (!this.root) {
            this.root = newNode;
            return;
        }
        let curr = this.root;
        while (true) {
            if (value === curr.value) return;
            if (value < curr.value) {
                if (!curr.left) { curr.left = newNode; return; }
                curr = curr.left;
            } else {
                if (!curr.right) { curr.right = newNode; return; }
                curr = curr.right;
            }
        }
    }

    // ==========================================
    // 1. OPERAÇÃO DE INSERÇÃO COM SNAPSHOTS
    // ==========================================
    generateInsertTrace(value) {
        this.snapshots = [];
        let comparisons = 0;
        const visited = [];

        this.recordSnapshot({
            log: `Iniciando inserção do valor ${value} na Árvore Binária de Busca.`,
            comparisons,
            vars: { operacao: 'INSERÇÃO', alvo: value, no_atual: this.root ? this.root.value : 'NULL', no_pai: 'NULL', direcao: 'Raiz', estrutura: '[ ]', status: 'Iniciando' }
        });

        if (!this.root) {
            this.root = new Node(value);
            this.recordSnapshot({
                foundVal: value,
                log: `A árvore estava vazia. O valor ${value} foi inserido diretamente como a nova RAIZ.`,
                comparisons,
                vars: { operacao: 'INSERÇÃO', alvo: value, no_atual: value, no_pai: 'NULL', direcao: 'Raiz', estrutura: '[ ]', status: 'Concluído' }
            });
            return;
        }

        let current = this.root;
        let parent = null;

        while (current !== null) {
            comparisons++;
            this.recordSnapshot({
                currentVal: current.value,
                visitedVals: visited,
                log: `Comparando alvo (${value}) com o nó atual (${current.value}). Comparações até agora: ${comparisons}.`,
                comparisons,
                vars: { operacao: 'INSERÇÃO', alvo: value, no_atual: current.value, no_pai: parent ? parent.value : 'NULL', direcao: 'Avaliando', estrutura: '[ ]', status: 'Comparando' }
            });

            if (value === current.value) {
                this.recordSnapshot({
                    notFoundVal: value,
                    visitedVals: visited,
                    log: `O valor ${value} já existe na árvore! Árvores Binárias de Busca padrão não permitem chaves duplicadas.`,
                    comparisons,
                    vars: { operacao: 'INSERÇÃO', alvo: value, no_atual: current.value, no_pai: parent ? parent.value : 'NULL', direcao: 'Nenhuma', estrutura: '[ ]', status: 'Duplicado (Abortado)' }
                });
                return;
            }

            visited.push(current.value);
            parent = current;

            if (value < current.value) {
                current = current.left;
                this.recordSnapshot({
                    currentVal: current ? current.value : null,
                    visitedVals: visited,
                    log: `Como ${value} < ${parent.value}, descemos para a subárvore ESQUERDA.`,
                    comparisons,
                    vars: { operacao: 'INSERÇÃO', alvo: value, no_atual: current ? current.value : 'NULL', no_pai: parent.value, direcao: 'Esquerda (<)', estrutura: '[ ]', status: 'Navegando' }
                });
            } else {
                current = current.right;
                this.recordSnapshot({
                    currentVal: current ? current.value : null,
                    visitedVals: visited,
                    log: `Como ${value} > ${parent.value}, descemos para a subárvore DIREITA.`,
                    comparisons,
                    vars: { operacao: 'INSERÇÃO', alvo: value, no_atual: current ? current.value : 'NULL', no_pai: parent.value, direcao: 'Direita (>)', estrutura: '[ ]', status: 'Navegando' }
                });
            }
        }

        const newNode = new Node(value);
        const side = value < parent.value ? 'esquerda' : 'direita';
        if (value < parent.value) parent.left = newNode;
        else parent.right = newNode;

        this.recordSnapshot({
            foundVal: value,
            visitedVals: visited,
            log: `Posição vazia (NULL) encontrada! O nó ${value} foi conectado à ${side} do nó pai ${parent.value}.`,
            comparisons,
            vars: { operacao: 'INSERÇÃO', alvo: value, no_atual: value, no_pai: parent.value, direcao: side.toUpperCase(), estrutura: '[ ]', status: 'Inserido com Sucesso' }
        });
    }

    // ==========================================
    // 2. OPERAÇÃO DE BUSCA COM SNAPSHOTS
    // ==========================================
    generateSearchTrace(value) {
        this.snapshots = [];
        let comparisons = 0;
        const visited = [];

        this.recordSnapshot({
            log: `Iniciando busca pelo valor ${value} a partir da raiz.`,
            comparisons,
            vars: { operacao: 'BUSCA', alvo: value, no_atual: this.root ? this.root.value : 'NULL', no_pai: 'NULL', direcao: 'Raiz', estrutura: '[ ]', status: 'Iniciando' }
        });

        let current = this.root;
        let parent = null;

        while (current !== null) {
            comparisons++;
            this.recordSnapshot({
                currentVal: current.value,
                visitedVals: visited,
                log: `Passo ${comparisons}: Verificando se o nó atual (${current.value}) é igual ao alvo (${value}).`,
                comparisons,
                vars: { operacao: 'BUSCA', alvo: value, no_atual: current.value, no_pai: parent ? parent.value : 'NULL', direcao: 'Avaliando', estrutura: '[ ]', status: 'Comparando' }
            });

            if (value === current.value) {
                this.recordSnapshot({
                    foundVal: current.value,
                    visitedVals: visited,
                    log: `SUCESSO! Valor ${value} encontrado após ${comparisons} comparação(ões).`,
                    comparisons,
                    vars: { operacao: 'BUSCA', alvo: value, no_atual: current.value, no_pai: parent ? parent.value : 'NULL', direcao: 'Alvo Encontrado', estrutura: '[ ]', status: 'Encontrado (True)' }
                });
                return;
            }

            visited.push(current.value);
            parent = current;

            if (value < current.value) {
                current = current.left;
                this.recordSnapshot({
                    currentVal: current ? current.value : null,
                    visitedVals: visited,
                    log: `Como ${value} < ${parent.value}, descartamos a subárvore direita e vamos para a ESQUERDA.`,
                    comparisons,
                    vars: { operacao: 'BUSCA', alvo: value, no_atual: current ? current.value : 'NULL', no_pai: parent.value, direcao: 'Esquerda (<)', estrutura: '[ ]', status: 'Buscando' }
                });
            } else {
                current = current.right;
                this.recordSnapshot({
                    currentVal: current ? current.value : null,
                    visitedVals: visited,
                    log: `Como ${value} > ${parent.value}, descartamos a subárvore esquerda e vamos para a DIREITA.`,
                    comparisons,
                    vars: { operacao: 'BUSCA', alvo: value, no_atual: current ? current.value : 'NULL', no_pai: parent.value, direcao: 'Direita (>)', estrutura: '[ ]', status: 'Buscando' }
                });
            }
        }

        this.recordSnapshot({
            visitedVals: visited,
            log: `FALHA: Chegamos a um ponteiro NULL após ${comparisons} comparação(ões). O valor ${value} não está na árvore.`,
            comparisons,
            vars: { operacao: 'BUSCA', alvo: value, no_atual: 'NULL', no_pai: parent ? parent.value : 'NULL', direcao: 'Fim do Caminho', estrutura: '[ ]', status: 'Não Encontrado (False)' }
        });
    }

    // ==========================================
    // 3. OPERAÇÃO DE REMOÇÃO COM SNAPSHOTS
    // ==========================================
    generateRemoveTrace(value) {
        this.snapshots = [];
        let comparisons = 0;
        const visited = [];

        this.recordSnapshot({
            log: `Iniciando remoção do valor ${value}. Primeiro precisamos localizar o nó na árvore.`,
            comparisons,
            vars: { operacao: 'REMOÇÃO', alvo: value, no_atual: this.root ? this.root.value : 'NULL', no_pai: 'NULL', direcao: 'Raiz', estrutura: '[ ]', status: 'Buscando Alvo' }
        });

        let current = this.root;
        let parent = null;

        while (current !== null && current.value !== value) {
            comparisons++;
            this.recordSnapshot({
                currentVal: current.value,
                visitedVals: visited,
                log: `Comparando alvo (${value}) com nó atual (${current.value}).`,
                comparisons,
                vars: { operacao: 'REMOÇÃO', alvo: value, no_atual: current.value, no_pai: parent ? parent.value : 'NULL', direcao: 'Avaliando', estrutura: '[ ]', status: 'Buscando Alvo' }
            });

            visited.push(current.value);
            parent = current;

            if (value < current.value) current = current.left;
            else current = current.right;
        }

        if (current === null) {
            this.recordSnapshot({
                visitedVals: visited,
                log: `O valor ${value} não foi encontrado na árvore. Nenhuma remoção realizada.`,
                comparisons,
                vars: { operacao: 'REMOÇÃO', alvo: value, no_atual: 'NULL', no_pai: parent ? parent.value : 'NULL', direcao: '-', estrutura: '[ ]', status: 'Não Encontrado' }
            });
            return;
        }

        comparisons++;
        this.recordSnapshot({
            notFoundVal: current.value,
            visitedVals: visited,
            log: `Nó ${value} localizado! Analisando quantos filhos ele possui para aplicar a regra de remoção.`,
            comparisons,
            vars: { operacao: 'REMOÇÃO', alvo: value, no_atual: current.value, no_pai: parent ? parent.value : 'NULL', direcao: 'Encontrado', estrutura: '[ ]', status: 'Analisando Filhos' }
        });

        if (!current.left && !current.right) {
            if (!parent) this.root = null;
            else if (parent.left === current) parent.left = null;
            else parent.right = null;

            this.recordSnapshot({
                visitedVals: visited,
                log: `Caso 1 (Nó Folha): O nó ${value} não tinha filhos, então foi removido diretamente.`,
                comparisons,
                vars: { operacao: 'REMOÇÃO', alvo: value, no_atual: 'NULL', no_pai: parent ? parent.value : 'NULL', direcao: 'Folha Removida', estrutura: '[ ]', status: 'Concluído' }
            });
        } else if (!current.left || !current.right) {
            const child = current.left ? current.left : current.right;
            if (!parent) this.root = child;
            else if (parent.left === current) parent.left = child;
            else parent.right = child;

            this.recordSnapshot({
                foundVal: child.value,
                visitedVals: visited,
                log: `Caso 2 (1 Filho): O nó ${value} foi removido e seu único filho (${child.value}) assumiu seu lugar.`,
                comparisons,
                vars: { operacao: 'REMOÇÃO', alvo: value, no_atual: child.value, no_pai: parent ? parent.value : 'NULL', direcao: 'Promovido Filho', estrutura: '[ ]', status: 'Concluído' }
            });
        } else {
            let successorParent = current;
            let successor = current.right;
            while (successor.left !== null) {
                comparisons++;
                successorParent = successor;
                successor = successor.left;
            }

            this.recordSnapshot({
                currentVal: successor.value,
                notFoundVal: current.value,
                visitedVals: visited,
                log: `Caso 3 (2 Filhos): Buscamos o menor valor da subárvore direita (Sucessor In-Order), que é ${successor.value}.`,
                comparisons,
                vars: { operacao: 'REMOÇÃO', alvo: value, no_atual: successor.value, no_pai: successorParent.value, direcao: 'Sucessor In-Order', estrutura: '[ ]', status: 'Substituindo' }
            });

            const valSucessor = successor.value;
            if (successorParent !== current) {
                successorParent.left = successor.right;
            } else {
                successorParent.right = successor.right;
            }
            current.value = valSucessor;

            this.recordSnapshot({
                foundVal: valSucessor,
                visitedVals: visited,
                log: `O valor ${value} foi substituído pelo seu sucessor ${valSucessor}, mantendo a propriedade da BST intacta!`,
                comparisons,
                vars: { operacao: 'REMOÇÃO', alvo: value, no_atual: valSucessor, no_pai: parent ? parent.value : 'NULL', direcao: 'Árvore Reajustada', estrutura: '[ ]', status: 'Concluído' }
            });
        }
    }

    // ==========================================
    // 4. TRAVESSIAS DFS (IN-ORDER, PRE-ORDER, POST-ORDER)
    // ==========================================
    generateDFSTrace(type) {
        this.snapshots = [];
        let stepsCount = 0;
        const callStack = [];
        const collected = [];
        const explored = [];

        const rules = {
            'IN-ORDER': { label: 'In-Order (Em-Ordem)', rule: 'Esquerda → Raiz → Direita' },
            'PRE-ORDER': { label: 'Pre-Order (Pré-Ordem)', rule: 'Raiz → Esquerda → Direita' },
            'POST-ORDER': { label: 'Post-Order (Pós-Ordem)', rule: 'Esquerda → Direita → Raiz' }
        };

        const info = rules[type];

        this.recordSnapshot({
            log: `Iniciando travessia em profundidade ${info.label}. Regra: ${info.rule}.`,
            comparisons: stepsCount,
            vars: { operacao: info.label, alvo: info.rule, no_atual: this.root ? this.root.value : 'NULL', no_pai: 'NULL', direcao: 'Início DFS', estrutura: 'Pilha: []', status: 'Iniciando' }
        });

        const traverse = (node, parentVal) => {
            if (!node) return;

            callStack.push(node.value);
            if (!explored.includes(node.value)) explored.push(node.value);
            stepsCount++;

            this.recordSnapshot({
                currentVal: node.value,
                visitedVals: explored,
                stackedVals: callStack,
                collectedVals: collected,
                log: `Empilhando chamada recursiva no nó ${node.value}.`,
                comparisons: stepsCount,
                vars: { operacao: info.label, alvo: info.rule, no_atual: node.value, no_pai: parentVal ?? 'NULL', direcao: 'Empilhando', estrutura: `Pilha: [${callStack.join(', ')}]`, status: 'Explorando' }
            });

            if (type === 'PRE-ORDER') {
                collected.push(node.value);
                stepsCount++;
                this.recordSnapshot({
                    foundVal: node.value,
                    visitedVals: explored,
                    stackedVals: callStack,
                    collectedVals: collected,
                    log: `[Pre-Order] Visitando e coletando a RAIZ (${node.value}) antes de descer aos filhos.`,
                    comparisons: stepsCount,
                    vars: { operacao: info.label, alvo: info.rule, no_atual: node.value, no_pai: parentVal ?? 'NULL', direcao: 'Coletar Raiz', estrutura: `Pilha: [${callStack.join(', ')}]`, status: 'Coletado' }
                });
            }

            if (node.left) {
                this.recordSnapshot({
                    currentVal: node.value,
                    visitedVals: explored,
                    stackedVals: callStack,
                    collectedVals: collected,
                    log: `Descendo para a subárvore ESQUERDA de ${node.value} (nó ${node.left.value}).`,
                    comparisons: stepsCount,
                    vars: { operacao: info.label, alvo: info.rule, no_atual: node.value, no_pai: parentVal ?? 'NULL', direcao: 'Esquerda', estrutura: `Pilha: [${callStack.join(', ')}]`, status: 'Descendo' }
                });
                traverse(node.left, node.value);
            }

            if (type === 'IN-ORDER') {
                collected.push(node.value);
                stepsCount++;
                this.recordSnapshot({
                    foundVal: node.value,
                    visitedVals: explored,
                    stackedVals: callStack,
                    collectedVals: collected,
                    log: `[In-Order] Subárvore esquerda concluída. Visitando e coletando ${node.value} (ordem crescente!).`,
                    comparisons: stepsCount,
                    vars: { operacao: info.label, alvo: info.rule, no_atual: node.value, no_pai: parentVal ?? 'NULL', direcao: 'Coletar Raiz', estrutura: `Pilha: [${callStack.join(', ')}]`, status: 'Coletado' }
                });
            }

            if (node.right) {
                this.recordSnapshot({
                    currentVal: node.value,
                    visitedVals: explored,
                    stackedVals: callStack,
                    collectedVals: collected,
                    log: `Descendo para a subárvore DIREITA de ${node.value} (nó ${node.right.value}).`,
                    comparisons: stepsCount,
                    vars: { operacao: info.label, alvo: info.rule, no_atual: node.value, no_pai: parentVal ?? 'NULL', direcao: 'Direita', estrutura: `Pilha: [${callStack.join(', ')}]`, status: 'Descendo' }
                });
                traverse(node.right, node.value);
            }

            if (type === 'POST-ORDER') {
                collected.push(node.value);
                stepsCount++;
                this.recordSnapshot({
                    foundVal: node.value,
                    visitedVals: explored,
                    stackedVals: callStack,
                    collectedVals: collected,
                    log: `[Post-Order] Filhos esquerdo e direito concluídos. Visitando e coletando ${node.value}.`,
                    comparisons: stepsCount,
                    vars: { operacao: info.label, alvo: info.rule, no_atual: node.value, no_pai: parentVal ?? 'NULL', direcao: 'Coletar Raiz', estrutura: `Pilha: [${callStack.join(', ')}]`, status: 'Coletado' }
                });
            }

            callStack.pop();
        };

        traverse(this.root, null);

        this.recordSnapshot({
            visitedVals: explored,
            collectedVals: collected,
            log: `Travessia ${info.label} concluída! Sequência final: [${collected.join(', ')}].`,
            comparisons: stepsCount,
            vars: { operacao: info.label, alvo: info.rule, no_atual: 'NULL', no_pai: 'NULL', direcao: 'Fim', estrutura: 'Pilha: []', status: 'Concluído' }
        });
    }

    // ==========================================
    // 5. TRAVESSIA BFS (LEVEL-ORDER / EM LARGURA)
    // ==========================================
    generateBFSTrace() {
        this.snapshots = [];
        let stepsCount = 0;
        const queue = [];
        const collected = [];
        const explored = [];

        this.recordSnapshot({
            log: `Iniciando travessia em largura Level-Order (BFS). Utiliza uma FILA (FIFO) para visitar nível por nível.`,
            comparisons: stepsCount,
            vars: { operacao: 'LEVEL-ORDER (BFS)', alvo: 'Nível por Nível', no_atual: this.root ? this.root.value : 'NULL', no_pai: 'NULL', direcao: 'Início BFS', estrutura: 'Fila: []', status: 'Iniciando' }
        });

        if (!this.root) return;

        queue.push(this.root);
        explored.push(this.root.value);

        this.recordSnapshot({
            stackedVals: queue.map(n => n.value),
            visitedVals: explored,
            log: `Enfileirando a raiz (${this.root.value}) na fila de processamento.`,
            comparisons: ++stepsCount,
            vars: { operacao: 'LEVEL-ORDER (BFS)', alvo: 'Nível por Nível', no_atual: this.root.value, no_pai: 'NULL', direcao: 'Enfileirar Raiz', estrutura: `Fila: [${queue.map(n => n.value).join(', ')}]`, status: 'Enfileirando' }
        });

        while (queue.length > 0) {
            const current = queue.shift();
            collected.push(current.value);
            stepsCount++;

            this.recordSnapshot({
                foundVal: current.value,
                stackedVals: queue.map(n => n.value),
                visitedVals: explored,
                collectedVals: collected,
                log: `Desenfileirando e coletando o nó ${current.value} da frente da fila.`,
                comparisons: stepsCount,
                vars: { operacao: 'LEVEL-ORDER (BFS)', alvo: 'Nível por Nível', no_atual: current.value, no_pai: '-', direcao: 'Desenfileirar', estrutura: `Fila: [${queue.map(n => n.value).join(', ')}]`, status: 'Coletado' }
            });

            if (current.left) {
                queue.push(current.left);
                explored.push(current.left.value);
                stepsCount++;
                this.recordSnapshot({
                    currentVal: current.value,
                    stackedVals: queue.map(n => n.value),
                    visitedVals: explored,
                    collectedVals: collected,
                    log: `Adicionando filho esquerdo (${current.left.value}) de ${current.value} ao final da fila.`,
                    comparisons: stepsCount,
                    vars: { operacao: 'LEVEL-ORDER (BFS)', alvo: 'Nível por Nível', no_atual: current.value, no_pai: current.value, direcao: 'Enfileirar Esq.', estrutura: `Fila: [${queue.map(n => n.value).join(', ')}]`, status: 'Enfileirando' }
                });
            }

            if (current.right) {
                queue.push(current.right);
                explored.push(current.right.value);
                stepsCount++;
                this.recordSnapshot({
                    currentVal: current.value,
                    stackedVals: queue.map(n => n.value),
                    visitedVals: explored,
                    collectedVals: collected,
                    log: `Adicionando filho direito (${current.right.value}) de ${current.value} ao final da fila.`,
                    comparisons: stepsCount,
                    vars: { operacao: 'LEVEL-ORDER (BFS)', alvo: 'Nível por Nível', no_atual: current.value, no_pai: current.value, direcao: 'Enfileirar Dir.', estrutura: `Fila: [${queue.map(n => n.value).join(', ')}]`, status: 'Enfileirando' }
                });
            }
        }

        this.recordSnapshot({
            visitedVals: explored,
            collectedVals: collected,
            log: `Travessia Level-Order (BFS) concluída! Sequência por níveis: [${collected.join(', ')}].`,
            comparisons: stepsCount,
            vars: { operacao: 'LEVEL-ORDER (BFS)', alvo: 'Nível por Nível', no_atual: 'NULL', no_pai: 'NULL', direcao: 'Fim', estrutura: 'Fila: []', status: 'Concluído' }
        });
    }
}

// ==========================================
// CONTROLADOR DE INTERFACE E RENDERIZAÇÃO SVG
// ==========================================
const sim = new BSTSimulator();
const svg = document.getElementById('bst-svg');

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
}

function calculateNodePositions(root) {
    const positions = new Map();
    if (!root) return positions;

    const height = sim.getHeight(root);
    const width = 800;
    const verticalSpacing = Math.min(75, 380 / Math.max(height, 1));

    function traverse(node, depth, minX, maxX) {
        if (!node) return;
        const x = (minX + maxX) / 2;
        const y = 45 + depth * verticalSpacing;
        positions.set(node.value, { x, y, node });

        traverse(node.left, depth + 1, minX, x);
        traverse(node.right, depth + 1, x, maxX);
    }

    traverse(root, 0, 25, width - 25);
    return positions;
}

function renderSnapshot(index) {
    if (sim.snapshots.length === 0) {
        renderStaticTree(sim.root);
        return;
    }

    const snap = sim.snapshots[index];
    svg.innerHTML = '';

    const positions = calculateNodePositions(snap.tree);

    positions.forEach(({ x, y, node }) => {
        if (node.left && positions.has(node.left.value)) {
            const childPos = positions.get(node.left.value);
            const isVisited = snap.visitedVals.includes(node.value) && 
                              (snap.visitedVals.includes(node.left.value) || snap.currentVal === node.left.value || snap.foundVal === node.left.value);
            drawEdge(x, y, childPos.x, childPos.y, isVisited);
        }
        if (node.right && positions.has(node.right.value)) {
            const childPos = positions.get(node.right.value);
            const isVisited = snap.visitedVals.includes(node.value) && 
                              (snap.visitedVals.includes(node.right.value) || snap.currentVal === node.right.value || snap.foundVal === node.right.value);
            drawEdge(x, y, childPos.x, childPos.y, isVisited);
        }
    });

    positions.forEach(({ x, y, node }) => {
        let statusClass = '';
        const orderIdx = snap.collectedVals.indexOf(node.value);

        if (snap.notFoundVal === node.value) statusClass = 'not-found';
        else if (snap.foundVal === node.value || orderIdx !== -1) statusClass = 'found';
        else if (snap.currentVal === node.value) statusClass = 'current';
        else if (snap.stackedVals.includes(node.value)) statusClass = 'stacked';
        else if (snap.visitedVals.includes(node.value)) statusClass = 'visited';

        drawNode(x, y, node.value, statusClass, orderIdx !== -1 ? orderIdx + 1 : null);
    });

    document.getElementById('step-log').textContent = snap.log;
    document.getElementById('metric-comparisons').textContent = snap.comparisons;
    
    const outputBox = document.getElementById('traversal-output');
    if (snap.collectedVals.length > 0) {
        outputBox.textContent = `[ ${snap.collectedVals.join(' → ')} ]`;
    } else {
        outputBox.textContent = '[ ]';
    }

    const totalNodes = sim.countNodes(snap.tree);
    const treeHeight = sim.getHeight(snap.tree);
    document.getElementById('metric-nodes').textContent = totalNodes;
    document.getElementById('metric-height').textContent = treeHeight;
    updateEfficiencyBadge(totalNodes, treeHeight);

    document.getElementById('var-op').textContent = snap.vars.operacao;
    document.getElementById('var-target').textContent = snap.vars.alvo;
    document.getElementById('var-current').textContent = snap.vars.no_atual;
    document.getElementById('var-parent').textContent = snap.vars.no_pai;
    document.getElementById('var-direction').textContent = snap.vars.direcao;
    document.getElementById('var-structure').textContent = snap.vars.estrutura;
    document.getElementById('var-status').textContent = snap.vars.status;

    document.getElementById('step-counter').textContent = `Passo: ${index + 1} de ${sim.snapshots.length}`;
    updatePlaybackButtons();
}

function renderStaticTree(root) {
    svg.innerHTML = '';
    const positions = calculateNodePositions(root);
    positions.forEach(({ x, y, node }) => {
        if (node.left && positions.has(node.left.value)) {
            const c = positions.get(node.left.value);
            drawEdge(x, y, c.x, c.y, false);
        }
        if (node.right && positions.has(node.right.value)) {
            const c = positions.get(node.right.value);
            drawEdge(x, y, c.x, c.y, false);
        }
    });
    positions.forEach(({ x, y, node }) => drawNode(x, y, node.value, '', null));

    const n = sim.countNodes(root);
    const h = sim.getHeight(root);
    document.getElementById('metric-nodes').textContent = n;
    document.getElementById('metric-height').textContent = h;
    document.getElementById('metric-comparisons').textContent = '0';
    document.getElementById('traversal-output').textContent = '[ ]';
    document.getElementById('var-structure').textContent = '[ ]';
    updateEfficiencyBadge(n, h);
    document.getElementById('step-counter').textContent = 'Passo: 0 de 0';
    updatePlaybackButtons();
}

function drawEdge(x1, y1, x2, y2, isVisited) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', `edge ${isVisited ? 'visited' : ''}`);
    svg.appendChild(line);
}

function drawNode(x, y, val, statusClass, orderNumber) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 19);
    circle.setAttribute('class', `node-circle ${statusClass}`);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('class', 'node-text');
    text.textContent = val;

    g.appendChild(circle);
    g.appendChild(text);

    if (orderNumber !== null) {
        const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badge.setAttribute('x', x + 21);
        badge.setAttribute('y', y - 14);
        badge.setAttribute('class', 'node-order-badge');
        badge.textContent = `#${orderNumber}`;
        g.appendChild(badge);
    }

    svg.appendChild(g);
}

function updateEfficiencyBadge(n, h) {
    const el = document.getElementById('metric-efficiency');
    if (n === 0) {
        el.innerHTML = `<span class="badge-complexity" style="background: #334155; color: #cbd5e1;">Vazia</span>`;
        return;
    }
    const idealHeight = Math.floor(Math.log2(n)) + 1;
    if (h <= idealHeight + 1) {
        el.innerHTML = `<span class="badge-complexity" style="background: #064e3b; color: #34d399;">O(log n) Ótima</span>`;
    } else if (h === n && n > 2) {
        el.innerHTML = `<span class="badge-complexity" style="background: #7f1d1d; color: #fca5a5;">O(n) Degenerada</span>`;
    } else {
        el.innerHTML = `<span class="badge-complexity" style="background: #78350f; color: #fcd34d;">Desbalanceada</span>`;
    }
}

// ==========================================
// CONTROLES DE REPRODUÇÃO (PLAY / STEP / RESET)
// ==========================================
function startPlayback() {
    if (sim.snapshots.length === 0) return;
    if (sim.currentStep >= sim.snapshots.length - 1) {
        sim.currentStep = 0;
    }
    sim.isPlaying = true;
    updatePlaybackButtons();

    const intervalMs = 1000 / sim.speed;
    sim.playInterval = setInterval(() => {
        if (sim.currentStep < sim.snapshots.length - 1) {
            sim.currentStep++;
            renderSnapshot(sim.currentStep);
        } else {
            pausePlayback();
        }
    }, intervalMs);
}

function pausePlayback() {
    sim.isPlaying = false;
    clearInterval(sim.playInterval);
    updatePlaybackButtons();
}

function updatePlaybackButtons() {
    const hasSteps = sim.snapshots.length > 0;
    document.getElementById('btn-play').disabled = !hasSteps || sim.isPlaying;
    document.getElementById('btn-pause').disabled = !sim.isPlaying;
    document.getElementById('btn-prev').disabled = !hasSteps || sim.isPlaying || sim.currentStep <= 0;
    document.getElementById('btn-step').disabled = !hasSteps || sim.isPlaying || sim.currentStep >= sim.snapshots.length - 1;
    document.getElementById('btn-reset').disabled = !hasSteps || sim.isPlaying || sim.currentStep === 0;
}

// ==========================================
// EVENT LISTENERS
// ==========================================
document.getElementById('btn-play').addEventListener('click', startPlayback);
document.getElementById('btn-pause').addEventListener('click', pausePlayback);

document.getElementById('btn-step').addEventListener('click', () => {
    pausePlayback();
    if (sim.currentStep < sim.snapshots.length - 1) {
        sim.currentStep++;
        renderSnapshot(sim.currentStep);
    }
});

document.getElementById('btn-prev').addEventListener('click', () => {
    pausePlayback();
    if (sim.currentStep > 0) {
        sim.currentStep--;
        renderSnapshot(sim.currentStep);
    }
});

document.getElementById('btn-reset').addEventListener('click', () => {
    pausePlayback();
    sim.currentStep = 0;
    renderSnapshot(0);
});

document.getElementById('speed-slider').addEventListener('input', (e) => {
    sim.speed = parseFloat(e.target.value);
    document.getElementById('speed-label').textContent = `${sim.speed.toFixed(1)}x`;
    if (sim.isPlaying) {
        pausePlayback();
        startPlayback();
    }
});

function getOperationValue() {
    const val = parseInt(document.getElementById('input-op-value').value, 10);
    if (isNaN(val)) {
        showToast('Por favor, digite um número inteiro válido.');
        return null;
    }
    return val;
}

document.getElementById('btn-insert').addEventListener('click', () => {
    const val = getOperationValue();
    if (val === null) return;
    pausePlayback();
    sim.generateInsertTrace(val);
    sim.currentStep = 0;
    renderSnapshot(0);
    startPlayback();
});

document.getElementById('btn-search').addEventListener('click', () => {
    const val = getOperationValue();
    if (val === null) return;
    if (!sim.root) {
        showToast('A árvore está vazia! Insira valores antes de buscar.');
        return;
    }
    pausePlayback();
    sim.generateSearchTrace(val);
    sim.currentStep = 0;
    renderSnapshot(0);
    startPlayback();
});

document.getElementById('btn-remove').addEventListener('click', () => {
    const val = getOperationValue();
    if (val === null) return;
    if (!sim.root) {
        showToast('A árvore está vazia! Não há elementos para remover.');
        return;
    }
    pausePlayback();
    sim.generateRemoveTrace(val);
    sim.currentStep = 0;
    renderSnapshot(0);
    startPlayback();
});

function runTraversal(type) {
    if (!sim.root) {
        showToast('A árvore está vazia! Carregue um cenário antes de percorrer.');
        return;
    }
    pausePlayback();
    if (type === 'LEVEL-ORDER') {
        sim.generateBFSTrace();
    } else {
        sim.generateDFSTrace(type);
    }
    sim.currentStep = 0;
    renderSnapshot(0);
    startPlayback();
}

document.getElementById('btn-inorder').addEventListener('click', () => runTraversal('IN-ORDER'));
document.getElementById('btn-preorder').addEventListener('click', () => runTraversal('PRE-ORDER'));
document.getElementById('btn-postorder').addEventListener('click', () => runTraversal('POST-ORDER'));
document.getElementById('btn-levelorder').addEventListener('click', () => runTraversal('LEVEL-ORDER'));

function loadArrayScenario(arr, description) {
    pausePlayback();
    sim.root = null;
    sim.snapshots = [];
    arr.forEach(num => sim.insertSilent(num));
    renderStaticTree(sim.root);
    document.getElementById('step-log').textContent = description;
    document.getElementById('var-op').textContent = 'CARGA EM LOTE';
    document.getElementById('var-target').textContent = '-';
    document.getElementById('var-status').textContent = 'Pronto para operar';
}

document.getElementById('btn-preset-balanced').addEventListener('click', () => {
    loadArrayScenario(
        [50, 30, 70, 20, 40, 60, 80],
        'Cenário Caso Médio (Árvore Balanceada) carregado: [50, 30, 70, 20, 40, 60, 80]. Teste clicar em "In-Order" para ver os números saírem ordenados!'
    );
});

document.getElementById('btn-preset-complete').addEventListener('click', () => {
    loadArrayScenario(
        [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43, 56, 68, 81, 93],
        'Cenário Árvore Completa carregado com 15 nós perfeitamente distribuídos em 4 níveis (h = 4). Experimente a travessia Level-Order (BFS)!'
    );
});

document.getElementById('btn-preset-worst').addEventListener('click', () => {
    loadArrayScenario(
        [10, 20, 30, 40, 50, 60],
        'Cenário Pior Caso (Árvore Degenerada) carregado: [10, 20, 30, 40, 50, 60]. Inserir dados ordenados transforma a BST em uma lista encadeada (O(n)).'
    );
});

document.getElementById('btn-load-custom').addEventListener('click', () => {
    const raw = document.getElementById('input-custom-array').value;
    const nums = raw.split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));

    if (nums.length === 0) {
        showToast('Digite números válidos separados por vírgula. Ex: 40, 20, 60');
        return;
    }

    loadArrayScenario(
        nums,
        `Exemplo Customizado carregado com ${nums.length} elemento(s): [${nums.join(', ')}]. Use os botões de operação ou travessia acima.`
    );
});

document.getElementById('btn-clear-tree').addEventListener('click', () => {
    pausePlayback();
    sim.root = null;
    sim.snapshots = [];
    renderStaticTree(null);
    document.getElementById('step-log').textContent = 'Árvore limpa. Insira um valor ou carregue um cenário pré-configurado.';
    document.getElementById('var-op').textContent = '-';
    document.getElementById('var-target').textContent = '-';
    document.getElementById('var-status').textContent = 'Vazia';
});

window.onload = () => {
    document.getElementById('btn-preset-balanced').click();
};
