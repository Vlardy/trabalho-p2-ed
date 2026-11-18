#Implementação
class nó:
    def __init__(self, valor):
        self.valor = valor
        self.esquerda = None
        self.direita = None

class arvore:
    def __init__(self):
        self.raiz = None
        self._op_count = 0

    def _reset_counter(self):
        self._op_count = 0

    def _step(self):
        #Método auxiliar simples para contar uma operação
        self._op_count += 1

        #Método inserção
    def insert(self, valor):
        self._step()
        novo = nó(valor)

        #Se a árvore não possui valor, o novo atua como raiz
        if self.raiz is None:
            self.raiz = novo
            return #Encerra para não ir pro while

        nó_atual = self.raiz
        while True:
            self._step()
            if valor < nó_atual.valor:
                if nó_atual.esquerda is None:
                    nó_atual.esquerda = novo
                    break  
                nó_atual = nó_atual.esquerda
            else:   
                if nó_atual.direita is None:
                    nó_atual.direita = novo
                    break 
                nó_atual = nó_atual.direita

    def search(self, valor):
        self._reset_counter()
        no_atual = self.raiz
        
        while no_atual is not None:
            self._step()
            if valor == no_atual.valor:
                return True #Valor Encontrado
            elif valor < no_atual.valor:
                no_atual = no_atual.esquerda  #Anda pra esquerda
            else:
                no_atual = no_atual.direita   #Anda pra direita
                
        return False #Caso o while não encontre o valor depois de tudo, não está na árvore

    def remove(self, valor):
        self._reset_counter()
        self.raiz = self._remover_recursivo(self.raiz, valor)

    def _remover_recursivo(self, atual, valor):
        self._step()
        #Significa que não está na árvore

        if atual is None:
            return None

        if valor < atual.valor:
            atual.esquerda = self._remover_recursivo(atual.esquerda, valor)
        elif valor > atual.valor:
            atual.direita = self._remover_recursivo(atual.direita, valor)
        else:
            # Caso 1: Nó sem filhos ou com apenas um filho
            if atual.esquerda is None:
                return atual.direita
            elif atual.direita is None:
                return atual.esquerda

            # Caso 2: Nó com dois filhos (pega o sucessor in-order: menor da sub-árvore direita)
            sucessor = self._encontra_minimo(atual.direita)
            atual.valor = sucessor.valor
            atual.direita = self._remover_recursivo(atual.direita, sucessor.valor)

        return atual

    def _encontra_minimo(self, no):
        atual = no
        while atual.esquerda is not None:
            atual = atual.esquerda
        return atual

    def in_order(self):
        #Aqui a lógica se da pelo caminho de esquerda --> raíz ---> direita
        resultado = []
        atual = self.raiz

        while atual is not None:
            self._step()
            if atual.esquerda is None:
                #Caso não encontre nada na esquerda, processa o nó atual e caminha para direita
                resultado.append(atual.valor)
                atual = atual.direita
            else:
                #Encontra o nó mais a direita da sub-árvore da esquerda
                predecessor = atual.esquerda
                while predecessor.direita is not None and predecessor.direita != atual:
                    predecessor = predecessor.direita

                if predecessor.direita is None:
                    #Cria-se a ponte temporária, a fim de lembrar qual o próximo nó a ser visitado sem gastar mais memória(apontando para o nó atual)
                    predecessor.direita = atual
                    atual = atual.esquerda
                else:
                    #Desfaz a ponte(necessário para não criar um loop infinito) e processa atual, seguindo rumo a direita. Já percorreu a esquerda inteira
                    predecessor.direita = None
                    resultado.append(atual.valor)
                    atual = atual.direita

        return resultado

    def pre_order(self):
        #Lógica do caminho de raíz --> esquerda --> direita
        resultado = []
        atual = self.raiz

        while atual is not None:
            self._step()
            if atual.esquerda is None:
                #Assim como visto anteriormente, caso não haja nada na esquerda, prossegue para a direita
                resultado.append(atual.valor)
                atual = atual.direita
            else:
                #Novamente, encontra o nó mais à direita da sub-árvore esquerda
                predecessor = atual.esquerda
                while predecessor.direita is not None and predecessor.direita != atual:
                    predecessor = predecessor.direita

                if predecessor.direita is None:
                    #Primeira vez no caminho a passar por aqui, e já que a raíz vem primeiro na ordem, o valor também já é processado.
                    resultado.append(atual.valor)
                    #Novamente uso da ponte para descer pela esquerda no caso
                    predecessor.direita = atual
                    atual = atual.esquerda
                else:
                    #Utiliza da ponte temporária para voltar e prosseguir para a direita
                    predecessor.direita = None
                    atual = atual.direita

        return resultado

    def post_ordem(self):
        #A ordem se dá por: esquerda --> direita --> raíz
        self._reset_counter()
        resultado = []
        atual = self.raiz

        while atual is not None:
            self._step()
            if atual.direita is None:
                #Agora de maneira inversa considerando a lógica anterior.Caso não haja nada na direita, prossegue-se para a esquerda
                resultado.append(atual.valor)
                atual = atual.esquerda
            else:
                #Continuando a lógica inversa, encontra-se o nó mais a esquerda da sub-árvore direita
                predecessor = atual.direita
                while predecessor.esquerda is not None and predecessor.esquerda != atual:
                    predecessor = predecessor.esquerda

                if predecessor.esquerda is None:
                    #Primeira vez no caminho, processa o nó atual e cria ponte temporária para a esquerda
                    resultado.append(atual.valor)
                    predecessor.esquerda = atual
                    atual = atual.direita
                else:
                    #Na segunda vez, como visto anteriormente, a ponte se desfaz e segue-se para a esquerda
                    predecessor.esquerda = None
                    atual = atual.esquerda

            # Como foi feita lógica inversa (Raiz -> Direita -> Esquerda),
            # invertemos a lista no final para obter Esquerda -> Direita -> Raiz (Post-Order)

        return resultado[::-1]

    def altura(self):
        self._reset_counter()
        return self._calcular_altura(self.raiz)

    def _calcular_altura(self, nó_atual):
        self._step()
        if nó_atual is None:
            return 0 #Caso o nó seja nulo, a altura é zero(inicial)


        #De maneira recursiva calcula a altura da esquerda para a direita
        left_height = self._calcular_altura(nó_atual.esquerda)
        right_height = self._calcular_altura(nó_atual.direita)

        #Altura do nó atual(no caso 1) somada a maior altura entre os dois filhos
        return 1 + max(left_height, right_height)


