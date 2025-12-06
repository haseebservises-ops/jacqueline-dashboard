import React from 'react';
import DataTable from './DataTable';

const Transactions = ({ data, showAmount }) => {
    return (
        <div>
            <DataTable data={data} showAmount={showAmount} />
        </div>
    );
};

export default Transactions;
