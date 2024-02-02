import axios from 'axios';

async function filter(filter) {
    try {
        const response = await axios.post(
            'https://api.casadosdados.com.br/v2/public/cnpj/search',
            filter,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'marehub/1.0',
                },
            }
        );
        const { count, cnpj } = response.data.data;
        return { count, cnpj, error: null };
    } catch (error) {
        return {
            count: 0,
            cnpj: [],
            error: {
                message: error.message,
                code: error.response?.status || 500,
            },
        };
    }
}

export default filter;
