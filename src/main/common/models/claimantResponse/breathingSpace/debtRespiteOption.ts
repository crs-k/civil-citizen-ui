import {DebtRespiteOptionType} from './debtRespiteOptionType';
import {IsIn} from 'class-validator';

export class DebtRespiteOption {
  @IsIn(Object.values(DebtRespiteOptionType), {message: 'ERRORS.VALID_PAYMENT_OPTION'})
  type: DebtRespiteOptionType;

  constructor(type?: DebtRespiteOptionType) {
    this.type = type;
  }
}
