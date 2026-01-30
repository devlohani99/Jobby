require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { handleErrors } = require('./middleware/handleErrors');

const signUpRoute = require('./routes/signUpRoute');
const signInRoute = require('./routes/signInRoute');
const logoutRoute = require('./routes/logoutRoute');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', signUpRoute);
app.use('/api/auth', signInRoute);
app.use('/api/auth', logoutRoute);

app.get('/', (req, res) => {
  res.json({ message: 'Jobby API is running' });
});

app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});