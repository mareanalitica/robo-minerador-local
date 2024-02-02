import type { NextApiRequest, NextApiResponse } from 'next';
import filter from '../../services/searchCD';
import { getPeriodsLastYear } from '../../utils/periods';
import details from '../../services/detailsCD';

export const config = {
    api: {
        responseLimit: false,
    },
}

async function fetchData(search, periods) {
    const cdata = [];

    await Promise.all(periods.map(async (month) => {
        for (let page = 1; page < 50; page++) {
            console.log(">> Página", page)
            console.table(month)
            console.log(">> ========")
            const response = await filter({
                ...search,
                range_query: {
                    ...search.range_query,
                    data_abertura: {
                        lte: month.endDate,
                        gte: month.startDate
                    }
                },
                page,
            });

            if (response.error !== null) {
                console.log("Erro ao minerar Página!", response.error.message);
            }

            if (response?.cnpj?.length > 0) {
                cdata.push(...response.cnpj);
            }
        }
    }));

    return cdata;
}

async function fetchCompanyDetails(cdata) {
    console.log(">>> Capturando detalhes...")
    if (cdata) {
        console.log(">> Quantidade de Itens: ", cdata.length)
    }
    const companyDetails = await Promise.all(cdata.map(async (company) => {
        const razaoLimpa = company.razao_social.replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
        return await details(company.cnpj, razaoLimpa);
    }));


    return companyDetails;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { atividade_principal, natureza_juridica } = req.body
        const periods = getPeriodsLastYear(2);

        const search = {
            "query": {
                "termo": [],
                "atividade_principal": atividade_principal,
                "natureza_juridica": natureza_juridica,
                "uf": [],
                "municipio": [],
                "bairro": [],
                "situacao_cadastral": "ATIVA",
                "cep": [],
                "ddd": []
            },
            "range_query": {
                "data_abertura": {
                    "lte": null,
                    "gte": null
                },
                "capital_social": {
                    "lte": null,
                    "gte": null
                }
            },
            "extras": {
                "somente_mei": false,
                "excluir_mei": false,
                "com_email": false,
                "incluir_atividade_secundaria": false,
                "com_contato_telefonico": false,
                "somente_fixo": false,
                "somente_celular": false,
                "somente_matriz": false,
                "somente_filial": false
            },
        };

        const cdata = await fetchData(search, periods);
        const companyDetails = await fetchCompanyDetails(cdata);

        res.status(200).json({ message: "Sucess", data: companyDetails });
    } catch (error) {
        console.error('Erro na requisição:', error);
        res.status(400).json({ message: 'Erro.' });
    }
}
