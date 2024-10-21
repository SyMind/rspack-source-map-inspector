import * as ReactDOMServer from 'react-dom/server';
import MaterialTable from "@material-table/core";

function MyTable() {
  return (
    <MaterialTable
      title="Simple Table"
      columns={[
        { title: "Name", field: "name" },
        { title: "Age", field: "age", type: "numeric" },
      ]}
      data={[
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ]}
      options={{
        sorting: true,
        filtering: true,
      }}
    />
  );
}

const html = ReactDOMServer.renderToString(<MyTable />);
html;
