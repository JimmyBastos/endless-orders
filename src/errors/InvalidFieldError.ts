import { ValidationError } from './ValidationError'

class InvalidFieldError extends ValidationError {
  constructor(field: string, message: string, statusCode: number = 422) {
    super({ fieldErrors: { [field]: [message] } }, statusCode)
  }
}

export { InvalidFieldError }
