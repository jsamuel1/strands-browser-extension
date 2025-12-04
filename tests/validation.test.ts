import { describe, it, expect } from 'vitest'
import {
  validateAwsAccessKey,
  validateAwsSecretKey,
  validateAwsRegion,
  validateOpenAiApiKey,
  validateMessage,
  validateModelProvider,
  sanitizeInput,
  validateExtensionPermissions
} from '../src/utils/validation'

/**
 * Validation Utilities Tests
 * 
 * Tests for extension-specific validation logic
 */

describe('validateAwsAccessKey', () => {
  it('should accept valid AKIA access keys', () => {
    expect(validateAwsAccessKey('AKIAIOSFODNN7EXAMPLE')).toBe(true)
    expect(validateAwsAccessKey('AKIAI44QH8DHBEXAMPLE')).toBe(true)
  })

  it('should accept valid ASIA access keys (temporary credentials)', () => {
    expect(validateAwsAccessKey('ASIAIOSFODNN7EXAMPLE')).toBe(true)
  })

  it('should reject invalid access keys', () => {
    expect(validateAwsAccessKey('')).toBe(false)
    expect(validateAwsAccessKey('INVALID')).toBe(false)
    expect(validateAwsAccessKey('akiaiosfodnn7example')).toBe(false) // lowercase
    expect(validateAwsAccessKey('AKIA123')).toBe(false) // too short
    expect(validateAwsAccessKey('BKIAIOSFODNN7EXAMPLE')).toBe(false) // wrong prefix
  })

  it('should reject keys with special characters', () => {
    expect(validateAwsAccessKey('AKIAIOSFODN$7EXAMPLE')).toBe(false)
    expect(validateAwsAccessKey('AKIAIOSFODNN7EXAMPL!')).toBe(false)
  })
})

describe('validateAwsSecretKey', () => {
  it('should accept valid secret keys', () => {
    expect(validateAwsSecretKey('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY')).toBe(true)
    expect(validateAwsSecretKey('1234567890abcdefGHIJ+/=KLMNOPQRSTUV123XY')).toBe(true)
  })

  it('should reject invalid secret keys', () => {
    expect(validateAwsSecretKey('')).toBe(false)
    expect(validateAwsSecretKey('tooshort')).toBe(false)
    expect(validateAwsSecretKey('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEYtoolong')).toBe(false)
  })

  it('should reject keys with invalid characters', () => {
    expect(validateAwsSecretKey('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPL@')).toBe(false)
  })
})

describe('validateAwsRegion', () => {
  it('should accept valid AWS regions', () => {
    expect(validateAwsRegion('us-east-1')).toBe(true)
    expect(validateAwsRegion('us-west-2')).toBe(true)
    expect(validateAwsRegion('eu-west-1')).toBe(true)
    expect(validateAwsRegion('ap-southeast-1')).toBe(true)
  })

  it('should reject invalid regions', () => {
    expect(validateAwsRegion('')).toBe(false)
    expect(validateAwsRegion('invalid-region')).toBe(false)
    expect(validateAwsRegion('us-east-99')).toBe(false)
  })
})

describe('validateOpenAiApiKey', () => {
  it('should accept valid OpenAI API keys', () => {
    expect(validateOpenAiApiKey('sk-proj-1234567890abcdefghijklmnopqrstuvwxyz')).toBe(true)
    expect(validateOpenAiApiKey('sk-1234567890abcdefghij')).toBe(true)
  })

  it('should reject invalid API keys', () => {
    expect(validateOpenAiApiKey('')).toBe(false)
    expect(validateOpenAiApiKey('invalid')).toBe(false)
    expect(validateOpenAiApiKey('sk-short')).toBe(false)
    expect(validateOpenAiApiKey('pk-1234567890abcdefghij')).toBe(false) // wrong prefix
  })
})

describe('validateMessage', () => {
  it('should accept non-empty messages', () => {
    expect(validateMessage('Hello')).toBe(true)
    expect(validateMessage('  Hello  ')).toBe(true)
    expect(validateMessage('Multi\nline\nmessage')).toBe(true)
  })

  it('should reject empty messages', () => {
    expect(validateMessage('')).toBe(false)
    expect(validateMessage('   ')).toBe(false)
    expect(validateMessage('\t\n')).toBe(false)
  })
})

describe('validateModelProvider', () => {
  it('should accept valid providers', () => {
    expect(validateModelProvider('bedrock')).toBe(true)
    expect(validateModelProvider('openai')).toBe(true)
  })

  it('should reject invalid providers', () => {
    expect(validateModelProvider('invalid')).toBe(false)
    expect(validateModelProvider('')).toBe(false)
    expect(validateModelProvider('Bedrock')).toBe(false) // case sensitive
    expect(validateModelProvider('OpenAI')).toBe(false)
  })
})

describe('sanitizeInput', () => {
  it('should escape HTML special characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>'))
      .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
  })

  it('should escape quotes', () => {
    expect(sanitizeInput('He said "hello"')).toBe('He said &quot;hello&quot;')
    expect(sanitizeInput("It's working")).toBe('It&#x27;s working')
  })

  it('should handle normal text', () => {
    expect(sanitizeInput('Normal text')).toBe('Normal text')
    expect(sanitizeInput('Text with numbers 123')).toBe('Text with numbers 123')
  })

  it('should handle empty input', () => {
    expect(sanitizeInput('')).toBe('')
  })
})

describe('validateExtensionPermissions', () => {
  it('should accept valid permission arrays', () => {
    expect(validateExtensionPermissions(['storage', 'sidePanel'])).toBe(true)
    expect(validateExtensionPermissions(['storage'])).toBe(true)
    expect(validateExtensionPermissions(['tabs', 'activeTab'])).toBe(true)
  })

  it('should reject invalid permissions', () => {
    expect(validateExtensionPermissions(['storage', 'invalid'])).toBe(false)
    expect(validateExtensionPermissions(['debugger'])).toBe(false)
    expect(validateExtensionPermissions(['<all_urls>'])).toBe(false)
  })

  it('should reject non-array input', () => {
    expect(validateExtensionPermissions('storage' as any)).toBe(false)
    expect(validateExtensionPermissions({} as any)).toBe(false)
    expect(validateExtensionPermissions(null as any)).toBe(false)
  })

  it('should accept empty array', () => {
    expect(validateExtensionPermissions([])).toBe(true)
  })
})
