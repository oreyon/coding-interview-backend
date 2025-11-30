export interface WebResponse<T> {
	code: number;
	message?: string;
	data?: T;
	errors?: string | Array<{ validation: string; message: string }>;
	paging?: Paging;
}

export interface Paging {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}
