import axios from 'axios';
// utilizando o axios para poder pegar rotas POST
export const api = axios.create({
  // URL base
  baseURL: '/api'
})