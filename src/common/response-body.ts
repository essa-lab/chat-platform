import { ApiProperty } from "@nestjs/swagger";


export class ResponseBody<T>{

    @ApiProperty({ example: true })
    success : boolean;
    @ApiProperty({ example: "Text Message" })
    message : string;
    @ApiProperty()
    data? : T;
    constructor(success : boolean, message:string , data?:T){
        this.success = success;
        this.message = message;
        this.data=data;
    }
}

export class PaginationMeta {
  @ApiProperty({ example: 100 })
  totalItems: number;

  @ApiProperty({ example: 10 })
  itemCount: number;

  @ApiProperty({ example: 10 })
  itemsPerPage: number;

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: 1 })
  currentPage: number;

  constructor(
    totalItems: number,
    itemCount: number,
    itemsPerPage: number,
    totalPages: number,
    currentPage: number,
  ) {
    this.totalItems = totalItems;
    this.itemCount = itemCount;
    this.itemsPerPage = itemsPerPage;
    this.totalPages = totalPages;
    this.currentPage = currentPage;
  }
}


export class PaginatedResponse<T> {
  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;


    @ApiProperty({ example: "Text Message" })
    message : string;
    @ApiProperty()
    data? : T;
    constructor(meta : PaginationMeta, message:string , data?:T){
    this.meta = meta;
        this.message = message;
        this.data=data;
    }

  
}


export class ErrorBody<T>{

   @ApiProperty({ example: 'Error Message' })
    message : string|[];
    @ApiProperty({ example: 'Error Type' })
    error : string;
    @ApiProperty({ example: 404 })
    code: number;

    constructor(error : string, message:string|[] , code:number){
        this.error = error;
        this.message = message;
        this.code=code;
    }
}


