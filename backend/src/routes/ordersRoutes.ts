import express from 'express';
import { openOrder, closeOrder, allOrders, balanceController } from '../controllers/ordersController.js';

const orderRoutes = express();

orderRoutes.post('/openOrder', openOrder);
orderRoutes.post('/closeOrder', closeOrder);
orderRoutes.get('/allOrders', allOrders);
orderRoutes.get('/balance', balanceController);

export default orderRoutes;