import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// --- Sales Endpoints ---
export const getSales = query({
  args: {
    customerId: v.optional(v.string()),
    employeeId: v.optional(v.string()),
    carId: v.optional(v.number()),
    dealershipId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let sales = await ctx.db.query("sales").collect();

    if (args.customerId !== undefined) {
      sales = sales.filter(s => s.customerId === args.customerId);
    }
    if (args.employeeId !== undefined) {
      sales = sales.filter(s => s.employeeId === args.employeeId);
    }
    if (args.carId !== undefined) {
      sales = sales.filter(s => s.carId === args.carId);
    }
    if (args.dealershipId !== undefined) {
      sales = sales.filter(s => s.dealershipId === args.dealershipId);
    }

    const salesWithRelations = [];
    for (const sale of sales) {
      const car = await ctx.db
        .query("cars")
        .withIndex("by_numeric_id", q => q.eq("id", sale.carId))
        .first();
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_cognitoId", q => q.eq("cognitoId", sale.customerId))
        .first();
      const employee = await ctx.db
        .query("employees")
        .withIndex("by_cognitoId", q => q.eq("cognitoId", sale.employeeId))
        .first();
      const dealership = await ctx.db
        .query("dealerships")
        .withIndex("by_numeric_id", q => q.eq("id", sale.dealershipId))
        .first();

      salesWithRelations.push({
        ...sale,
        car,
        customer,
        employee,
        dealership,
      });
    }

    return salesWithRelations;
  },
});

export const createSale = mutation({
  args: {
    salePrice: v.number(),
    downPayment: v.number(),
    tradeInValue: v.number(),
    carId: v.number(),
    customerId: v.string(),
    employeeId: v.string(),
    dealershipId: v.number(),
    financingId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Generate simple auto-increment ID
    const lastSale = await ctx.db.query("sales").order("desc").first();
    const nextId = lastSale ? lastSale.id + 1 : 1;

    // Check if car exists and is available
    const car = await ctx.db
      .query("cars")
      .withIndex("by_numeric_id", q => q.eq("id", args.carId))
      .first();
    if (!car) throw new Error("Car not found");

    // Update car status to SOLD
    await ctx.db.patch(car._id, { status: "SOLD" });

    const saleId = await ctx.db.insert("sales", {
      id: nextId,
      salePrice: args.salePrice,
      downPayment: args.downPayment,
      tradeInValue: args.tradeInValue,
      saleDate: new Date().toISOString(),
      carId: args.carId,
      customerId: args.customerId,
      employeeId: args.employeeId,
      dealershipId: args.dealershipId,
      financingId: args.financingId || null,
    });

    return await ctx.db.get(saleId);
  },
});

// --- Test Drives ---
export const getTestDrives = query({
  args: {},
  handler: async (ctx) => {
    const testDrives = await ctx.db.query("testDrives").collect();
    
    const withRelations = [];
    for (const td of testDrives) {
      const car = await ctx.db
        .query("cars")
        .withIndex("by_numeric_id", q => q.eq("id", td.carId))
        .first();
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_cognitoId", q => q.eq("cognitoId", td.customerId))
        .first();
      const dealership = await ctx.db
        .query("dealerships")
        .withIndex("by_numeric_id", q => q.eq("id", td.dealershipId))
        .first();
      const employee = td.employeeId 
        ? await ctx.db
            .query("employees")
            .withIndex("by_cognitoId", q => q.eq("cognitoId", td.employeeId!))
            .first()
        : null;

      withRelations.push({
        ...td,
        car,
        customer,
        dealership,
        employee,
      });
    }
    return withRelations;
  },
});

export const createTestDrive = mutation({
  args: {
    carId: v.number(),
    customerId: v.string(),
    scheduledDate: v.string(),
    dealershipId: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lastTd = await ctx.db.query("testDrives").order("desc").first();
    const nextId = lastTd ? lastTd.id + 1 : 1;

    // Pick first available employee or null
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_dealershipId", q => q.eq("dealershipId", args.dealershipId))
      .collect();
    const employeeId = employees.length > 0 ? employees[0].cognitoId : null;

    const tdId = await ctx.db.insert("testDrives", {
      id: nextId,
      scheduledDate: args.scheduledDate,
      actualDate: null,
      duration: null,
      notes: args.notes || null,
      completed: false,
      carId: args.carId,
      customerId: args.customerId,
      employeeId,
      dealershipId: args.dealershipId,
      createdAt: new Date().toISOString(),
    });

    return await ctx.db.get(tdId);
  },
});

// --- Inquiries ---
export const getInquiries = query({
  args: {
    customerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let inquiries = await ctx.db.query("inquiries").collect();
    
    if (args.customerId !== undefined) {
      inquiries = inquiries.filter(i => i.customerId === args.customerId);
    }

    const withRelations = [];
    for (const inq of inquiries) {
      const car = await ctx.db
        .query("cars")
        .withIndex("by_numeric_id", q => q.eq("id", inq.carId))
        .first();
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_cognitoId", q => q.eq("cognitoId", inq.customerId))
        .first();
      const dealership = await ctx.db
        .query("dealerships")
        .withIndex("by_numeric_id", q => q.eq("id", inq.dealershipId))
        .first();
      const employee = inq.employeeId
        ? await ctx.db
            .query("employees")
            .withIndex("by_cognitoId", q => q.eq("cognitoId", inq.employeeId!))
            .first()
        : null;

      withRelations.push({
        ...inq,
        car,
        customer,
        dealership,
        employee,
      });
    }

    return withRelations;
  },
});

export const getInquiry = query({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inquiries")
      .withIndex("by_numeric_id", q => q.eq("id", args.id))
      .first();
  },
});

export const createInquiry = mutation({
  args: {
    message: v.string(),
    carId: v.number(),
    customerId: v.string(),
    dealershipId: v.number(),
    employeeId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const lastInq = await ctx.db.query("inquiries").order("desc").first();
    const nextId = lastInq ? lastInq.id + 1 : 1;

    const inqId = await ctx.db.insert("inquiries", {
      id: nextId,
      message: args.message,
      status: "NEW",
      inquiryDate: new Date().toISOString(),
      followUpDate: null,
      carId: args.carId,
      customerId: args.customerId,
      dealershipId: args.dealershipId,
      employeeId: args.employeeId || null,
    });

    return await ctx.db.get(inqId);
  },
});

export const updateInquiry = mutation({
  args: {
    id: v.number(),
    status: v.optional(v.string()),
    followUpDate: v.optional(v.union(v.string(), v.null())),
    employeeId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const inq = await ctx.db
      .query("inquiries")
      .withIndex("by_numeric_id", q => q.eq("id", args.id))
      .first();
    if (!inq) throw new Error("Inquiry not found");

    const patch: any = {};
    if (args.status !== undefined) patch.status = args.status;
    if (args.followUpDate !== undefined) patch.followUpDate = args.followUpDate;
    if (args.employeeId !== undefined) patch.employeeId = args.employeeId;

    await ctx.db.patch(inq._id, patch);
    return await ctx.db.get(inq._id);
  },
});

export const deleteInquiry = mutation({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    const inq = await ctx.db
      .query("inquiries")
      .withIndex("by_numeric_id", q => q.eq("id", args.id))
      .first();
    if (!inq) throw new Error("Inquiry not found");

    await ctx.db.delete(inq._id);
    return { success: true };
  },
});
