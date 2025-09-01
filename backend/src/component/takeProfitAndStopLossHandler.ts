

import { PrismaClient } from "@prisma/client";
import { closeOrderService } from "../services/closeOrderService.js";
const prisma = new PrismaClient();
const response = await prisma.individualAsset.findMany({
    where: {
      OR: [
        { takeProfit: { not: null } },
        { stopLoss: { not: null } },
        { leverageStatus: true },
      ],
    },
  });
  const takeProfit: takeProfitObject[] = [];
  const stopLoss: stopLossObject[] = [];
  console.log(takeProfit, stopLoss);
  for (const userAsset of response as any) {
    const type = userAsset.type;
    if (userAsset.leverageStatus) {
      stopLoss.push({
        assetId: userAsset.id,
        userId: userAsset.userId,
        type: userAsset.type,
        stopLoss:
          type === "BUY"
            ? userAsset.cryptoValue - 500
            : userAsset.cryptoValue + 500,
        quantity: userAsset.quantity,
        assetValue: userAsset.cryptoValue,
        asset: userAsset.crypto,
      });
    }
    if (userAsset.takeProfit) {
      takeProfit.push({
        assetId: userAsset.id,
        userId: userAsset.userId,
        takeProfit: userAsset.takeProfit,
        type: userAsset.type,
        quantity: userAsset.quantity,
        assetValue: userAsset.USD,
        asset: userAsset.crypto,
      });
    }
    if (userAsset.stopLoss) {
      stopLoss.push({
        assetId: userAsset.id,
        userId: userAsset.userId,
        stopLoss: userAsset.stopLoss,
        type: userAsset.type,
        quantity: userAsset.quantity,
        assetValue: userAsset.USD,
        asset: userAsset.crypto,
      });
    }
  }
  


interface takeProfitObject {
    userId: number;
    takeProfit: number;
    type: "BUY" | "SELL";
    assetId: number;
    quantity: number;
    assetValue: number;
    asset: "BTC" | "SOL" | "ETH";
  }
  
  interface stopLossObject {
    userId: number;
    stopLoss: number;
    type: "BUY" | "SELL";
    assetId: number;
    quantity: number;
    assetValue: number;
    asset: "BTC" | "SOL" | "ETH";
  }

export async function takeProfitAndStopLossHandler(bidPrice: number, askPrice: number) {
    const triggeredOrders: Array<{
      userId: number;
      profile: takeProfitObject | stopLossObject;
      orderType: 'takeProfit' | 'stopLoss';
    }> = [];

    takeProfit.forEach((profile) => {
      if (bidPrice >= profile.takeProfit || askPrice <= profile.takeProfit) {
        triggeredOrders.push({ userId: profile.userId, profile, orderType: 'takeProfit' });
      }
    });
  
    stopLoss.forEach((profile) => {
      if (bidPrice <= profile.stopLoss || askPrice >= profile.stopLoss) {
        triggeredOrders.push({ userId: profile.userId, profile, orderType: 'stopLoss' });
      }
    });

    if (triggeredOrders.length === 0) return;

    const uniqueUserIds = [...new Set(triggeredOrders.map(order => order.userId))];
  
    try {
      const users = await prisma.user.findMany({
        where: { 
          id: { in: uniqueUserIds },
        },
        select: { id: true, email: true }
      });
  
      const userMap = new Map(users.map((user: any) => [user.id, user.email!]));
  
      const orderPromises = triggeredOrders.map(async (order) => {
        const email = userMap.get(order.userId);
        console.log("this is the email from the map", email);
        if (!email) {
          console.warn(`⚠️ User ${order.userId} not found - skipping ${order.orderType}`);
          return;
        }
  
        try {
          const assetObject = {
            email: email as string,
            quantity: order.profile.quantity,
            type: order.profile.type,
            cryptoValue: order.profile.assetValue,
            individualAssetId: order.profile.assetId,
            asset: order.profile.asset,
          };
  
          const closeOrderResponse = await closeOrderService(assetObject);
          console.log(`✅ ${order.orderType} processed for user ${order.userId}:`, closeOrderResponse);
          return { success: true, userId: order.userId };
        } catch (error) {
          console.error(`❌ Error processing ${order.orderType} for user ${order.userId}:`, error);
          return { success: false, userId: order.userId, error };
        }
      });

      const results = await Promise.allSettled(orderPromises);
      
      const successful = results.filter(r => 
        r.status === 'fulfilled' && r.value?.success === true
      ).length;
      
      console.log(`📊 Orders processed: ${successful}/${triggeredOrders.length} successful`);
  
    } catch (error) {
      console.error('❌ Critical error in order processing:', error);
    }
  }
  