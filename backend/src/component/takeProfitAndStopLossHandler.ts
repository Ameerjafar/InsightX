

import { closeOrderService } from "../services/closeOrderService.js";
import { prisma } from "../lib/prisma.js";

let assetCache: {
  takeProfit: Array<{
    userId: number;
    takeProfit: number;
    type: "BUY" | "SELL";
    assetId: number;
    quantity: number;
    assetValue: number;
    asset: "BTC" | "SOL" | "ETH";
  }>;
  stopLoss: Array<{
    userId: number;
    stopLoss: number;
    type: "BUY" | "SELL";
    assetId: number;
    quantity: number;
    assetValue: number;
    asset: "BTC" | "SOL" | "ETH";
  }>;
  lastUpdated: number;
} = {
  takeProfit: [],
  stopLoss: [],
  lastUpdated: 0,
};

const CACHE_DURATION = 30 * 1000;

async function refreshAssetCache() {
  try {
    const now = Date.now();
    if (now - assetCache.lastUpdated < CACHE_DURATION) {
      return; 
    }

    console.log("🔄 Refreshing asset cache...");
    
    const response = await prisma.individualAsset.findMany({
      where: {
        OR: [
          { takeProfit: { not: null } },
          { stopLoss: { not: null } },
          { leverageStatus: true },
        ],
      },
      select: {
        id: true,
        userId: true,
        type: true,
        takeProfit: true,
        stopLoss: true,
        quantity: true,
        cryptoValue: true,
        crypto: true,
        leverageStatus: true,
      },
    });

    const takeProfit: typeof assetCache.takeProfit = [];
    const stopLoss: typeof assetCache.stopLoss = [];

    for (const userAsset of response) {
      if (userAsset.leverageStatus) {
        const dynamicStopLoss = userAsset.type === "BUY" 
          ? userAsset.cryptoValue * 0.95 
          : userAsset.cryptoValue * 1.05; 
        
        stopLoss.push({
          assetId: userAsset.id,
          userId: userAsset.userId,
          type: userAsset.type,
          stopLoss: dynamicStopLoss,
          quantity: userAsset.quantity,
          assetValue: userAsset.cryptoValue,
          asset: userAsset.crypto as "BTC" | "SOL" | "ETH",
        });
      }

      if (userAsset.takeProfit) {
        takeProfit.push({
          assetId: userAsset.id,
          userId: userAsset.userId,
          takeProfit: userAsset.takeProfit,
          type: userAsset.type,
          quantity: userAsset.quantity,
          assetValue: userAsset.cryptoValue,
          asset: userAsset.crypto as "BTC" | "SOL" | "ETH",
        });
      }

      if (userAsset.stopLoss) {
        stopLoss.push({
          assetId: userAsset.id,
          userId: userAsset.userId,
          stopLoss: userAsset.stopLoss,
          type: userAsset.type,
          quantity: userAsset.quantity,
          assetValue: userAsset.cryptoValue,
          asset: userAsset.crypto as "BTC" | "SOL" | "ETH",
        });
      }
    }

    assetCache = {
      takeProfit,
      stopLoss,
      lastUpdated: now,
    };

    console.log(`✅ Cache refreshed: ${takeProfit.length} take profit, ${stopLoss.length} stop loss orders`);
  } catch (error) {
    console.error("❌ Error refreshing asset cache:", error);
  }
}

export async function takeProfitAndStopLossHandler(bidPrice: number, askPrice: number) {
  try {

    await refreshAssetCache();

    const triggeredOrders: Array<{
      userId: number;
      profile: typeof assetCache.takeProfit[0] | typeof assetCache.stopLoss[0];
      orderType: 'takeProfit' | 'stopLoss';
    }> = [];
    assetCache.takeProfit.forEach((profile) => {
      if (profile.type === "BUY" && bidPrice >= profile.takeProfit) {
        triggeredOrders.push({ userId: profile.userId, profile, orderType: 'takeProfit' });
      } else if (profile.type === "SELL" && askPrice <= profile.takeProfit) {
        triggeredOrders.push({ userId: profile.userId, profile, orderType: 'takeProfit' });
      }
    });
    assetCache.stopLoss.forEach((profile) => {
      if (profile.type === "BUY" && bidPrice <= profile.stopLoss) {
        triggeredOrders.push({ userId: profile.userId, profile, orderType: 'stopLoss' });
      } else if (profile.type === "SELL" && askPrice >= profile.stopLoss) {
        triggeredOrders.push({ userId: profile.userId, profile, orderType: 'stopLoss' });
      }
    });

    if (triggeredOrders.length === 0) return;

    console.log(`🚨 ${triggeredOrders.length} orders triggered: ${triggeredOrders.map(o => o.orderType).join(', ')}`);
    const uniqueUserIds = [...new Set(triggeredOrders.map(order => order.userId))];

    const users = await prisma.user.findMany({
      where: { 
        id: { in: uniqueUserIds },
      },
      select: { id: true, email: true }
    });

    const userMap = new Map(users.map((user) => [user.id, user.email!]));
    const batchSize = 5; 
    for (let i = 0; i < triggeredOrders.length; i += batchSize) {
      const batch = triggeredOrders.slice(i, i + batchSize);
      
      const orderPromises = batch.map(async (order) => {
        const email = userMap.get(order.userId);
        if (!email) {
          console.warn(`⚠️ User ${order.userId} not found - skipping ${order.orderType}`);
          return { success: false, userId: order.userId, error: 'User not found' };
        }

        try {
          const assetObject = {
            email: email,
            quantity: order.profile.quantity,
            type: order.profile.type,
            cryptoValue: order.profile.assetValue,
            individualAssetId: order.profile.assetId,
            asset: order.profile.asset,
          };

          const closeOrderResponse = await closeOrderService(assetObject);
          console.log(`✅ ${order.orderType} processed for user ${order.userId}:`, closeOrderResponse);
          
          // Remove processed order from cache to prevent reprocessing
          if (order.orderType === 'takeProfit') {
            assetCache.takeProfit = assetCache.takeProfit.filter(p => p.assetId !== order.profile.assetId);
          } else {
            assetCache.stopLoss = assetCache.stopLoss.filter(p => p.assetId !== order.profile.assetId);
          }
          
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
      
      console.log(`📊 Batch processed: ${successful}/${batch.length} successful`);
      
      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < triggeredOrders.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

  } catch (error) {
    console.error('❌ Critical error in order processing:', error);
  }
}

export async function cleanup() {
  await prisma.$disconnect();
}
  