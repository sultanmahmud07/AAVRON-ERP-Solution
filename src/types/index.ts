import { ComponentType } from "react";

export type { ISendOtp, IVerifyOtp, ILogin } from "./auth.type";

export interface IResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}
export interface IMeta {
    limit: number;
    page: number;
    total: number;
    totalPage: number;
  }
export interface IResponseWithMeta<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IMeta
  data: T;
}
export interface IApiError {
  status: number;
  data: {
    success: boolean;
    message: string;
    error?: unknown;
    errorSources: { message: string; path: string }[];
  };
}
export interface ISidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    component: ComponentType;
    icon: ComponentType;
  }[];
}

export type TRole = "SUPER_ADMIN" | "ADMIN" | "SENDER" | "RECEIVER" | "USER";

type ZodIssue = {
  code: string;
  expected: string;
  received: string;
  path: string[];
  message: string;
};

type ErrorSource = {
  path: string;
  message: string;
};

export interface IErrorResponse {
  success: boolean;
  message: string;
  errorSources?: ErrorSource[];
  err?: {
    issues: ZodIssue[];
    name: string;
  };
  stack?: string;
}

export interface IAuth {
  provider: "credentials" | "google" | string;
  providerId: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  password: string;
  isDeleted: boolean;
  isActive: "ACTIVE" | "INACTIVE" | "BLOCKED";
  isVerified: boolean;
  role: TRole;
  auths: IAuth[];
  createdAt: string; 
  updatedAt: string;
}
export interface IContact {
  _id: string;
  name: string; 
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}