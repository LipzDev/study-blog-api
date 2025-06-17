const axios = require('axios');

async function testUserSearch() {
  try {
    // Testar sem token primeiro para ver o erro
    console.log('🔍 Testando endpoint sem token...');
    try {
      const searchResponse = await axios.get(
        'http://localhost:3001/users/search?email=filipe.gt1998@gmail.com',
      );
      console.log('✅ Resposta:', searchResponse.data);
    } catch (error) {
      console.log(
        '❌ Erro esperado (sem token):',
        error.response?.status,
        error.response?.data?.message,
      );
    }

    // Testar se o endpoint existe
    console.log('🔍 Testando se o endpoint existe...');
    try {
      const response = await axios.get('http://localhost:3001/users/search');
      console.log('✅ Endpoint existe');
    } catch (error) {
      console.log('📍 Status do endpoint:', error.response?.status);
      if (error.response?.status === 401) {
        console.log('✅ Endpoint existe mas requer autenticação (correto!)');
      } else if (error.response?.status === 400) {
        console.log('✅ Endpoint existe mas requer parâmetro email (correto!)');
      }
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testUserSearch();
