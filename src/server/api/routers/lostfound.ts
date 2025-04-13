import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { lostFoundItems, userAddresses } from "~/server/db/schema";
import { sql } from "@vercel/postgres";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

// Define the Earth's radius in kilometers
const EARTH_RADIUS_KM = 6371;

export const lostFoundRouter = createTRPCRouter({
  // Create a lost/found item
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["lost", "found"]),
        title: z.string().min(3).max(100),
        description: z.string(),
        category: z.string().optional(),
        location: z.string(),
        latitude: z.string(),
        longitude: z.string(),
        imageUrl: z.string().optional(),
        contactMethod: z.enum(["platform", "custom"]),
        contactInfo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new Error("You must be logged in to create a listing");
      }

      return await ctx.db.insert(lostFoundItems).values({
        type: input.type,
        title: input.title,
        description: input.description,
        category: input.category,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        imageUrl: input.imageUrl,
        contactMethod: input.contactMethod,
        contactInfo: input.contactInfo,
        status: "active",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        date: new Date(),
      });
    }),

  // Get nearby lost & found items
  getNearbyItems: publicProcedure
    .input(
      z.object({
        latitude: z.string(),
        longitude: z.string(),
        maxDistance: z.number().optional(), // Optional distance filter
        useRegisteredAddress: z.boolean().optional(),
        type: z.enum(["all", "lost", "found"]).optional(), // Filter by type
        category: z.string().optional(), // Filter by category
      })
    )
    .query(async ({ ctx, input }) => {
      // Get coordinates either from input or from registered address
      let lat = parseFloat(input.latitude);
      let lon = parseFloat(input.longitude);
      const radiusInKm = input.maxDistance || 1.5; // Default to 1.5 kilometer radius
      const currentUserId = ctx.auth?.userId ?? null;
      const itemType = input.type || "all";

      try {
        if (input.useRegisteredAddress && currentUserId) {
          const registeredAddress = await ctx.db.query.userAddresses.findFirst({
            where: eq(userAddresses.userId, currentUserId),
          });

          if (registeredAddress) {
            lat = parseFloat(registeredAddress.latitude);
            lon = parseFloat(registeredAddress.longitude);
          }
        }

        // Handle case where coordinates might not be valid numbers
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error("Invalid coordinates");
        }

        // Build the base query without filters
        let baseQuery = `
          SELECT * FROM (
            SELECT *, (
              ${EARTH_RADIUS_KM} * acos(
                LEAST(1.0, cos(radians(${lat})) * cos(radians(latitude::numeric)) * 
                cos(radians(longitude::numeric) - radians(${lon})) + 
                sin(radians(${lat})) * sin(radians(latitude::numeric)))
              )
            ) AS distance
            FROM lost_found_items
            WHERE status = 'active'
        `;

        // Apply type filter
        if (itemType === "lost") {
          baseQuery += ` AND type = 'lost'`;
        } else if (itemType === "found") {
          baseQuery += ` AND type = 'found'`;
        }

        // Apply category filter
        if (input.category) {
          baseQuery += ` AND category = '${input.category}'`;
        }

        // Complete the query
        baseQuery += `
          ) AS items_with_distance
          WHERE distance < ${radiusInKm}
          ORDER BY distance ASC;
        `;

        // Execute the query
        const nearbyItems = await sql.query(baseQuery);

        return nearbyItems ?? [];
      } catch (error) {
        console.error("Error fetching nearby items:", error);
        return { rows: [] };
      }
    }),

  // Get a single lost/found item by ID
  getById: publicProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const item = await ctx.db.query.lostFoundItems.findFirst({
          where: eq(lostFoundItems.id, parseInt(input.itemId)),
        });
        
        if (!item) {
          throw new Error("Item not found");
        }

        // Get user info for the item creator
        let creator = null;
        if (item.userId) {
          try {
            creator = await clerkClient.users.getUser(item.userId);
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        }
        
        // Calculate distance if current user's location is available
        let distance = undefined;
        const currentUserId = ctx.auth?.userId ?? null;
        
        if (currentUserId && item.latitude && item.longitude) {
          // If user is logged in, try to calculate distance
          const userAddress = await ctx.db.query.userAddresses.findFirst({
            where: eq(userAddresses.userId, currentUserId),
          });
          
          if (userAddress?.latitude && userAddress?.longitude) {
            // Use Haversine formula to calculate distance
            const userLat = parseFloat(userAddress.latitude);
            const userLon = parseFloat(userAddress.longitude);
            const itemLat = parseFloat(item.latitude);
            const itemLon = parseFloat(item.longitude);
            
            // Calculate distance 
            const result = await sql`
              SELECT (
                ${6371} * acos(
                  LEAST(1.0, cos(radians(${userLat})) * cos(radians(${itemLat})) * 
                  cos(radians(${itemLon}) - radians(${userLon})) + 
                  sin(radians(${userLat})) * sin(radians(${itemLat})))
                )
              ) AS distance;
            `;
            
            if (result.rows.length > 0) {
              distance = parseFloat(result.rows[0].distance);
            }
          }
        }
        
        return {
          ...item,
          distance,
          creatorName: creator ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() : "Anonymous User",
          creatorImage: creator?.imageUrl || null,
        };
      } catch (error) {
        console.error("Error fetching item:", error);
        throw new Error("Failed to fetch item");
      }
    }),

  // Update the status of an item (mark as resolved/active/expired)
  updateStatus: protectedProcedure
    .input(
      z.object({
        itemId: z.number(),
        status: z.enum(["active", "resolved", "expired"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new Error("You must be logged in to update an item");
      }

      // Check if the user owns the item
      const item = await ctx.db.query.lostFoundItems.findFirst({
        where: eq(lostFoundItems.id, input.itemId),
      });

      if (!item) {
        throw new Error("Item not found");
      }

      if (item.userId !== userId) {
        throw new Error("You can only update your own listings");
      }

      return await ctx.db
        .update(lostFoundItems)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(lostFoundItems.id, input.itemId));
    }),

  // Get user's own lost and found items
  getUserItems: protectedProcedure
    .input(
      z.object({
        type: z.enum(["all", "lost", "found"]).optional(),
        status: z.enum(["all", "active", "resolved", "expired"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new Error("You must be logged in to view your items");
      }

      let items;

      if (input.type === "all" && input.status === "all") {
        items = await ctx.db.query.lostFoundItems.findMany({
          where: eq(lostFoundItems.userId, userId),
          orderBy: (items, { desc }) => [desc(items.createdAt)],
        });
      } else if (input.type === "all") {
        items = await ctx.db.query.lostFoundItems.findMany({
          where: (items, { eq, and }) => 
            and(eq(items.userId, userId), eq(items.status, input.status || "active")),
          orderBy: (items, { desc }) => [desc(items.createdAt)],
        });
      } else if (input.status === "all") {
        items = await ctx.db.query.lostFoundItems.findMany({
          where: (items, { eq, and }) => 
            and(eq(items.userId, userId), eq(items.type, input.type || "lost")),
          orderBy: (items, { desc }) => [desc(items.createdAt)],
        });
      } else {
        items = await ctx.db.query.lostFoundItems.findMany({
          where: (items, { eq, and }) => 
            and(
              eq(items.userId, userId), 
              eq(items.type, input.type || "lost"),
              eq(items.status, input.status || "active")
            ),
          orderBy: (items, { desc }) => [desc(items.createdAt)],
        });
      }

      return items;
    }),

  // Get item categories (for filtering)
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await sql`
      SELECT DISTINCT category FROM lost_found_items 
      WHERE category IS NOT NULL 
      ORDER BY category ASC;
    `;
    
    return categories?.rows.map(row => row.category) || [];
  }),
});