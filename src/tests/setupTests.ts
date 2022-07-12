//por padrão o jest consegue acessar a dom, mas a testing-library tras um pack de funcionalidades
//que irão ajudar no desenvolvimento de testes
//Não é fundamentão a utilização dessa lib para que os testes sejam feitos utilizando o jest,
//mas é recomendado porque facilita o desemvolvimento
import '@testing-library/jest-dom/extend-expect'
