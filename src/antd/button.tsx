import * as ReactDOMServer from 'react-dom/server';
import { Button, Space, DatePicker, version } from 'antd';

const App = () => (
  <div style={{ padding: '0 24px' }}>
    <h1>antd version: {version}</h1>
    <Space>
      <DatePicker />
      <Button type="primary">Primary Button</Button>
    </Space>
  </div>
);

const html = ReactDOMServer.renderToString(<App />);
html;
