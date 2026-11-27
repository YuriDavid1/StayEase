import { AxiosError } from "axios";

import api from "../infra/api";

/**
 * Replaces the HTTP layer of the shared axios instance. The interceptors still run, so the
 * tests exercise the real request/response handling without a server.
 *
 * `handler(config)` returns `{ status, data }`. Status >= 400 is rejected like axios does.
 * Every request config is recorded in `requests`.
 */
export function mockApi(handler) {
  const requests = [];
  const original = api.defaults.adapter;

  api.defaults.adapter = async (config) => {
    requests.push(config);
    const { status = 200, data = null } = (await handler(config)) ?? {};
    const response = { status, statusText: String(status), data, headers: {}, config, request: {} };

    if (status >= 400) {
      throw new AxiosError(`Request failed with status code ${status}`, "ERR_BAD_RESPONSE", config, {}, response);
    }
    return response;
  };

  return {
    requests,
    restore: () => {
      api.defaults.adapter = original;
    },
  };
}

export const SESSION_KEY = "stayease.session";

/** Stores a session the same way the app does after login. */
export function storeSession({ token = "token-de-teste", role = "Guest", email = "hospede@stayease.com", expiresInMs = 60_000 } = {}) {
  const session = {
    token,
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
    user: { id: 1, email, role },
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}
