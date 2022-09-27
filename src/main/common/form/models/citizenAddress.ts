import {IsNotEmpty, Validate} from 'class-validator';
import {PostcodeValidator} from '../validators/postcodeValidator';

export class CitizenAddress {
  @IsNotEmpty({message: 'ERRORS.VALID_ADDRESS_LINE_1'})
    primaryAddressLine1?: string;
  primaryAddressLine2?: string;
  primaryAddressLine3?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_POSTCODE'})
  @Validate(PostcodeValidator, {message: 'ERRORS.DEFENDANT_POSTCODE_NOT_VALID'})
    primaryPostCode?: string;
  @IsNotEmpty({message: 'ERRORS.VALID_CITY'})
    primaryCity?: string;

  constructor(
    primaryAddressLine1?: string,
    primaryAddressLine2?: string,
    primaryAddressLine3?: string,
    primaryCity?: string,
    primaryPostCode?: string) {
    this.primaryAddressLine1 = primaryAddressLine1;
    this.primaryAddressLine2 = primaryAddressLine2;
    this.primaryAddressLine3 = primaryAddressLine3;
    this.primaryCity = primaryCity;
    this.primaryPostCode = primaryPostCode;
  }

  static fromObject(value?: any, redisData?: boolean): CitizenAddress {
  if (redisData){
    return new CitizenAddress(
      value?.AddressLine1,
      value?.AddressLine2,
      value?.AddressLine3,
      value?.PostTown,
      value?.PostCode
    );
  }
  return new CitizenAddress(
      value?.primaryAddressLine1,
      value?.primaryAddressLine2,
      value?.primaryAddressLine3,
      value?.primaryCity,
      value?.primaryPostCode
    );
  }
}
