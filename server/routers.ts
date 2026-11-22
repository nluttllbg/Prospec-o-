import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { calculateLeadScore, classifyWebsite } from "@shared/prospecting";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { makeRequest, type PlaceDetailsResult, type PlacesSearchResult } from "./_core/map";

const searchInput = z.object({
  niche: z.string().min(2).max(120),
  location: z.string().min(2).max(120),
  ratingMin: z.number().min(0).max(5).default(4),
  reviewsMin: z.number().min(0).max(100000).default(0),
  limit: z.number().int().min(1).max(20).default(10),
  withoutWebsite: z.boolean().default(false),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  prospecting: router({
    search: publicProcedure.input(searchInput).mutation(async ({ input }) => {
      const query = `${input.niche} em ${input.location}`;
      const search = await makeRequest<PlacesSearchResult>("/maps/api/place/textsearch/json", {
        query,
      });
      if (search.status !== "OK" && search.status !== "ZERO_RESULTS") {
        throw new Error(`Google Places retornou o status ${search.status}`);
      }
      const candidates = (search.results ?? []).slice(0, input.limit);
      const results = await Promise.all(candidates.map(async place => {
        let details: PlaceDetailsResult["result"] | null = null;
        try {
          const detailResponse = await makeRequest<PlaceDetailsResult>("/maps/api/place/details/json", {
            place_id: place.place_id,
            fields: "name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,opening_hours,geometry,type",
          });
          details = detailResponse.result ?? null;
        } catch (error) {
          console.warn("[Places] Failed to load details for", place.place_id, error);
        }
        const website = details?.website ?? null;
        const websiteStatus = classifyWebsite(website);
        const phone = details?.international_phone_number ?? details?.formatted_phone_number ?? null;
        const reviewCount = details?.user_ratings_total ?? place.user_ratings_total ?? 0;
        const rating = details?.rating ?? place.rating ?? null;
        return {
          id: place.place_id,
          placeId: place.place_id,
          name: details?.name ?? place.name,
          category: input.niche,
          address: details?.formatted_address ?? place.formatted_address,
          city: input.location,
          rating,
          reviewCount,
          phone,
          whatsapp: null,
          instagram: null,
          website,
          websiteStatus,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(place.place_id)}`,
          score: calculateLeadScore({ rating, reviewCount, websiteStatus, phone, category: input.niche }),
        };
      }));
      return results.filter(result => result.rating !== null && result.rating >= input.ratingMin && result.reviewCount >= input.reviewsMin && (!input.withoutWebsite || ["sem_site", "redes_sociais"].includes(result.websiteStatus)));
    }),
  }),
});

export type AppRouter = typeof appRouter;
