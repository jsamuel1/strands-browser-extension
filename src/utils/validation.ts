/**
 * Validation utilities for extension inputs and configuration
 */

/**
 * Validates AWS Access Key ID format
 * AWS Access Key IDs start with AKIA or ASIA followed by 16 alphanumeric characters
 */
export function validateAwsAccessKey(accessKey: string): boolean {
  if (!accessKey) return false
  const awsAccessKeyPattern = /^(AKIA|ASIA)[A-Z0-9]{16}$/
  return awsAccessKeyPattern.test(accessKey)
}

/**
 * Validates AWS Secret Access Key format
 * AWS Secret Access Keys are 40 characters long, base64 encoded
 */
export function validateAwsSecretKey(secretKey: string): boolean {
  if (!secretKey) return false
  const awsSecretKeyPattern = /^[A-Za-z0-9/+=]{40}$/
  return awsSecretKeyPattern.test(secretKey)
}

/**
 * Validates AWS region format
 */
export function validateAwsRegion(region: string): boolean {
  if (!region) return false
  const validRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
    'ca-central-1', 'sa-east-1'
  ]
  return validRegions.includes(region)
}

/**
 * Validates OpenAI API key format
 * OpenAI API keys start with "sk-" followed by alphanumeric characters
 */
export function validateOpenAiApiKey(apiKey: string): boolean {
  if (!apiKey) return false
  const openAiKeyPattern = /^sk-[A-Za-z0-9-_]{20,}$/
  return openAiKeyPattern.test(apiKey)
}

/**
 * Validates that a message is not empty after trimming
 */
export function validateMessage(message: string): boolean {
  return message.trim().length > 0
}

/**
 * Validates model provider selection
 */
export function validateModelProvider(provider: string): boolean {
  return ['bedrock', 'openai'].includes(provider)
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validates Chrome extension permissions
 */
export function validateExtensionPermissions(permissions: string[]): boolean {
  if (!Array.isArray(permissions)) return false
  const validPermissions = ['storage', 'sidePanel', 'tabs', 'activeTab']
  return permissions.every(perm => validPermissions.includes(perm))
}
