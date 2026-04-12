const fs = require('fs')
const path = require('path')

// Read .env.local manually
let GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8')
    const match = envContent.match(/GEMINI_API_KEY=(.+)/)
    if (match) {
      GEMINI_API_KEY = match[1].trim()
    }
  } catch (err) {
    console.error('❌ Could not read .env.local:', err.message)
  }
}
const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

console.log('🔍 Gemini Vision API Test')
console.log('========================')
console.log('🔑 API Key configured:', !!GEMINI_API_KEY)
if (GEMINI_API_KEY) {
  console.log('📝 API Key (first 20 chars):', GEMINI_API_KEY.substring(0, 20) + '...')
  console.log('📝 API Key (last 10 chars): ...' + GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 10))
}
console.log('🤖 Model:', GEMINI_MODEL)
console.log('🌐 API Version: v1beta')
console.log('')

async function listAvailableModels() {
  console.log('📋 Listing available models...')
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
  
  try {
    const response = await fetch(listUrl)
    const data = await response.json()
    
    if (response.ok && data.models) {
      console.log('✅ Available models:')
      data.models.forEach(model => {
        console.log(`  - ${model.name} (${model.displayName})`)
      })
      return data.models
    } else {
      console.error('❌ Error listing models:', data)
      return []
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return []
  }
}

async function testGeminiVision() {
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    process.exit(1)
  }

  try {
    // First, list available models
    const models = await listAvailableModels()
    console.log('')
    
    console.log('🧪 Testing Gemini Vision API with simple prompt...')
    
    // Create a minimal test image (1x1 red pixel PNG in base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
    
    const prompt = 'What color is this image?'
    
    console.log('📤 Sending request to Gemini API...')
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/png',
                data: testImageBase64
              }
            }
          ]
        }]
      })
    })

    console.log('📥 Response status:', response.status, response.statusText)
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ API Error:', JSON.stringify(data, null, 2))
      process.exit(1)
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    console.log('✅ API Response received!')
    console.log('📝 Response text:', text)
    console.log('')
    console.log('🎉 SUCCESS! Gemini Vision API is working correctly.')
    console.log('✅ You can now test with real Instagram images.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

testGeminiVision()
