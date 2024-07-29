const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use('/discussions', routes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Discussion service running on port ${PORT}`);
});
