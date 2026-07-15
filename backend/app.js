import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { sampleVenues } from './data/venues.js'
dotenv.config()
import router from './routes/venueRoutes.js' 


const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api/venues', router)  



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})  