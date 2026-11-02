import { httpApi } from "./http-adapter";
import type { DocsApi } from "./types";

export { ApiClientError } from "./http-adapter";
export type { CollectionInput, DocsApi, ShareInput, WorkspaceSnapshot } from "./types";

/** Điểm duy nhất để đổi nguồn dữ liệu */
export const api: DocsApi = httpApi;
