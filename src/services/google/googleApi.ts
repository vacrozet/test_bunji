import axios, { AxiosResponse, AxiosError } from "axios";
import { GoogleEvent } from "./types";
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  data?: any;
}

class GoogleApiEvents {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}`;
    this.apiKey =
      process.env.GOOGLE_API_KEY || "0cb3c20a-bf39-4241-b03f-cd329a484ecd";
  }

  public async get(target: string = ""): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}${target}`,
        {
          headers: { "api-key": `${this.apiKey}` },
        }
      );
      return response.data;
    } catch (error) {
      this.handleAPIError(error as AxiosError);
      throw error;
    }
  }

  public async getAllByRecurcive(
    page: number = 1,
    tab: GoogleEvent[] = []
  ): Promise<any> {
    try {
      const actualTab = [...tab];
      const response = await this.get(`?page=${page}`);

      actualTab.push(...response.data);
      if (response.totalPages === response.currentPage) {
        return actualTab;
      } else {
        return this.getAllByRecurcive(page + 1, actualTab);
      }
    } catch (error) {
      this.handleAPIError(error as AxiosError);
      throw error;
    }
  }

  public async getAll(): Promise<any> {
    try {
      const response: GoogleEvent[] = await this.getAllByRecurcive();

      return response;
    } catch (error) {
      this.handleAPIError(error as AxiosError);
      throw error;
    }
  }

  public async create(
    data: Omit<GoogleEvent, "id">,
    options?: RequestOptions
  ): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}`,
        data,
        { ...options, headers: { "api-key": `${this.apiKey}` } }
      );
      return response.data;
    } catch (error) {
      console.log({ error });
      this.handleAPIError(error as AxiosError);
      throw error;
    }
  }

  public async update(
    target: string = "",
    data: any,
    options?: RequestOptions
  ): Promise<any> {
    try {
      const response: AxiosResponse = await axios.put(
        `${this.baseUrl}/${target}`,
        data,
        { ...options, headers: { "api-key": `${this.apiKey}` } }
      );
      return response.data;
    } catch (error) {
      this.handleAPIError(error as AxiosError);
      throw error;
    }
  }

  public async delete(
    endpoint: string,
    options?: RequestOptions
  ): Promise<any> {
    try {
      const response: AxiosResponse = await axios.delete(
        `${this.baseUrl}/${endpoint}`,
        { ...options, headers: { "api-key": `${this.apiKey}` } }
      );
      return response.data;
    } catch (error) {
      this.handleAPIError(error as AxiosError);
      throw error;
    }
  }

  private handleAPIError(error: AxiosError): void {
    if (error.response) {
      // Handle API response errors (non-2xx status codes)
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Handle request errors (no response received)
      console.error("Request Error:", error.request);
    } else {
      // Handle other errors
      console.error("Error:", error.message);
    }
  }
}

// Exemple d'utilisation
const api = new GoogleApiEvents("http://localhost:3001/events");

export default api;
