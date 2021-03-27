const settings = require('./settings');
const App = require('./lib/app');

const app = new App(settings);

app.init();
