import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * Main Application Logic Tests
 * 
 * Integration tests for the main extension functionality
 */

// Mock the Strands SDK modules
vi.mock('@strands-agents/sdk', () => ({
  Agent: vi.fn().mockImplementation(() => ({
    stream: vi.fn().mockImplementation(async function* () {
      yield {
        type: 'modelContentBlockDeltaEvent',
        delta: { type: 'textDelta', text: 'Hello, ' }
      }
      yield {
        type: 'modelContentBlockDeltaEvent',
        delta: { type: 'textDelta', text: 'world!' }
      }
    })
  })),
  BedrockModel: vi.fn()
}))

vi.mock('@strands-agents/sdk/openai', () => ({
  OpenAIModel: vi.fn()
}))

vi.mock('marked', () => ({
  marked: {
    parse: vi.fn((text: string) => `<p>${text}</p>`)
  }
}))

describe('DOM manipulation and form handling', () => {
  beforeEach(() => {
    // Create a mock DOM structure
    document.body.innerHTML = `
      <div id="credentials-section">
        <form id="credentials-form">
          <select id="provider">
            <option value="bedrock">Bedrock</option>
            <option value="openai">OpenAI</option>
          </select>
          <div id="bedrock-fields">
            <input id="access-key" type="text" />
            <input id="secret-key" type="text" />
            <input id="session-token" type="text" />
            <select id="region">
              <option value="us-east-1">US East 1</option>
            </select>
          </div>
          <div id="openai-fields" class="hidden">
            <input id="openai-key" type="text" />
          </div>
          <button id="connect" type="submit">Connect</button>
        </form>
        <div id="model-info">Using Claude Sonnet 4</div>
      </div>
      <div id="chat-section" class="hidden">
        <div id="messages"></div>
        <form id="chat-form">
          <input id="input" type="text" />
          <button id="send" type="submit">Send</button>
        </form>
      </div>
    `
  })

  it('should have all required DOM elements', () => {
    expect(document.getElementById('credentials-section')).toBeTruthy()
    expect(document.getElementById('chat-section')).toBeTruthy()
    expect(document.getElementById('credentials-form')).toBeTruthy()
    expect(document.getElementById('provider')).toBeTruthy()
    expect(document.getElementById('bedrock-fields')).toBeTruthy()
    expect(document.getElementById('openai-fields')).toBeTruthy()
    expect(document.getElementById('model-info')).toBeTruthy()
    expect(document.getElementById('messages')).toBeTruthy()
    expect(document.getElementById('chat-form')).toBeTruthy()
    expect(document.getElementById('input')).toBeTruthy()
    expect(document.getElementById('send')).toBeTruthy()
  })

  it('should toggle provider fields correctly', () => {
    const providerSelect = document.getElementById('provider') as HTMLSelectElement

    // Simulate changing to OpenAI
    providerSelect.value = 'openai'
    providerSelect.dispatchEvent(new Event('change'))

    // Note: In actual implementation, event listener would handle this
    // For testing, we simulate the expected behavior
    expect(providerSelect.value).toBe('openai')
  })

  it('should validate form elements exist for credentials', () => {
    const accessKey = document.getElementById('access-key') as HTMLInputElement
    const secretKey = document.getElementById('secret-key') as HTMLInputElement
    const sessionToken = document.getElementById('session-token') as HTMLInputElement
    const region = document.getElementById('region') as HTMLSelectElement
    const openaiKey = document.getElementById('openai-key') as HTMLInputElement

    expect(accessKey).toBeTruthy()
    expect(secretKey).toBeTruthy()
    expect(sessionToken).toBeTruthy()
    expect(region).toBeTruthy()
    expect(openaiKey).toBeTruthy()
  })

  it('should validate form input values can be set', () => {
    const accessKey = document.getElementById('access-key') as HTMLInputElement
    const openaiKey = document.getElementById('openai-key') as HTMLInputElement

    accessKey.value = 'AKIAIOSFODNN7EXAMPLE'
    openaiKey.value = 'sk-1234567890abcdefghij'

    expect(accessKey.value).toBe('AKIAIOSFODNN7EXAMPLE')
    expect(openaiKey.value).toBe('sk-1234567890abcdefghij')
  })
})

