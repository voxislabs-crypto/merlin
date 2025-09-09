"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeftIcon,
  SearchIcon,
  ExternalLinkIcon,
  ClockIcon,
  TrendingUpIcon,
  BookmarkIcon,
  FilterIcon,
  SparklesIcon,
  GlobeIcon,
  CalendarIcon,
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  url: string
  snippet: string
  aiSummary: string
  domain: string
  publishedDate?: string
  relevanceScore: number
  category: string
}

interface SearchQuery {
  id: string
  query: string
  timestamp: Date
  resultsCount: number
}

interface WebSearchProps {
  user: {
    id: string
    email: string
    name: string
  }
  onBack: () => void
}

export function WebSearch({ user, onBack }: WebSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchQuery[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentQuery, setCurrentQuery] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  const mockSearchResults: SearchResult[] = [
    {
      id: "1",
      title: "The Future of Artificial Intelligence in 2024",
      url: "https://example.com/ai-future-2024",
      snippet:
        "Artificial intelligence continues to evolve rapidly, with new breakthroughs in machine learning, natural language processing, and computer vision...",
      aiSummary:
        "This article discusses the latest developments in AI technology, focusing on machine learning advancements, ethical considerations, and practical applications across various industries. Key points include the rise of generative AI, improved natural language understanding, and the growing importance of AI safety measures.",
      domain: "example.com",
      publishedDate: "2024-01-15",
      relevanceScore: 95,
      category: "Technology",
    },
    {
      id: "2",
      title: "Machine Learning Best Practices for Developers",
      url: "https://techblog.com/ml-best-practices",
      snippet:
        "Learn essential machine learning practices that every developer should know, including data preprocessing, model selection, and deployment strategies...",
      aiSummary:
        "A comprehensive guide covering fundamental ML practices including data quality assessment, feature engineering, model validation techniques, and production deployment considerations. Emphasizes the importance of continuous monitoring and iterative improvement in ML systems.",
      domain: "techblog.com",
      publishedDate: "2024-01-10",
      relevanceScore: 88,
      category: "Technology",
    },
    {
      id: "3",
      title: "Understanding Neural Networks: A Beginner's Guide",
      url: "https://learningai.org/neural-networks-guide",
      snippet:
        "Neural networks are the backbone of modern AI systems. This guide explains how they work, their applications, and how to get started...",
      aiSummary:
        "An educational resource that breaks down neural network concepts into digestible explanations. Covers basic architecture, training processes, common applications, and provides practical examples for beginners to understand how neural networks function in AI systems.",
      domain: "learningai.org",
      publishedDate: "2024-01-08",
      relevanceScore: 82,
      category: "Education",
    },
    {
      id: "4",
      title: "AI Ethics and Responsible Development",
      url: "https://ethicsai.com/responsible-ai-development",
      snippet:
        "As AI becomes more prevalent, the importance of ethical considerations and responsible development practices cannot be overstated...",
      aiSummary:
        "Explores critical ethical considerations in AI development including bias mitigation, transparency, accountability, and fairness. Discusses frameworks for responsible AI development and the importance of diverse perspectives in creating equitable AI systems.",
      domain: "ethicsai.com",
      publishedDate: "2024-01-05",
      relevanceScore: 79,
      category: "Ethics",
    },
  ]

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setCurrentQuery(searchQuery)

    // Add to search history
    const newQuery: SearchQuery = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: new Date(),
      resultsCount: mockSearchResults.length,
    }
    setSearchHistory((prev) => [newQuery, ...prev.slice(0, 9)]) // Keep last 10 searches

    // Simulate search delay
    setTimeout(() => {
      setSearchResults(mockSearchResults)
      setIsSearching(false)
    }, 1500)
  }

  const handleHistorySearch = (query: string) => {
    setSearchQuery(query)
    setCurrentQuery(query)
    setSearchResults(mockSearchResults)
  }

  const getFilteredResults = () => {
    if (selectedCategory === "all") return searchResults
    return searchResults.filter((result) => result.category.toLowerCase() === selectedCategory.toLowerCase())
  }

  const categories = ["all", "technology", "education", "ethics", "business", "science"]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 80) return "bg-blue-100 text-blue-800 border-blue-200"
    if (score >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
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
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <SearchIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Web Search</h1>
              <p className="text-xs text-muted-foreground">AI-powered intelligent search</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the web with AI-powered insights..."
                  className="pl-10 py-3 text-sm"
                  disabled={isSearching}
                />
              </div>
              <Button type="submit" disabled={!searchQuery.trim() || isSearching} className="px-6">
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : (
                  <>
                    <SearchIcon className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FilterIcon className="w-4 h-4" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {searchHistory.map((query) => (
                        <div
                          key={query.id}
                          className="p-2 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => handleHistorySearch(query.query)}
                        >
                          <p className="text-sm font-medium text-foreground truncate">{query.query}</p>
                          <p className="text-xs text-muted-foreground">
                            {query.resultsCount} results • {query.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {currentQuery && !isSearching && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Search results for "<span className="font-medium text-foreground">{currentQuery}</span>" •{" "}
                  {getFilteredResults().length} results found
                </p>
              </div>
            )}

            {isSearching ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Searching the web...</h3>
                  <p className="text-muted-foreground">AI is analyzing and summarizing results for you</p>
                </CardContent>
              </Card>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {getFilteredResults().map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <GlobeIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{result.domain}</span>
                            {result.publishedDate && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(result.publishedDate)}
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary cursor-pointer">
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              {result.title}
                              <ExternalLinkIcon className="w-4 h-4" />
                            </a>
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRelevanceColor(result.relevanceScore)}>
                            {result.relevanceScore}% match
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <BookmarkIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <Tabs defaultValue="snippet" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="snippet">Original</TabsTrigger>
                          <TabsTrigger value="summary">AI Summary</TabsTrigger>
                        </TabsList>

                        <TabsContent value="snippet" className="mt-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">{result.snippet}</p>
                        </TabsContent>

                        <TabsContent value="summary" className="mt-4">
                          <div className="flex items-start gap-2">
                            <SparklesIcon className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <p className="text-sm text-foreground leading-relaxed">{result.aiSummary}</p>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <Badge variant="secondary">{result.category}</Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={result.url} target="_blank" rel="noopener noreferrer">
                              Visit Site
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : currentQuery ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse different categories
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUpIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Start Your Search</h3>
                  <p className="text-muted-foreground mb-4">
                    Enter a query above to search the web with AI-powered insights
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => setSearchQuery("artificial intelligence trends")}
                    >
                      AI Trends
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => setSearchQuery("machine learning tutorials")}
                    >
                      ML Tutorials
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => setSearchQuery("web development best practices")}
                    >
                      Web Dev
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => setSearchQuery("data science projects")}
                    >
                      Data Science
                    </Badge>
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
