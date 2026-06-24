/**
 * Services barrel — the API data layer.
 *
 * Each `<domain>.service.ts` exports pure functions that call the backend
 * through `@/lib/http`. Import them in query hooks, never call axios directly
 * from components.
 */
export * from "./bookings.service";
