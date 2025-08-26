import { Request, Response } from "express";
export declare const openOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const closeOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const balanceController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const allOrders: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=ordersController.d.ts.map