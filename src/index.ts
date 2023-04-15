import express from 'express';
import userRoutes from './api/routes/user.routes';
const app = express();

app.use(express.json());

const port = 3000
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

userRoutes(app)
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

