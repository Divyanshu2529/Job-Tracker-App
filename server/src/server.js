import express from 'express';
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";


const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());



app.get("/",(req, res)=>{
    res.json("Hi, How are you ?")
})

app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})