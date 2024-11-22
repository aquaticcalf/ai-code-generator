import React, { useState, useEffect, useRef, useMemo } from 'react'
import { generatecode } from '../lib/groq-api'
import { Prism as Syntaxhighlighter } from 'react-syntax-highlighter'
import copytoclip from 'react-copy-to-clipboard'
const { CopyToClipboard } = copytoclip

const Groqcodegenerator = () => {
    const [apiKey, setapikey] = useState('')
    const [prompt, setprompt] = useState('')
    const [language, setlanguage] = useState('javascript')
    const [customlanguage, setcustomlanguage] = useState('')
    const [generatedcode, setgeneratedcode] = useState('')
    const [isloading, setisloading] = useState(false)
    const [error, seterror] = useState('')
    const [style, setstyle] = useState({})
    const [copied, setcopied] = useState(false)
    const copytimeoutref = useRef<NodeJS.Timeout | null>(null)
    const languages = ['c', 'c++', 'javascript', 'python', 'typescript', 'rust', 'golang', 'custom']

    useEffect(() => {
        import('react-syntax-highlighter/dist/esm/styles/prism/material-dark')
        .then(mod => setstyle(mod.default))
    }, [])

    const extractcodeblock = (text: string) => {
        const codeblockregex = /```\w*\n([\s\S]*?)```/
        const match = text.match(codeblockregex)
        return match ? match[1].trim() : text
    }

    const handlegeneratecode = async () => {
        setgeneratedcode('')
        seterror('')
        setisloading(true)

        try {
            const fullcode = await generatecode({ apiKey, prompt, language })
            const extractedcode = extractcodeblock(fullcode)
            setgeneratedcode(extractedcode)
        } catch (err) {
            seterror(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setisloading(false)
        }
    }
    
    const handlecopy = () => {
        setcopied(true)
        if (copytimeoutref.current) {
            clearTimeout(copytimeoutref.current)
        }
        copytimeoutref.current = setTimeout(() => {
            setcopied(false)
        }, 2000)
    }

    const isgeneratedisabled = useMemo(() => {
        return !apiKey || !prompt || isloading || (language === 'custom' && !customlanguage.trim())
    }, [apiKey, prompt, isloading, language, customlanguage])

    return (
        <div className="mx-auto">
            <div className="w-[80vw] shadow-md rounded px-8 pt-6 pb-8 mb-4" data-theme="cupcake">
                <h2 className="text-2xl mb-4">Groq Code Generator</h2>

                <input type="password" placeholder="Groq API Key" value={apiKey} onChange={(e) => setapikey(e.target.value)} className="w-full p-2 border rounded mb-4"/>

                <textarea placeholder="Enter code generation prompt" value={prompt} onChange={(e) => setprompt(e.target.value)} className="w-full p-2 border rounded mb-4 min-h-[120px]"/>

                <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-between mb-4">
                    <select value={language} onChange={(e) => setlanguage(e.target.value)} className="p-2 border rounded">
                        {languages.map(lang => (
                            <option key={lang} value={lang}>
                                {lang === 'custom' ? 'Custom Language' : lang}
                            </option>
                        ))}
                    </select>

                    {language === 'custom' && (
                        <input type="text" placeholder="Enter custom language" value={customlanguage} onChange={(e) => setcustomlanguage(e.target.value)} className="p-2 border rounded ml-2 flex-grow" />
                    )}

                    <button onClick={handlegeneratecode} disabled={isgeneratedisabled} className="btn btn-secondary px-4 py-2 rounded">
                        { !apiKey || !prompt ? 'enter api key and prompt please' : (language === 'custom' && !customlanguage) ? 'enter custom language' : isloading ? 'Generating...' : 'Generate Code'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {generatedcode && (
                    <div className="relative">
                        <h3 className="text-lg font-semibold mb-2">Generated Code:</h3>
                        <Syntaxhighlighter language={language} style={style}className="rounded-md">
                            {generatedcode}
                        </Syntaxhighlighter>
                        <CopyToClipboard text={generatedcode} onCopy={handlecopy}>
                            <button className={`absolute top-12 right-3 p-1 rounded ${ copied ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300' } transition-colors`}>
                                {copied ? '✓ Copied' : 'Copy'}
                            </button>
                        </CopyToClipboard>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Groqcodegenerator