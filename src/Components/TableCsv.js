import React, { useEffect , useState } from 'react';
import DataGrid from './DataGrid'


const parseCSV = text => { 
    const result = {
        header: [], 
        data: [],
    }

    const [header, ...content] = text.split('\n'); 
    
    result.header = header.split(',');  
    
    const maxCols = result.header.length; 
    
    content.forEach(element => {
        result.data.push(element.split(',').slice(0, maxCols)); 
    });
    return result;
}


function TableCsv({data}) {
    const [csv, setCsv] = useState(null);
    
    useEffect(() => {
    fetch(data) 
    .then(r => r.text()) 
    .then((text) => { 
        setCsv(parseCSV(text)); 
    })
    }, []);
    return (
    <div className="App">
        <DataGrid csv={csv} />
    </div>
    );
}

export default TableCsv;
