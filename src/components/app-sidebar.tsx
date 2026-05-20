'use client'

import * as React from 'react'

import { NavMain } from '#/components/nav-main'
// import { NavProjects } from '#/components/nav-projects'
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
import { ClipboardList, Eye, ListChecks, ScanEye, Settings } from 'lucide-react'

// This is sample data.
const data = {
  teams: [
    {
      name: 'APANT',
      logo: <Eye />,
      plan: 'Pentest Platform',
    },
  ],
  navMain: [
    {
      title: 'Scanner',
      url: '#',
      icon: <ScanEye />,
      // isActive: true,
      items: [
        {
          title: 'Dynamic',
          url: '#',
        },
        {
          title: 'Static',
          url: '#',
        },
      ],
    },
    {
      title: 'Reports',
      url: '#',
      icon: <ClipboardList />,
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
      title: 'Recommendations',
      url: '#',
      icon: <ListChecks />,
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
  // projects: [
  //   {
  //     name: 'Design Engineering',
  //     url: '#',
  //     icon: <Crop />,
  //   },
  // ],
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
        {/* <NavProjects projects={data.projects} /> */}
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
