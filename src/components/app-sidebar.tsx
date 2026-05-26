'use client'

import * as React from 'react'

import { NavMain } from '#/components/nav-main'
import { NavProjects } from '#/components/nav-projects'
import { NavUser } from '#/components/nav-user'
import { TeamSwitcher } from '#/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '#/components/ui/sidebar'
import { getAuthSession } from '#/features/auth/session'
import {
  BookOpen,
  Bot,
  ChartPie,
  Command,
  Crop,
  Map,
  Rows3,
  Settings,
  Terminal,
  Waves,
} from 'lucide-react'

// This is sample data.
const data = {
  teams: [
    {
      name: 'Acme Inc',
      logo: <Rows3 />,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: <Waves />,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: <Command />,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: <Terminal />,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: <Bot />,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: <BookOpen />,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: <Settings />,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: <Crop />,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: <ChartPie />,
    },
    {
      name: 'Travel',
      url: '#',
      icon: <Map />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = getAuthSession()
  const authenticatedUser = session?.user
  const userName = authenticatedUser?.username ?? authenticatedUser?.email ?? 'User'
  const userEmail = authenticatedUser?.email ?? '—'
  const userAvatar = ''

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: userName,
            email: userEmail,
            avatar: userAvatar,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
