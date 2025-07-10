// Função utilitária para criar pausas
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export default wait;
