import "@testing-library/jest-dom/vitest";
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./server";
import { queryClient } from "../../src/api/queryClient";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
});

afterAll(() => server.close());
