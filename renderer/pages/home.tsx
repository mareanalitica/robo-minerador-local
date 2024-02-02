import React, { useState } from 'react';
import Head from 'next/head';
import filter from '../services/searchCD';

export default function HomePage() {
  const [atividade, setAtividades] = useState('');
  const [natureza, setNatureza] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true); // Ativando o estado de loading

      const response = await fetch('/api/filterCompanys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          atividade_principal: atividade === '' ? [] : atividade.split(','),
          natureza_juridica: natureza === '' ? [] : natureza.split(','),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.data);
      } else {
        console.error('Erro na requisição:', response.statusText);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = results.map(result => `${result.cnpj},${result.phones},${result.email}`).join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'dados.csv';
    link.click();
    setResults([]);
  };

  return (
    <React.Fragment>
      <Head>
        <title>Pesquisa</title>
      </Head>
      <div className="grid grid-col-1 p-10 text-2xl w-full text-center">
        <label htmlFor="atividades">Atividade Principal ( CNAE )</label>
        <input
          className="text-gray-950"
          id="atividades"
          type="text"
          value={atividade}
          onChange={(e) => setAtividades(e.target.value)}
        />
        <br />
        <label htmlFor="natureza">Natureza Juridica</label>
        <input
          id="natureza"
          className="text-gray-950"
          type="text"
          value={natureza}
          onChange={(e) => setNatureza(e.target.value)}
        />
      </div>
      <div className="mt-1 w-full mb-5 flex-wrap flex justify-center">
        {!loading && <button onClick={handleSubmit}>Pesquisar!</button>}
      </div>
      <div className="mt-1 w-full flex-wrap flex justify-center">
        {loading && <p>Carregando...</p>}
        {results && results.length > 0 && !loading && (
          <>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <button className='ml-2' onClick={exportToCSV}>Exportar!</button>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Razão Social
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Telefone
                    </th>
                    <th scope="col" className="px-6 py-3">
                      E-MAIL
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'even:bg-gray-50 even:dark:bg-gray-800' : 'odd:bg-white odd:dark:bg-gray-900 border-b dark:border-gray-700'}>
                      <td className="px-6 py-4">
                        {result.cnpj}
                      </td>
                      <td className="px-6 py-4">
                        {result.phones}
                      </td>
                      <td className="px-6 py-4">
                        {result.email}
                      </td>
                      <td className="px-6 py-4">
                        <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Detalhes</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </React.Fragment >
  );
}
