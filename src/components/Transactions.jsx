import React from 'react';
import DataTable from './DataTable';

const Transactions = ({ data, showAmount, config }) => {
    // Extract dynamic columns if they exist
    const dynamicColumns = config?.tables?.transactions?.columns;

    return (
        <div>
            <DataTable
                data={data}
                showAmount={showAmount}
                columns={dynamicColumns}
            />
        </div>
    );
};

export default Transactions;
