'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Copy, Download, Eye } from 'lucide-react'

interface WidgetConfig {
  compact: boolean
  showSettings: boolean
  refreshInterval: number // minutes
  showResonance: boolean
  showIntensity: boolean
  showDoDont: boolean
  theme: 'light' | 'dark' | 'auto'
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

interface WidgetConfigProps {
  userId: string
  onSave?: (config: WidgetConfig) => void
}

const defaultConfig: WidgetConfig = {
  compact: false,
  showSettings: true,
  refreshInterval: 60,
  showResonance: true,
  showIntensity: true,
  showDoDont: true,
  theme: 'auto',
  position: 'top-right'
}

export default function WidgetConfig({ userId, onSave }: WidgetConfigProps) {
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig)
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [userId])

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/widget/config?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error loading widget config:', error)
    }
  }

  const saveConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/widget/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...config })
      })

      if (!response.ok) throw new Error('Failed to save config')

      toast.success('Widget configuration saved')
      onSave?.(config)
    } catch (error) {
      console.error('Error saving widget config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const generateEmbedCode = () => {
    const embedCode = `<script src="${window.location.origin}/widget.js" data-user-id="${userId}" data-config="${btoa(JSON.stringify(config))}"></script>`
    navigator.clipboard.writeText(embedCode)
    toast.success('Embed code copied to clipboard')
  }

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'merlin-widget-config.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Configuration</CardTitle>
          <CardDescription>
            Customize your Merlin cosmic widget appearance and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Options */}
          <div className="space-y-4">
            <h3 className="font-medium">Display Options</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="compact">Compact Mode</Label>
              <Switch
                id="compact"
                checked={config.compact}
                onCheckedChange={(checked) => updateConfig({ compact: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-settings">Show Settings Button</Label>
              <Switch
                id="show-settings"
                checked={config.showSettings}
                onCheckedChange={(checked) => updateConfig({ showSettings: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-resonance">Show Resonance</Label>
              <Switch
                id="show-resonance"
                checked={config.showResonance}
                onCheckedChange={(checked) => updateConfig({ showResonance: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-intensity">Show Intensity</Label>
              <Switch
                id="show-intensity"
                checked={config.showIntensity}
                onCheckedChange={(checked) => updateConfig({ showIntensity: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-dodont">Show Do/Don't Lists</Label>
              <Switch
                id="show-dodont"
                checked={config.showDoDont}
                onCheckedChange={(checked) => updateConfig({ showDoDont: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* Behavior */}
          <div className="space-y-4">
            <h3 className="font-medium">Behavior</h3>
            
            <div>
              <Label htmlFor="refresh-interval">
                Refresh Interval: {config.refreshInterval} minutes
              </Label>
              <Slider
                id="refresh-interval"
                min={5}
                max={1440} // 24 hours
                step={5}
                value={[config.refreshInterval]}
                onValueChange={([value]) => updateConfig({ refreshInterval: value })}
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="font-medium">Appearance</h3>
            
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={config.theme}
                onValueChange={(value: 'light' | 'dark' | 'auto') => 
                  updateConfig({ theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Select
                value={config.position}
                onValueChange={(value: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') => 
                  updateConfig({ position: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Preview</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {showPreview && (
          <CardContent>
            <div className="flex justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div style={{ transform: 'scale(0.8)' }}>
                {/* Import CosmicWidget here - simplified preview */}
                <div className="text-center text-gray-500">
                  Widget preview would appear here
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={saveConfig}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
            
            <Button
              variant="outline"
              onClick={generateEmbedCode}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Embed Code
            </Button>
            
            <Button
              variant="outline"
              onClick={exportConfig}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setConfig(defaultConfig)}
              className="w-full"
            >
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
