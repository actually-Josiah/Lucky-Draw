"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Settings, User } from "lucide-react"

interface UserMenuProps {
  onOpenUpdateProfile: () => void
}

export default function UserMenu({ onOpenUpdateProfile }: UserMenuProps) {
  const [userName] = useState("John Doe")

  return (
    <div className="fixed top-4 right-4 z-40 md:top-6 md:right-6">
      <div className="flex items-center gap-4">
        <Button className="hidden md:flex bg-primary hover:bg-primary/90">Play Now</Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="size-10">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">{userName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem disabled>
              <User className="mr-2 size-4" />
              <span>{userName}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenUpdateProfile}>
              <User className="mr-2 size-4" />
              <span>Update Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
