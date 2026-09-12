export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({ message: "A duplicate record already exists." });
  }

  const status = err.status || 500;
  // Never leak internal error details for unexpected server errors.
  const message = status === 500 ? "Internal server error." : (err.message || "Internal server error.");
  res.status(status).json({
    message,
    ...(status !== 500 && err.details ? { details: err.details } : {})
  });
}
