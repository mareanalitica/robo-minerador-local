import axios from 'axios';
import { load } from 'cheerio';

function convertToJSON(cssSelector: any, elements: any) {
    const result: any = {};

    for (let i = 0; i < elements.length; i++) {
        const element = cssSelector(elements[i]);
        const keyElement = element.children('.has-text-weight-bold');
        const valueElements = element.children().slice(1);

        const key = keyElement.text().trim();
        const values = valueElements
            .map((index: any, el: any) => cssSelector(el).text().trim())
            .get();
        if (values.length === 1) {
            result[key] = values[0];
        } else {
            result[key] = values;
        }
    }

    return result;
}
function convertPhoneNumbers(phones: any) {
    if (Array.isArray(phones)) {
        return phones.map((phone) => parseInt(phone.replace(/\D/g, ''), 10));
    } else if (typeof phones === 'string') {
        return [parseInt(phones.replace(/\D/g, ''), 10)];
    }
    return [];
}
async function details(taxId: string, companyName: string) {
    try {
        // Construct the URL using template literals
        const url = `https://casadosdados.com.br/solucao/cnpj/${encodeURIComponent(companyName)}-${encodeURIComponent(taxId)}`;

        // Make the HTTP request using Axios
        const response = await axios.post(url, null, {
            headers: {
                'User-Agent': `marehub/1.0`,
            },
        });

        // Handle the response data accordingly
        if (response.data !== null) {
            const detailsData = await response.data;
            const multiCssSelector = load(detailsData);
            const narrowElements = multiCssSelector('.is-narrow');

            const jsonResult = convertToJSON(multiCssSelector, narrowElements);
            const dados = {
                razao: jsonResult['Razão Social'],
                cnpj: jsonResult.CNPJ,
                phones: convertPhoneNumbers(jsonResult.Telefone),
                email: jsonResult['E-MAIL'] == undefined ? '' : jsonResult['E-MAIL'],
                raw: jsonResult
            };
            console.log("Dado filtrado", dados.razao, "Telefone", dados.phones)
            return dados
        }
        return []
    } catch (error) {
        console.log(error)
        return []
    }
}

export default details;
