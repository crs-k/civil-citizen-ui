import {ValidationError} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';

export class Form {
  errors?: ValidationError[];

  constructor(errors?: ValidationError[]) {
    this.errors = errors;
  }

  hasErrors(): boolean {
    return this.errors !== undefined && this.errors.length > 0;
  }

  public getErrors(parentProperty?: string): FormValidationError[] {
    if (this.hasErrors()) {
      const validators: FormValidationError[] = [];
      for (const item of this.errors) {
        validators.push(new FormValidationError(item, parentProperty));
      }
      return validators;
    }
  }

  public hasFieldError(field: string): boolean {
    if (this.errors) {
      return this.errors.some((error) => field == error.property);
    }
  }

  /**
   * Get error message associated with first constraint violated for given field name.
   *
   * @param fieldName - field name / model property
   */
  errorFor(fieldName: string): string {
    return this.getErrors()
      .filter((error: FormValidationError) => error.fieldName === fieldName)
      .map((error: FormValidationError) => error.text)[0];
  }

  public getTextError(errors: ValidationError[], property: string) {
    const error = errors?.filter((item) => item.property == property);
    if (error?.length > 0) {
      return error[0].constraints;
    }
  }
}
