import { AppError } from './AppError'

interface ValidationContext {
  formErrors?: string[]
  fieldErrors?: Record<string, string[] | undefined>
}

class ValidationError extends AppError {
  constructor(
    context: ValidationContext = {},
    statusCode: number = 422,
    message: string = 'Invalid data'
  ) {
    super(message, statusCode, { formErrors: [], fieldErrors: {}, ...context })
  }
}

export { ValidationError }
