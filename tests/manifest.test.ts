import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Manifest Validation Tests
 * 
 * Tests to ensure the Chrome extension manifest.json is valid and contains
 * all required fields for proper extension functionality.
 */

describe('manifest.json validation', () => {
  const manifestPath = join(process.cwd(), 'manifest.json')
  const manifestContent = readFileSync(manifestPath, 'utf-8')
  const manifest = JSON.parse(manifestContent)

  it('should be valid JSON', () => {
    expect(() => JSON.parse(manifestContent)).not.toThrow()
  })

  it('should have manifest_version 3', () => {
    expect(manifest.manifest_version).toBe(3)
  })

  it('should have required fields', () => {
    expect(manifest).toHaveProperty('name')
    expect(manifest).toHaveProperty('version')
    expect(manifest).toHaveProperty('description')
    expect(manifest.name).toBeTruthy()
    expect(manifest.version).toBeTruthy()
    expect(manifest.description).toBeTruthy()
  })

  it('should have valid version format', () => {
    // Chrome extension versions should follow semver-like format
    const versionRegex = /^\d+(\.\d+){0,3}$/
    expect(manifest.version).toMatch(versionRegex)
  })

  it('should have required permissions', () => {
    expect(manifest.permissions).toBeDefined()
    expect(Array.isArray(manifest.permissions)).toBe(true)
    expect(manifest.permissions).toContain('storage')
    expect(manifest.permissions).toContain('sidePanel')
  })

  it('should have valid action configuration', () => {
    expect(manifest.action).toBeDefined()
    expect(manifest.action.default_popup).toBe('popup.html')
    expect(manifest.action.default_icon).toBeDefined()
    expect(manifest.action.default_icon['16']).toBe('icons/icon16.png')
    expect(manifest.action.default_icon['32']).toBe('icons/icon32.png')
    expect(manifest.action.default_icon['48']).toBe('icons/icon48.png')
    expect(manifest.action.default_icon['128']).toBe('icons/icon128.png')
  })

  it('should have valid side_panel configuration', () => {
    expect(manifest.side_panel).toBeDefined()
    expect(manifest.side_panel.default_path).toBe('popup.html')
  })

  it('should have valid icons configuration', () => {
    expect(manifest.icons).toBeDefined()
    expect(manifest.icons['16']).toBe('icons/icon16.png')
    expect(manifest.icons['32']).toBe('icons/icon32.png')
    expect(manifest.icons['48']).toBe('icons/icon48.png')
    expect(manifest.icons['128']).toBe('icons/icon128.png')
  })

  it('should have consistent icon paths in action and top-level icons', () => {
    expect(manifest.action.default_icon['16']).toBe(manifest.icons['16'])
    expect(manifest.action.default_icon['32']).toBe(manifest.icons['32'])
    expect(manifest.action.default_icon['48']).toBe(manifest.icons['48'])
    expect(manifest.action.default_icon['128']).toBe(manifest.icons['128'])
  })

  it('should not have dangerous permissions', () => {
    const dangerousPermissions = [
      'debugger',
      'geolocation',
      'management',
      'nativeMessaging',
      'privacy'
    ]
    const hassDangerousPerms = manifest.permissions?.some((perm: string) => 
      dangerousPermissions.includes(perm)
    )
    expect(hassDangerousPerms).toBe(false)
  })

  it('should have valid name length', () => {
    // Chrome Web Store enforces maximum 45 characters for extension name
    expect(manifest.name.length).toBeLessThanOrEqual(45)
    expect(manifest.name.length).toBeGreaterThan(0)
  })

  it('should have valid description length', () => {
    // Chrome Web Store enforces maximum 132 characters for description
    expect(manifest.description.length).toBeLessThanOrEqual(132)
    expect(manifest.description.length).toBeGreaterThan(0)
  })
})
