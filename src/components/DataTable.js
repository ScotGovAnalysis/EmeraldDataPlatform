import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component'; // Importing DataTable from the library

// Renaming the custom component to avoid conflict
const CustomDataTable = ({ tableData }) => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (tableData) {
      // Process dimensions like vanilla UI does
      const processed = processJSONStat(tableData);
      setColumns(processed.columns);
      setData(processed.data);
    }
  }, [tableData]);

  const processJSONStat = (jsonstat) => {
    // Replicate vanilla UI's JSON-stat processing
    const dimensions = Object.keys(jsonstat.dimension);
    const size = jsonstat.size;

    const columns = dimensions.map(dim => ({
      name: jsonstat.dimension[dim].label,
      selector: row => row[dim],
      sortable: true
    }));

    // Add value column
    columns.push({
      name: 'Value',
      selector: row => row.value,
      sortable: true
    });

    // Generate data rows - replicate vanilla UI's value mapping
    const data = [];
    const valueIndex = 0; // Adjust based on dimension order

    jsonstat.value.forEach((value, index) => {
      const row = {};
      dimensions.forEach((dim, dimIndex) => {
        const position = jsonstat.dimension[dim].category.index[index % size[dimIndex]];
        row[dim] = jsonstat.dimension[dim].category.label[position];
      });
      row.value = value;
      data.push(row);
    });

    return { columns, data };
  };

  return (
    <div className="card rounded-0">
      <div className="card-body bg-default p-2">
        <DataTable
          columns={columns}
          data={data}
          pagination
          highlightOnHover
          responsive
          noHeader
          customStyles={{
            headCells: {
              style: {
                backgroundColor: '#f8f9fa',
                fontWeight: 'bold',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default CustomDataTable;
