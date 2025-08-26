import express from 'express';
import { openOrder, closeOrder } from '../controllers/ordersController.js';

const orderRoutes = express();

orderRoutes.post('/openOrder', openOrder);
orderRoutes.post('/closeOrder', closeOrder);

export default orderRoutes;