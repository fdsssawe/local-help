import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { userAddresses } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Define the Earth's radius in kilometers
const EARTH_RADIUS_KM = 6371;

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = EARTH_RADIUS_KM * c;
  
  return distance; // Distance in kilometers
}

// Maximum allowed distance for verification (100 meters)
const MAX_VERIFICATION_DISTANCE_KM = 1.5;

export const addressRouter = createTRPCRouter({
  // Set user's home address
  setAddress: protectedProcedure
    .input(
      z.object({
        address: z.string(),
        latitude: z.string(),
        longitude: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already has an address
      const existingAddress = await ctx.db.query.userAddresses.findFirst({
        where: eq(userAddresses.userId, ctx.auth?.userId ?? ""),
      });

      if (existingAddress) {
        // Update existing address
        return await ctx.db
          .update(userAddresses)
          .set({
            address: input.address,
            latitude: input.latitude,
            longitude: input.longitude,
            updatedAt: new Date(),
            // Reset verification when address is changed
            verified: false,
          })
          .where(eq(userAddresses.userId, ctx.auth?.userId ?? ""));
      } else {
        // Create new address
        return await ctx.db.insert(userAddresses).values({
          userId: ctx.auth?.userId ?? "",
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          verified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }),

  // Get user's registered address
  getUserAddress: protectedProcedure.query(async ({ ctx }) => {
    const address = await ctx.db.query.userAddresses.findFirst({
      where: eq(userAddresses.userId, ctx.auth?.userId ?? ""),
    });
    return address ?? null;
  }),

  // Verify address based on current location
  verifyAddress: protectedProcedure
    .input(
      z.object({
        currentLatitude: z.string(),
        currentLongitude: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "You must be logged in to verify your address" 
        });
      }

      // Find user's registered address
      const userAddress = await ctx.db.query.userAddresses.findFirst({
        where: eq(userAddresses.userId, userId),
      });

      if (!userAddress) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "No registered address found. Please set your address first." 
        });
      }

      if (userAddress.verified) {
        return { 
          success: true, 
          message: "Your address is already verified." 
        };
      }

      // Parse coordinates
      const registeredLat = parseFloat(userAddress.latitude);
      const registeredLng = parseFloat(userAddress.longitude);
      const currentLat = parseFloat(input.currentLatitude);
      const currentLng = parseFloat(input.currentLongitude);

      // Calculate distance between current location and registered address
      const distanceKm = calculateDistance(
        currentLat, currentLng, 
        registeredLat, registeredLng
      );

      // Check if user is close enough to their registered address
      if (distanceKm <= MAX_VERIFICATION_DISTANCE_KM) {
        // User is at their registered address, mark as verified
        await ctx.db
          .update(userAddresses)
          .set({ verified: true })
          .where(eq(userAddresses.userId, userId));

        return { 
          success: true, 
          message: "Address successfully verified!" 
        };
      } else {
        // User is not at their registered address
        const distanceMeters = Math.round(distanceKm * 1000);
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Verification failed. You appear to be ${distanceMeters} meters away from your registered address.` 
        });
      }
    }),
});
