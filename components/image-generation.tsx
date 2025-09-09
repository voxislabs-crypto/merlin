"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  ArrowLeftIcon,
  ImageIcon,
  DownloadIcon,
  ShareIcon,
  SparklesIcon,
  PaletteIcon,
  SettingsIcon,
  HistoryIcon,
  WandIcon,
} from "lucide-react"

interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
  style: string
  aspectRatio: string
  createdAt: Date
  settings: {
    quality: number
    creativity: number
    style: string
  }
}

interface ImageGenerationProps {
  user: {
    id: string
    email: string
    name: string
  }
  onBack: () => void
}

export function ImageGeneration({ user, onBack }: ImageGenerationProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)

  // Generation settings
  const [style, setStyle] = useState("realistic")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [quality, setQuality] = useState([80])
  const [creativity, setCreativity] = useState([70])

  const promptRef = useRef<HTMLTextAreaElement>(null)

  const styleOptions = [
    { value: "realistic", label: "Realistic", description: "Photorealistic images" },
    { value: "artistic", label: "Artistic", description: "Painterly and creative" },
    { value: "digital-art", label: "Digital Art", description: "Modern digital artwork" },
    { value: "anime", label: "Anime", description: "Japanese animation style" },
    { value: "sketch", label: "Sketch", description: "Hand-drawn sketches" },
    { value: "watercolor", label: "Watercolor", description: "Watercolor painting style" },
  ]

  const aspectRatioOptions = [
    { value: "1:1", label: "Square (1:1)", width: "512px", height: "512px" },
    { value: "16:9", label: "Landscape (16:9)", width: "768px", height: "432px" },
    { value: "9:16", label: "Portrait (9:16)", width: "432px", height: "768px" },
    { value: "4:3", label: "Standard (4:3)", width: "640px", height: "480px" },
    { value: "3:4", label: "Portrait (3:4)", width: "480px", height: "640px" },
  ]

  const promptSuggestions = [
    "A serene mountain landscape at sunset with golden light",
    "A futuristic city with flying cars and neon lights",
    "A cozy coffee shop interior with warm lighting",
    "An abstract geometric pattern in vibrant colors",
    "A magical forest with glowing mushrooms and fireflies",
    "A minimalist modern living room with natural light",
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)

          // Create mock generated image
          const newImage: GeneratedImage = {
            id: Date.now().toString(),
            prompt: prompt.trim(),
            imageUrl: `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(prompt.trim())}`,
            style,
            aspectRatio,
            createdAt: new Date(),
            settings: {
              quality: quality[0],
              creativity: creativity[0],
              style,
            },
          }

          setGeneratedImages((prev) => [newImage, ...prev])
          setSelectedImage(newImage)
          setIsGenerating(false)
          setGenerationProgress(0)

          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)
  }

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion)
    promptRef.current?.focus()
  }

  const handleDownload = (image: GeneratedImage) => {
    // In a real app, this would download the actual image
    const link = document.createElement("a")
    link.href = image.imageUrl
    link.download = `merlin-generated-${image.id}.png`
    link.click()
  }

  const handleShare = (image: GeneratedImage) => {
    if (navigator.share) {
      navigator.share({
        title: "Generated Image",
        text: `Check out this AI-generated image: "${image.prompt}"`,
        url: image.imageUrl,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Check out this AI-generated image: "${image.prompt}" - ${image.imageUrl}`)
    }
  }

  const getAspectRatioStyle = (ratio: string) => {
    const option = aspectRatioOptions.find((opt) => opt.value === ratio)
    if (!option) return {}

    return {
      width: option.width,
      height: option.height,
      maxWidth: "100%",
      maxHeight: "400px",
      objectFit: "cover" as const,
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Image Generation</h1>
              <p className="text-xs text-muted-foreground">Create stunning images from text</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generation Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <WandIcon className="w-4 h-4" />
                  Describe Your Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Image Prompt</Label>
                  <Textarea
                    ref={promptRef}
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="min-h-[100px] resize-none"
                    disabled={isGenerating}
                  />
                </div>

                <Button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="w-full">
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating... {Math.round(generationProgress)}%
                    </div>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Style Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatioOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quality: {quality[0]}%</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={10}
                    step={10}
                    disabled={isGenerating}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Creativity: {creativity[0]}%</Label>
                  <Slider
                    value={creativity}
                    onValueChange={setCreativity}
                    max={100}
                    min={10}
                    step={10}
                    disabled={isGenerating}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Prompt Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PaletteIcon className="w-4 h-4" />
                  Inspiration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {promptSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-3 text-wrap"
                      onClick={() => handlePromptSuggestion(suggestion)}
                      disabled={isGenerating}
                    >
                      <span className="text-sm">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Images */}
          <div className="lg:col-span-2">
            {selectedImage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Generated Image</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created {selectedImage.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(selectedImage)}>
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleShare(selectedImage)}>
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={selectedImage.imageUrl || "/placeholder.svg"}
                        alt={selectedImage.prompt}
                        style={getAspectRatioStyle(selectedImage.aspectRatio)}
                        className="rounded-lg border shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Prompt</Label>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{selectedImage.prompt}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{selectedImage.style}</Badge>
                      <Badge variant="outline">{selectedImage.aspectRatio}</Badge>
                      <Badge variant="outline">Quality: {selectedImage.settings.quality}%</Badge>
                      <Badge variant="outline">Creativity: {selectedImage.settings.creativity}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : generatedImages.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HistoryIcon className="w-4 h-4" />
                    Generated Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {generatedImages.map((image) => (
                        <div key={image.id} className="cursor-pointer group" onClick={() => setSelectedImage(image)}>
                          <div className="relative overflow-hidden rounded-lg border">
                            <img
                              src={image.imageUrl || "/placeholder.svg"}
                              alt={image.prompt}
                              className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{image.prompt}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Images Generated Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Enter a prompt and click generate to create your first AI image
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {promptSuggestions.slice(0, 3).map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handlePromptSuggestion(suggestion)}
                      >
                        {suggestion.split(" ").slice(0, 3).join(" ")}...
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generation History */}
            {generatedImages.length > 0 && !selectedImage && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Generations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedImages.slice(0, 5).map((image) => (
                      <div
                        key={image.id}
                        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image.imageUrl || "/placeholder.svg"}
                          alt={image.prompt}
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{image.prompt}</p>
                          <p className="text-xs text-muted-foreground">
                            {image.createdAt.toLocaleDateString()} • {image.style}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
