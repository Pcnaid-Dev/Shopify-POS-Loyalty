import { db } from "../db.server";

// Add a ProgramSetting model to the Prisma schema
export async function createProgramSettingModel() {
  try {
    // Check if the model already exists in the schema
    const tableExists = await db.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='ProgramSetting'
    `;
    
    if (Array.isArray(tableExists) && tableExists.length === 0) {
      // Create the table if it doesn't exist
      await db.$executeRaw`
        CREATE TABLE "ProgramSetting" (
          "shopId" TEXT NOT NULL PRIMARY KEY,
          "pointsPerDollar" REAL NOT NULL DEFAULT 10,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
        )
      `;
      console.log("ProgramSetting table created successfully");
    } else {
      console.log("ProgramSetting table already exists");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error creating ProgramSetting model:", error);
    return { success: false, error };
  }
}

// Seed the database with test data
export async function seedTestData() {
  try {
    // Create a test customer points record
    const testCustomerId = "1234567890";
    await db.customerPoints.upsert({
      where: { customerId: testCustomerId },
      update: { pointsBalance: 500 },
      create: {
        customerId: testCustomerId,
        pointsBalance: 500
      }
    });
    
    // Create some test reward rules
    const testRewards = [
      {
        name: "$5 Off",
        pointsRequired: 100,
        discountType: "FIXED_AMOUNT",
        discountValue: 5,
        isActive: true
      },
      {
        name: "10% Off",
        pointsRequired: 200,
        discountType: "PERCENTAGE",
        discountValue: 10,
        isActive: true
      },
      {
        name: "$20 Off",
        pointsRequired: 400,
        discountType: "FIXED_AMOUNT",
        discountValue: 20,
        isActive: true
      }
    ];
    
    for (const reward of testRewards) {
      await db.rewardRule.create({
        data: reward
      });
    }
    
    // Create a test program setting
    await db.programSetting.upsert({
      where: { shopId: "test-shop.myshopify.com" },
      update: { pointsPerDollar: 10 },
      create: {
        shopId: "test-shop.myshopify.com",
        pointsPerDollar: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return { 
      success: true, 
      message: "Test data seeded successfully",
      testCustomerId
    };
  } catch (error) {
    console.error("Error seeding test data:", error);
    return { success: false, error };
  }
}
