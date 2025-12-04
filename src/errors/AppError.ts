class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly context: AnyObject = {},
    public readonly cause?: Error
  ) {
    super(message)
  }
}

export { AppError }