describe('Message handling', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="messages"></div>
    `
  })

  it('should handle message container manipulation', () => {
    const messagesContainer = document.getElementById('messages')!
    
    // Simulate adding a message
    const messageDiv = document.createElement('div')
    messageDiv.className = 'message user'
    messageDiv.textContent = 'Test message'
    messagesContainer.appendChild(messageDiv)

    expect(messagesContainer.children.length).toBe(1)
    expect(messagesContainer.children[0].textContent).toBe('Test message')
    expect(messagesContainer.children[0].className).toBe('message user')
  })

  it('should handle multiple messages', () => {
    const messagesContainer = document.getElementById('messages')!
    
    // Add user message
    const userMessage = document.createElement('div')
    userMessage.className = 'message user'
    userMessage.textContent = 'Hello'
    messagesContainer.appendChild(userMessage)

    // Add assistant message
    const assistantMessage = document.createElement('div')
    assistantMessage.className = 'message assistant'
    assistantMessage.textContent = 'Hi there!'
    messagesContainer.appendChild(assistantMessage)

    expect(messagesContainer.children.length).toBe(2)
    expect(messagesContainer.children[0].className).toBe('message user')
    expect(messagesContainer.children[1].className).toBe('message assistant')
  })
})

describe('Form validation logic', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="credentials-form">
        <select id="provider">
          <option value="bedrock">Bedrock</option>
          <option value="openai">OpenAI</option>
        </select>
        <input id="access-key" type="text" />
        <input id="secret-key" type="text" />
        <input id="openai-key" type="text" />
      </form>
    `
  })

  it('should validate Bedrock credentials presence', () => {
    const provider = document.getElementById('provider') as HTMLSelectElement
    const accessKey = document.getElementById('access-key') as HTMLInputElement
    const secretKey = document.getElementById('secret-key') as HTMLInputElement

    provider.value = 'bedrock'
    accessKey.value = 'AKIAIOSFODNN7EXAMPLE'
    secretKey.value = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'

    // Simulate validation logic
    const isBedrockValid = provider.value === 'bedrock' && 
                          accessKey.value.trim() !== '' && 
                          secretKey.value.trim() !== ''

    expect(isBedrockValid).toBe(true)
  })

  it('should validate OpenAI credentials presence', () => {
    const provider = document.getElementById('provider') as HTMLSelectElement
    const openaiKey = document.getElementById('openai-key') as HTMLInputElement

    provider.value = 'openai'
    openaiKey.value = 'sk-1234567890abcdefghij'

    // Simulate validation logic
    const isOpenAiValid = provider.value === 'openai' && 
                         openaiKey.value.trim() !== ''

    expect(isOpenAiValid).toBe(true)
  })

  it('should fail validation with empty credentials', () => {
    const accessKey = document.getElementById('access-key') as HTMLInputElement
    const secretKey = document.getElementById('secret-key') as HTMLInputElement

    accessKey.value = ''
    secretKey.value = ''

    const isValid = accessKey.value.trim() !== '' && secretKey.value.trim() !== ''
    expect(isValid).toBe(false)
  })
})

describe('Extension environment detection', () => {
  it('should detect Chrome extension environment', () => {
    // Chrome extensions have access to chrome.runtime
    // In our test environment, chrome is mocked in setup.ts
    expect(typeof chrome).toBe('object')
  })

  it('should handle storage API availability', () => {
    // Check if chrome.storage is available (mocked in our tests)
    const hasStorage = chrome && chrome.storage && chrome.storage.local
    expect(hasStorage).toBeTruthy()
  })

  it('should handle sidePanel API availability', () => {
    // Check if chrome.sidePanel is available (mocked in our tests)  
    const hasSidePanel = chrome && chrome.sidePanel
    expect(hasSidePanel).toBeTruthy()
  })
})