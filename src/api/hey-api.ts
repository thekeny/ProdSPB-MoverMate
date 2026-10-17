import type { CreateClientConfig } from "@/api/generated/client.gen";
import { getAccessToken } from "@/api/session";
import { API } from "@/configs/consts/api.const";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: "",
  auth: () => getAccessToken(),
  timeout: API.TIMEOUT,
  retry: {
    limit: API.LIMIT,
    methods: API.METHODS,
    statusCodes: API.STATUS_CODES,
  },
});
