import {IsDefined, IsNotEmpty, ValidateIf} from 'class-validator';
import {SameRateInterestType} from '../../claimDetails';

export class ClaimantInterestRate {
  @IsDefined({message: 'ERRORS.RATE_CHOOSE_ONE'})
    option?: SameRateInterestType;

  @ValidateIf(o => o.option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE)
  @IsNotEmpty({message: 'ERRORS.RATE_CORRECT_THE_ONE_ENTERED'})
    differentRate?: number;

  @ValidateIf(o => o.option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE)
  @IsNotEmpty({message: 'ERRORS.RATE_EXPLAIN_CLAIMING_IT'})
    reason?: string;

  constructor(option?: SameRateInterestType, differentRate?: number, reason?: string) {
    this.option = option;
    this.differentRate = differentRate;
    this.reason = reason;
  }
}
