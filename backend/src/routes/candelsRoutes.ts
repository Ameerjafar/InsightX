import express from 'express';
import { candlesController } from '../controllers/candlesController.js';

const candleRoutes = express();


candleRoutes.post('/candles', candlesController);


export default candleRoutes;