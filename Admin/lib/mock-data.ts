export interface User {
  id: string
  name: string
  email: string
  phone_number: string
  tokens: number
  joinedAt: string
}

export interface Game {
  id: string
  title: string
  description: string
  range: number
  status: "active" | "closed" | "revealed"
  createdAt: string
  winningNumber?: number
}

export interface GameEntry {
  userId: string
  userName: string
  numbers: number[]
}

export interface Payment {
  id: string
  userId: string
  userName: string
  amount: number
  tokensPurchased: number
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  createdAt: string
  read: boolean
}

export const mockUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", phone_number: "123-456-7890", tokens: 150, joinedAt: "2024-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", phone_number: "123-456-7890", tokens: 320, joinedAt: "2024-02-20" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", phone_number: "123-456-7890", tokens: 75, joinedAt: "2024-03-10" },
  { id: "4", name: "Sarah Williams", email: "sarah@example.com", phone_number: "123-456-7890", tokens: 500, joinedAt: "2024-01-28" },
  { id: "5", name: "Alex Brown", email: "alex@example.com", phone_number: "123-456-7890", tokens: 200, joinedAt: "2024-04-05" },
  { id: "6", name: "Emily Davis", email: "emily@example.com", phone_number: "123-456-7890", tokens: 180, joinedAt: "2024-02-14" },
  { id: "7", name: "Chris Wilson", email: "chris@example.com", phone_number: "123-456-7890", tokens: 90, joinedAt: "2024-03-22" },
  { id: "8", name: "Lisa Anderson", email: "lisa@example.com", phone_number: "123-456-7890", tokens: 410, joinedAt: "2024-01-05" },
]

export const mockGames: Game[] = [
  {
    id: "1",
    title: "Mega Jackpot",
    description: "Pick a number between 1-100 for the mega jackpot!",
    range: 100,
    status: "active",
    createdAt: "2024-11-25",
  },
  {
    id: "2",
    title: "Lucky Fifty",
    description: "50 numbers, double the chances!",
    range: 50,
    status: "closed",
    createdAt: "2024-11-20",
  },
  {
    id: "3",
    title: "Quick Eight",
    description: "Fast game with only 8 numbers!",
    range: 8,
    status: "revealed",
    createdAt: "2024-11-15",
    winningNumber: 5,
  },
]

export const mockGameEntries: Record<string, GameEntry[]> = {
  "1": [
    { userId: "1", userName: "John Doe", numbers: [42, 67, 89] },
    { userId: "2", userName: "Jane Smith", numbers: [15, 33] },
    { userId: "3", userName: "Mike Johnson", numbers: [77] },
    { userId: "4", userName: "Sarah Williams", numbers: [22, 45, 88, 91] },
  ],
  "2": [
    { userId: "1", userName: "John Doe", numbers: [12, 34] },
    { userId: "5", userName: "Alex Brown", numbers: [7, 21, 49] },
    { userId: "6", userName: "Emily Davis", numbers: [28] },
  ],
  "3": [
    { userId: "2", userName: "Jane Smith", numbers: [5, 8] },
    { userId: "3", userName: "Mike Johnson", numbers: [3] },
    { userId: "4", userName: "Sarah Williams", numbers: [5, 2] },
    { userId: "7", userName: "Chris Wilson", numbers: [6, 7, 8] },
  ],
}

export const mockGameHistory: (Game & { winners?: string[] })[] = [
  {
    id: "3",
    title: "Quick Eight",
    description: "Fast game with only 8 numbers!",
    range: 8,
    status: "revealed",
    createdAt: "2024-11-15",
    winningNumber: 5,
    winners: ["Jane Smith", "Sarah Williams"],
  },
  {
    id: "4",
    title: "Century Challenge",
    description: "The classic 100 number lottery!",
    range: 100,
    status: "revealed",
    createdAt: "2024-11-10",
    winningNumber: 73,
    winners: ["Alex Brown"],
  },
  {
    id: "5",
    title: "Dozen Draw",
    description: "Only 12 numbers - high stakes!",
    range: 12,
    status: "revealed",
    createdAt: "2024-11-05",
    winningNumber: 9,
    winners: [],
  },
]

export const mockPayments: Payment[] = [
  { id: "1", userId: "1", userName: "John Doe", amount: 50, tokensPurchased: 500, createdAt: "2024-11-28" },
  { id: "2", userId: "2", userName: "Jane Smith", amount: 100, tokensPurchased: 1100, createdAt: "2024-11-27" },
  { id: "3", userId: "4", userName: "Sarah Williams", amount: 25, tokensPurchased: 250, createdAt: "2024-11-26" },
  { id: "4", userId: "5", userName: "Alex Brown", amount: 75, tokensPurchased: 800, createdAt: "2024-11-25" },
  { id: "5", userId: "6", userName: "Emily Davis", amount: 30, tokensPurchased: 300, createdAt: "2024-11-24" },
  { id: "6", userId: "8", userName: "Lisa Anderson", amount: 200, tokensPurchased: 2200, createdAt: "2024-11-23" },
]

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New User Registration",
    message: "Chris Wilson has registered a new account.",
    type: "info",
    createdAt: "2024-11-28T14:30:00",
    read: false,
  },
  {
    id: "2",
    title: "Game Completed",
    message: "Quick Eight lottery has ended. Winner: Jane Smith",
    type: "success",
    createdAt: "2024-11-28T12:00:00",
    read: false,
  },
  {
    id: "3",
    title: "Large Purchase",
    message: "Lisa Anderson purchased 2200 tokens ($200)",
    type: "warning",
    createdAt: "2024-11-27T18:45:00",
    read: true,
  },
  {
    id: "4",
    title: "System Alert",
    message: "Scheduled maintenance in 2 hours.",
    type: "error",
    createdAt: "2024-11-27T10:00:00",
    read: true,
  },
  {
    id: "5",
    title: "New Game Created",
    message: "Mega Jackpot lottery is now active.",
    type: "success",
    createdAt: "2024-11-25T09:00:00",
    read: true,
  },
]
