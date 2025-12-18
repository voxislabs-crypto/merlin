import { clerkClient } from '@clerk/nextjs/server'

export async function createClerkClient() {
  return clerkClient()
}

export async function getCurrentUser() {
  const client = await createClerkClient()
  return client.users.getUserList()
}

export async function getUserById(userId: string) {
  const client = await createClerkClient()
  return client.users.getUser(userId)
}
