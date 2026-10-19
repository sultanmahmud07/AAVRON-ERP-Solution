type BlogCategory = {
  _id: string;
  title: string;
};

export type IBlog = {
  _id: string;
  category: BlogCategory;
  title: string;
  thumbnail?: string;
  content: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

type BlogMeta = {
  totalPage: number;
  totalData?: number;
  page?: number;
  limit?: number;
};

export type BlogsApiResponse = {
  data: {
    data: IBlog[];
    meta: BlogMeta;
  };
};