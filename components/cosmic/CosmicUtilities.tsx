'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  MessageCircle,
  Image,
  FileText,
  RefreshCw,
  Sparkles,
  Download,
  Share,
  Book,
  Lightbulb,
  Zap
} from 'lucide-react'

interface CosmicUtilitiesProps {
  userId: string
  userProfile?: {
    name: string
    mbti?: string
    zodiacSign?: string
  }
}

export default function CosmicUtilities({ userId, userProfile }: CosmicUtilitiesProps) {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isChatting, setIsChatting] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [reframingText, setReframingText] = useState('')
  const [reframedResult, setReframedResult] = useState('')
  const [isReframing, setIsReframing] = useState(false)

  const handleChatSubmit = async () => {
    if (!currentMessage.trim()) return

    setIsChatting(true)
    const userMessage = { role: 'user', content: currentMessage }
    setChatMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/cosmic/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: currentMessage,
          context: {
            userProfile,
            previousMessages: chatMessages.slice(-5) // Last 5 messages for context
          }
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      setCurrentMessage('')
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsChatting(false)
    }
  }

  const handleImageGeneration = async () => {
    if (!imagePrompt.trim()) return

    setIsGeneratingImage(true)

    try {
      const response = await fetch('/api/cosmic/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          prompt: imagePrompt,
          style: 'cosmic',
          userProfile
        })
      })

      if (!response.ok) throw new Error('Failed to generate image')

      const data = await response.json()
      toast.success('Image generated successfully!')
      setImagePrompt('')

      // Open image in new tab or show in modal
      window.open(data.imageUrl, '_blank')
    } catch (error) {
      console.error('Image generation error:', error)
      toast.error('Failed to generate image')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleReframing = async () => {
    if (!reframingText.trim()) return

    setIsReframing(true)

    try {
      const response = await fetch('/api/cosmic/reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          text: reframingText,
          context: {
            userProfile,
            intent: 'cosmic-perspective'
          }
        })
      })

      if (!response.ok) throw new Error('Failed to reframe text')

      const data = await response.json()
      setReframedResult(data.reframedText)
      toast.success('Text reframed with cosmic wisdom')
    } catch (error) {
      console.error('Reframing error:', error)
      toast.error('Failed to reframe text')
    } finally {
      setIsReframing(false)
    }
  }

  const handleDocsSearch = async (query: string) => {
    try {
      const response = await fetch(`/api/cosmic/docs/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Failed to search docs')

      const data = await response.json()
      // Open docs results in new tab or modal
      window.open('/cosmic-docs?results=' + encodeURIComponent(JSON.stringify(data.results)), '_blank')
    } catch (error) {
      console.error('Docs search error:', error)
      toast.error('Failed to search documentation')
    }
  }

  const getQuickPrompts = () => {
    const prompts = [
      'What cosmic energy surrounds me today?',
      'How should I approach my relationships?',
      'What career opportunities are emerging?',
      'Help me understand this challenge...',
      'What does my birth chart reveal about my purpose?'
    ];

    if (userProfile?.mbti) {
      prompts.push(`How can I, as an ${userProfile.mbti}, best navigate today's energy?`);
    }

    return prompts;
  };

  const getImageStyles = () => [
    { value: 'cosmic', label: 'Cosmic Vision', description: 'Mystical, celestial imagery' },
    { value: 'mandala', label: 'Sacred Mandala', description: 'Geometric spiritual patterns' },
    { value: 'astrological', label: 'Astrological Chart', description: 'Birth chart visualizations' },
    { value: 'oracle', label: 'Oracle Card', description: 'Divination card style' }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span>Cosmic Utilities</span>
          </CardTitle>
          <CardDescription>
            Your personal toolkit for cosmic wisdom and creative exploration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Create</span>
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="reframe" className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Reframe</span>
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4">
              <div className="h-[400px] border rounded-lg p-4">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="mb-4">Start a conversation with Merlin</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {getQuickPrompts().slice(0, 3).map((prompt, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer hover:bg-blue-100"
                              onClick={() => setCurrentMessage(prompt)}
                            >
                              {prompt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex space-x-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask Merlin anything..."
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  disabled={isChatting}
                />
                <Button onClick={handleChatSubmit} disabled={isChatting}>
                  {isChatting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Image Generation Tab */}
            <TabsContent value="image" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Cosmic Vision Prompt</label>
                  <Textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the cosmic image you want to create..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Style:</label>
                  <select className="px-3 py-2 border rounded-md">
                    {getImageStyles().map(style => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleImageGeneration}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full"
                >
                  {isGeneratingImage ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4 mr-2" />
                  )}
                  Generate Cosmic Image
                </Button>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'My spirit animal in cosmic form',
                    'Birth chart as celestial art',
                    'Soul journey visualization',
                    'Cosmic energy field',
                    'Sacred geometry pattern',
                    'Astrological mandala'
                  ].map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setImagePrompt(prompt)}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value="docs" className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Search cosmic documentation..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleDocsSearch((e.target as HTMLInputElement).value)
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Book className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">Astrology Guide</h3>
                          <p className="text-sm text-gray-600">
                            Complete guide to astrological concepts
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Zap className="h-8 w-8 text-purple-600" />
                        <div>
                          <h3 className="font-medium">Aspect Reference</h3>
                          <p className="text-sm text-gray-600">
                            Planetary aspects and their meanings
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Sparkles className="h-8 w-8 text-green-600" />
                        <div>
                          <h3 className="font-medium">Symbol Dictionary</h3>
                          <p className="text-sm text-gray-600">
                            Cosmic symbols and interpretations
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Lightbulb className="h-8 w-8 text-yellow-600" />
                        <div>
                          <h3 className="font-medium">Rituals & Practices</h3>
                          <p className="text-sm text-gray-600">
                            Spiritual practices and rituals
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Reframing Tab */}
            <TabsContent value="reframe" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Text to Reframe</label>
                  <Textarea
                    value={reframingText}
                    onChange={(e) => setReframingText(e.target.value)}
                    placeholder="Enter a challenge, negative thought, or situation you'd like to reframe with cosmic wisdom..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleReframing}
                  disabled={isReframing || !reframingText.trim()}
                  className="w-full"
                >
                  {isReframing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="h-4 w-4 mr-2" />
                  )}
                  Reframe with Cosmic Wisdom
                </Button>

                {reframedResult && (
                  <div className="bg-linear-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-medium text-purple-900 mb-2">Cosmic Reframing</h3>
                    <p className="text-purple-800 leading-relaxed">{reframedResult}</p>
                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(reframedResult)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const subject = encodeURIComponent('Cosmic Wisdom')
                          const body = encodeURIComponent(reframedResult)
                          window.open(`mailto:?subject=${subject}&body=${body}`)
                        }}
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Quick Reframes:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'I feel overwhelmed by responsibilities',
                      'This relationship feels stuck',
                      'I\'m afraid of making the wrong choice',
                      'Why is this happening to me?',
                      'I\'m not good enough'
                    ].map((text, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setReframingText(text)}
                        className="text-xs justify-start"
                      >
                        {text}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
