import React, { useEffect , useState } from 'react';
import DataGrid from './DataGrid'

const parseCSV = (csvArray) => {
    if (!csvArray || csvArray.length === 0) 
        return { header: [], data: [] };

    const header = Object.keys(csvArray[0]); // Pega os nomes das colunas a partir do primeiro objeto
    const data = csvArray.map((row) => Object.values(row)); // Converte os objetos em arrays de valores 

    return { header, data };
};



function TableCsv({ data }) {
    const [csv, setCsv] = useState(null);

    useEffect(() => {
        if (data) {
            setCsv(parseCSV(data));
        }
    }, [data]); // Atualiza sempre que `data` mudar

    return (
        <div className="grid-container">
            {csv ? <DataGrid csv={csv} /> : <p>Carregando dados...</p>}
        </div>  
    );
}

export default TableCsv;

