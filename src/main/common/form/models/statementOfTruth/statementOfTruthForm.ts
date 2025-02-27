import {IsDefined, IsNotEmpty, ValidateIf} from 'class-validator';
import {SignatureType} from 'models/signatureType';

export class StatementOfTruthForm {
  type: SignatureType;
  isFullAmountRejected: boolean;

  @IsDefined({message: 'ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE'})
  @IsNotEmpty({message: 'ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE'})
    signed?: string;

  @ValidateIf(o => o.isFullAmountRejected === true)
  @IsDefined({message: 'ERRORS.DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE'})
  @IsNotEmpty({message: 'ERRORS.DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE'})
    directionsQuestionnaireSigned?: string;

  constructor(isFullAmountRejected: boolean, type?: SignatureType, signed?: string, directionsQuestionnaireSigned?: string) {
    this.isFullAmountRejected = isFullAmountRejected;
    this.type = (type) ? type : SignatureType.BASIC;
    this.signed = signed;
    this.directionsQuestionnaireSigned = directionsQuestionnaireSigned;
  }
}