if __name__ == "__main__":
    # Primeiro caso: Árvore comum, bem distribuída
    print("O caso comum: quando a árvore está balanceada")
    arvore_comum = arvore()
    valores_comuns = [50, 30, 70, 20, 40, 60, 80]
    
    for v in valores_comuns:
        arvore_comum.insert(v)

    res_post = arvore_comum.post_ordem()
    alt = arvore_comum.altura()
    
    print(f"   -> Valores inseridos: {valores_comuns}")
    print(f"   -> Post-Ordem: {res_post}")
    print(f"   -> Altura da árvore: {alt}")
    print(f"   -> Total de operações acumuladas: {arvore_comum._op_count}\n")

    # Segundo caso: Caso de borda (Árvore com apenas um elemento)
    print("Caso borda: apenas um elemento")
    arvore_borda = arvore()
    arvore_borda.insert(100)

    res_post_borda = arvore_borda.post_ordem()
    alt_borda = arvore_borda.altura()

    print(f"   -> Valores inseridos: [100]")
    print(f"   -> Post-Ordem: {res_post_borda}")
    print(f"   -> Altura da árvore: {alt_borda}\n")

    # Pior caso: Árvore degenerada/lista
    print("Pior caso: sequencial crescente")
    arvore_pior = arvore()
    valores_pior = [10, 20, 30, 40, 50]  
    
    for v in valores_pior:
        arvore_pior.insert(v)

    res_post_pior = arvore_pior.post_ordem()
    alt_pior = arvore_pior.altura()

    print(f"   -> Valores inseridos: {valores_pior}")
    print(f"   -> Post-Order: {res_post_pior}")
    print(f"   -> Altura da árvore: {alt_pior}")
    print("==================================================")
