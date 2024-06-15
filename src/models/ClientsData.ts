import type { ClientsStage } from "./ClientsStage";

export interface ClientsData {
  id: number;
  title: string;
  stages: ClientsStage[];
};