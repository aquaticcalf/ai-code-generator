import Groq from 'groq-sdk'

interface codegenerationparams {
  apiKey: string
  prompt: string
  language: string
}

export async function generatecode({ apiKey, prompt, language }: codegenerationparams) {

  const groq = new Groq({ apiKey, dangerouslyAllowBrowser:true })
  
  const enhancedprompt = `Generate a professional, production-ready code snippet in ${language} that demonstrates:
  - Direct solution to the problem
  - Clean, readable, and efficient implementation
  - Proper error handling
  - Meaningful variable and function names
  - Minimal but sufficient comments explaining key logic
  
  Specific requirements:
  - Strictly adhere to ${language} best practices
  - Assume modern language features are available
  - Optimize for readability and maintainability
  - Include only the core implementation
  - Avoid boilerplate or unnecessary explanatory text
  
  Prompt context: ${prompt}`

  const chatcompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a code generation assistant providing efficient code snippets.'
      },
      {
        role: 'user',
        content: enhancedprompt
      }
    ],
    model: 'llama3-8b-8192',
    max_tokens: 500,
    temperature: 0.7
  })

  return chatcompletion.choices[0]?.message?.content || ''
}