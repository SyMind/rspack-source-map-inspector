import * as ReactDOMServer from 'react-dom/server';
import App from './App';

const html = await ReactDOMServer.renderToString(<App />);
html;
