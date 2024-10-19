import * as ReactDOMServer from 'react-dom/server';
import App from './App';
import './sentry';

const html = ReactDOMServer.renderToString(<App />);
html;
