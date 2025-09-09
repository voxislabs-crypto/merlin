"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeftIcon,
  UserIcon,
  SettingsIcon,
  BellIcon,
  PaletteIcon,
  ShieldIcon,
  BarChart3Icon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react"

interface SettingsProfileProps {
  user: {
    id: string
    email: string
    name: string
  }
  onBack: () => void
  onSignOut: () => void
}

export function SettingsProfile({ user, onBack, onSignOut }: SettingsProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(user.name)
  const [editedEmail, setEditedEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)

  // Settings states
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
    updates: true,
  })

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "en",
    autoSave: true,
    analytics: true,
  })

  const handleSaveProfile = () => {
    // In a real app, this would make an API call
    console.log("Saving profile:", { name: editedName, email: editedEmail })
    setIsEditing(false)
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match")
      return
    }
    // In a real app, this would make an API call
    console.log("Changing password")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const usageStats = {
    chatMessages: 1247,
    documentsAnalyzed: 23,
    searchQueries: 89,
    imagesGenerated: 45,
    totalSessions: 156,
    accountCreated: "January 2024",
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
              <SettingsIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Settings & Profile</h1>
              <p className="text-xs text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      Pro User
                    </Badge>
                  </div>
                  <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                {isEditing && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldIcon className="w-5 h-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={showPasswords} onCheckedChange={setShowPasswords} />
                    <Label className="text-sm">Show passwords</Label>
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellIcon className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Marketing Updates</Label>
                    <p className="text-xs text-muted-foreground">Product news and offers</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketing: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Feature Updates</Label>
                    <p className="text-xs text-muted-foreground">New features and improvements</p>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, updates: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PaletteIcon className="w-5 h-5" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto-save Conversations</Label>
                    <p className="text-xs text-muted-foreground">Automatically save chat history</p>
                  </div>
                  <Switch
                    checked={preferences.autoSave}
                    onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, autoSave: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Usage Analytics</Label>
                    <p className="text-xs text-muted-foreground">Help improve the app with usage data</p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, analytics: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="w-5 h-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{usageStats.chatMessages}</p>
                    <p className="text-sm text-muted-foreground">Chat Messages</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-secondary">{usageStats.documentsAnalyzed}</p>
                    <p className="text-sm text-muted-foreground">Documents Analyzed</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{usageStats.searchQueries}</p>
                    <p className="text-sm text-muted-foreground">Search Queries</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-secondary">{usageStats.imagesGenerated}</p>
                    <p className="text-sm text-muted-foreground">Images Generated</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Total Sessions</p>
                      <p className="text-sm text-muted-foreground">Since {usageStats.accountCreated}</p>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {usageStats.totalSessions}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Current Plan</p>
                    <p className="text-sm text-muted-foreground">Pro Plan - Unlimited access</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Account Created</p>
                    <p className="text-sm text-muted-foreground">{usageStats.accountCreated}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Account ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <div>
                    <p className="font-medium text-foreground">Sign Out</p>
                    <p className="text-sm text-muted-foreground">Sign out of your account</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={onSignOut}
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                  >
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
