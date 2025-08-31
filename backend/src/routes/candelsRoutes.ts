import express from 'express';
import { interValInfo } from '../controllers/candlesController.js';

const candleRoutes = express();


candleRoutes.get('/', interValInfo);


export default candleRoutes;