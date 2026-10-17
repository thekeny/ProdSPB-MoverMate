import type { CreateClientConfig } from "@/api/generated/client.gen";
import { getAccessToken } from "@/api/session";
import { API } from "@/configs/consts/api.const";
import { isConnected } from "@/lib/connectivity";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: "",
  auth: () => getAccessToken(),
  timeout: API.TIMEOUT,
  retry: {
    limit: API.LIMIT,
    methods: API.METHODS,
    statusCodes: API.STATUS_CODES,
    shouldRetry: ({ error }) => {
      if (
        !isConnected() ||
        !("response" in error) ||
        !(error.response instanceof Response)
      )
        return false;
      return API.STATUS_CODES.includes(error.response.status);
    },
  },
});
