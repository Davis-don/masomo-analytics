import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import classRoutes from './Routes/classroutes.js';


dotenv.config();


const app = express();
const port = process.env.port;

// ✅ Correct and complete CORS setup
app.use(cors({
   origin: '*', 
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  credentials: true,
  optionsSuccessStatus: 200,
}));


// app.options('*', cors());

app.use(express.json());

// Routes here
app.use('/api/class', classRoutes);




app.get("/", (_req, res) => {
  res.send("server running");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});