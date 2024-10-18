import * as ReactDOMServer from 'react-dom/server';
import App from './App';

const html = ReactDOMServer.renderToString(<App />);
html;
