import { Elysia } from "elysia";

/**
 * User route for retrieving the current user's information.
 * Needs to be combined at the `app/api/[[...route]]/route.ts` file.
 * Represents RPC client types based on input & output.
 */
export const userRoute = new Elysia({
  prefix: "/user",
});
