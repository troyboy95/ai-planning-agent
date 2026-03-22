export function validateProblemStatement(statement: string | undefined): { valid: boolean; error?: string; suggestion?: string } {
  if (!statement || statement.trim().length === 0) {
    return { valid: false, error: "Empty problem statement" };
  }

  const trimmed = statement.trim();

  if (trimmed.length < 20) {
    return { 
      valid: false, 
      error: "Too brief. Please describe your problem in more detail.",
      suggestion: "Try explaining the context, who is involved, and what you aim to achieve."
    };
  }

  if (trimmed.length > 1000) {
    return {
      valid: true, // we can truncate it later or here
      error: "Problem statement too long. It will be truncated.",
    };
  }

  return { valid: true };
}
