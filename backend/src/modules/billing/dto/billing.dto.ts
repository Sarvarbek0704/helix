import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../database/entities/bill.entity';

export class BillItemDto {
  @IsString() description: string;
  @IsString() @IsOptional() category?: string;
  @IsNumber() @IsOptional() quantity?: number;
  @IsNumber() unitPrice: number;
}

export class CreateBillDto {
  @IsString() patientId: string;
  @IsString() @IsOptional() appointmentId?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => BillItemDto) items: BillItemDto[];
  @IsNumber() @IsOptional() discountPercent?: number;
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() dueDate?: string;
}

export class RecordPaymentDto {
  @IsNumber() amount: number;
  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;
}
