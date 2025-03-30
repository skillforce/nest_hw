import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function FieldExists(
  fieldName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'FieldExists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [fieldName],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const requestBody = args.object as Record<string, any>;
          return requestBody[fieldName] !== undefined;
        },
        defaultMessage(args: ValidationArguments) {
          return `Field '${args.constraints[0]}' is required in the request body`;
        },
      },
    });
  };
}
