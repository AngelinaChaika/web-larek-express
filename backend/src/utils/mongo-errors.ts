const isDuplicateKeyError = (error: unknown): error is Error & { code: number } => (
  error instanceof Error
  && 'code' in error
  && error.code === 11000
);

export default isDuplicateKeyError;
