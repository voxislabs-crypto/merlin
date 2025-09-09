"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeftIcon,
  UploadIcon,
  FileTextIcon,
  FileIcon,
  CheckCircleIcon,
  DownloadIcon,
  EyeIcon,
  BrainIcon,
  BarChart3Icon,
  KeyIcon,
} from "lucide-react"

interface AnalyzedDocument {
  id: string
  name: string
  size: string
  type: string
  uploadedAt: Date
  analysis: {
    summary: string
    keyPoints: string[]
    sentiment: "positive" | "neutral" | "negative"
    topics: string[]
    wordCount: number
    readingTime: number
    confidence: number
  }
}

interface DocumentAnalysisProps {
  user: {
    id: string
    email: string
    name: string
  }
  onBack: () => void
}

export function DocumentAnalysis({ user, onBack }: DocumentAnalysisProps) {
  const [documents, setDocuments] = useState<AnalyzedDocument[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<AnalyzedDocument | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, DOC, DOCX, or TXT file.")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setIsUploading(false)
          setIsAnalyzing(true)

          // Simulate analysis
          setTimeout(() => {
            const mockAnalysis: AnalyzedDocument = {
              id: Date.now().toString(),
              name: file.name,
              size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              type: file.type,
              uploadedAt: new Date(),
              analysis: {
                summary:
                  "This document discusses key strategies for improving productivity and workflow efficiency. It covers various methodologies and best practices that can be implemented in professional environments.",
                keyPoints: [
                  "Implementation of agile methodologies increases team productivity by 40%",
                  "Regular feedback loops are essential for continuous improvement",
                  "Automation tools can reduce manual tasks by up to 60%",
                  "Clear communication channels improve project delivery times",
                ],
                sentiment: Math.random() > 0.5 ? "positive" : "neutral",
                topics: ["Productivity", "Workflow", "Management", "Efficiency", "Best Practices"],
                wordCount: Math.floor(Math.random() * 5000) + 1000,
                readingTime: Math.floor(Math.random() * 20) + 5,
                confidence: Math.floor(Math.random() * 20) + 80,
              },
            }

            setDocuments((prev) => [mockAnalysis, ...prev])
            setSelectedDocument(mockAnalysis)
            setIsAnalyzing(false)
          }, 3000)

          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200"
      case "negative":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileTextIcon className="w-5 h-5 text-red-500" />
    if (type.includes("word")) return <FileTextIcon className="w-5 h-5 text-blue-500" />
    return <FileIcon className="w-5 h-5 text-gray-500" />
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
              <FileTextIcon className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Document Analysis</h1>
              <p className="text-xs text-muted-foreground">AI-powered document insights</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <UploadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium text-foreground mb-2">Drop your document here</p>
                  <p className="text-xs text-muted-foreground mb-4">or click to browse files</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isAnalyzing}
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground mt-4">Supports PDF, DOC, DOCX, TXT files</p>
                </div>

                {(isUploading || isAnalyzing) && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{isUploading ? "Uploading..." : "Analyzing..."}</span>
                      <span className="text-muted-foreground">
                        {isUploading ? `${Math.round(uploadProgress)}%` : "Processing"}
                      </span>
                    </div>
                    <Progress value={isUploading ? uploadProgress : undefined} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document List */}
            {documents.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedDocument?.id === doc.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.size} • {doc.uploadedAt.toLocaleDateString()}
                              </p>
                            </div>
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2">
            {selectedDocument ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedDocument.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Analysis completed • Confidence: {selectedDocument.analysis.confidence}%
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="insights">Key Insights</TabsTrigger>
                      <TabsTrigger value="topics">Topics</TabsTrigger>
                      <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <BrainIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">AI Summary</h3>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{selectedDocument.analysis.summary}</p>
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <Badge className={getSentimentColor(selectedDocument.analysis.sentiment)}>
                          {selectedDocument.analysis.sentiment.charAt(0).toUpperCase() +
                            selectedDocument.analysis.sentiment.slice(1)}{" "}
                          Sentiment
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {selectedDocument.analysis.wordCount} words • {selectedDocument.analysis.readingTime} min read
                        </span>
                      </div>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <KeyIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Key Points</h3>
                      </div>
                      <div className="space-y-3">
                        {selectedDocument.analysis.keyPoints.map((point, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-primary-foreground">{index + 1}</span>
                            </div>
                            <p className="text-sm text-foreground">{point}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="topics" className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3Icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Identified Topics</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedDocument.analysis.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="metrics" className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{selectedDocument.analysis.wordCount}</p>
                            <p className="text-xs text-muted-foreground">Words</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{selectedDocument.analysis.readingTime}</p>
                            <p className="text-xs text-muted-foreground">Min Read</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{selectedDocument.analysis.confidence}%</p>
                            <p className="text-xs text-muted-foreground">Confidence</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{selectedDocument.analysis.topics.length}</p>
                            <p className="text-xs text-muted-foreground">Topics</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileTextIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Document Selected</h3>
                  <p className="text-muted-foreground">Upload a document to get started with AI-powered analysis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
