'use server';

/**
 * @fileOverview Optimizes delivery routes using AI, considering real-time traffic and weather conditions.
 *
 * - optimizeDeliveryRoute - A function that suggests the fastest delivery route.
 * - OptimizeDeliveryRouteInput - The input type for the optimizeDeliveryRoute function.
 * - OptimizeDeliveryRouteOutput - The return type for the optimizeDeliveryRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeDeliveryRouteInputSchema = z.object({
  origin: z.string().describe('The starting location for the delivery route.'),
  destination: z.string().describe('The final destination for the delivery route.'),
  waypoints: z.string().describe('A list of waypoints for the delivery route.'),
  currentTrafficConditions: z.string().describe('The current traffic conditions.'),
  currentweatherConditions: z.string().describe('The current weather conditions.'),
});
export type OptimizeDeliveryRouteInput = z.infer<typeof OptimizeDeliveryRouteInputSchema>;

const OptimizeDeliveryRouteOutputSchema = z.object({
  optimizedRoute: z.string().describe('The optimized delivery route.'),
  estimatedDeliveryTime: z.string().describe('The estimated delivery time for the optimized route.'),
  routeSummary: z.string().describe('A summary of the optimized route.'),
});
export type OptimizeDeliveryRouteOutput = z.infer<typeof OptimizeDeliveryRouteOutputSchema>;

export async function optimizeDeliveryRoute(input: OptimizeDeliveryRouteInput): Promise<OptimizeDeliveryRouteOutput> {
  return optimizeDeliveryRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeDeliveryRoutePrompt',
  input: {schema: OptimizeDeliveryRouteInputSchema},
  output: {schema: OptimizeDeliveryRouteOutputSchema},
  prompt: `You are an expert delivery route optimizer. Given the origin, destination, waypoints, current traffic conditions, and current weather conditions, provide the fastest and most efficient delivery route.

Origin: {{{origin}}}
Destination: {{{destination}}}
Waypoints: {{{waypoints}}}
Current Traffic Conditions: {{{currentTrafficConditions}}}
Current Weather Conditions: {{{currentweatherConditions}}}

Optimize the delivery route and provide an estimated delivery time, and a summary of the route.`,
});

const optimizeDeliveryRouteFlow = ai.defineFlow(
  {
    name: 'optimizeDeliveryRouteFlow',
    inputSchema: OptimizeDeliveryRouteInputSchema,
    outputSchema: OptimizeDeliveryRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
