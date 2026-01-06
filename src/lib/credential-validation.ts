/**
 * Credential Validation Utilities
 * 
 * Validates format and structure of provider credentials
 * before they are sent to the backend.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate Twilio Account SID format
 * - Must start with "AC"
 * - Must be exactly 34 characters
 */
export function validateTwilioSid(sid: string): ValidationResult {
  if (!sid || sid.trim().length === 0) {
    return { valid: false, error: "Account SID is required" };
  }

  if (!sid.startsWith("AC")) {
    return { valid: false, error: "Account SID must start with 'AC'" };
  }

  if (sid.length !== 34) {
    return {
      valid: false,
      error: `Account SID must be 34 characters (got ${sid.length})`,
    };
  }

  return { valid: true };
}

/**
 * Validate Twilio Auth Token format
 * - Must be exactly 32 characters
 */
export function validateTwilioAuthToken(authToken: string): ValidationResult {
  if (!authToken || authToken.trim().length === 0) {
    return { valid: false, error: "Auth Token is required" };
  }

  if (authToken.length !== 32) {
    return {
      valid: false,
      error: `Auth Token must be 32 characters (got ${authToken.length})`,
    };
  }

  return { valid: true };
}

/**
 * Validate Twilio credentials (both SID and Auth Token)
 */
export function validateTwilioCredentials(
  sid: string,
  authToken: string,
): ValidationResult {
  const sidResult = validateTwilioSid(sid);
  if (!sidResult.valid) {
    return sidResult;
  }

  const authResult = validateTwilioAuthToken(authToken);
  if (!authResult.valid) {
    return authResult;
  }

  return { valid: true };
}

/**
 * Validate AWS Access Key ID format
 * - Typically 20 characters (but can vary)
 * - Alphanumeric characters
 */
export function validateAwsAccessKey(accessKey: string): ValidationResult {
  if (!accessKey || accessKey.trim().length === 0) {
    return { valid: false, error: "AWS Access Key ID is required" };
  }

  if (accessKey.length < 16 || accessKey.length > 128) {
    return {
      valid: false,
      error: "AWS Access Key ID must be between 16 and 128 characters",
    };
  }

  // AWS access keys are alphanumeric (and can include some special chars)
  if (!/^[A-Z0-9]+$/.test(accessKey)) {
    return {
      valid: false,
      error: "AWS Access Key ID must contain only uppercase letters and numbers",
    };
  }

  return { valid: true };
}

/**
 * Validate AWS Secret Access Key format
 * - Typically 40 characters (base64-like)
 */
export function validateAwsSecretKey(secretKey: string): ValidationResult {
  if (!secretKey || secretKey.trim().length === 0) {
    return { valid: false, error: "AWS Secret Access Key is required" };
  }

  if (secretKey.length < 20 || secretKey.length > 128) {
    return {
      valid: false,
      error: "AWS Secret Access Key must be between 20 and 128 characters",
    };
  }

  return { valid: true };
}

/**
 * Validate AWS credentials (both Access Key and Secret Key)
 */
export function validateAwsCredentials(
  accessKey: string,
  secretKey: string,
): ValidationResult {
  const accessKeyResult = validateAwsAccessKey(accessKey);
  if (!accessKeyResult.valid) {
    return accessKeyResult;
  }

  const secretKeyResult = validateAwsSecretKey(secretKey);
  if (!secretKeyResult.valid) {
    return secretKeyResult;
  }

  return { valid: true };
}

/**
 * Validate AWS Region format
 * - Standard AWS region format (e.g., us-east-1, eu-west-1)
 */
export function validateAwsRegion(region: string): ValidationResult {
  if (!region || region.trim().length === 0) {
    return { valid: false, error: "AWS Region is required" };
  }

  // Basic AWS region format validation
  const regionPattern = /^[a-z]{2}-[a-z]+-\d+$/;
  if (!regionPattern.test(region)) {
    return {
      valid: false,
      error: "Invalid AWS region format (expected: us-east-1, eu-west-1, etc.)",
    };
  }

  return { valid: true };
}

