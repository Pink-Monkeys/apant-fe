import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

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
import { authSessionKey, getAuthSession } from '#/features/auth/session'
import {
  Bot,
  ClipboardList,
  Eye,
  LayoutDashboard,
  ListChecks,
  ScanEye,
  Settings,
} from 'lucide-react'

const teams = [
  {
    name: 'APANT',
    logo: <Eye />,
    plan: 'Pentest Platform',
  },
]

type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  items?: { title: string; url: string }[]
}

// Builds the sidebar menu. The LLM group is role-aware: admins see both
// management and selection, pentesters only selection. This is UX-only — the
// backend independently enforces admin-only endpoints.
function buildNavMain(isAdmin: boolean): NavItem[] {
  const llmItems = [
    ...(isAdmin ? [{ title: 'Manage LLM', url: '/llm/manage' }] : []),
    { title: 'Select LLM', url: '/llm/select' },
  ]

  return [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboard />,
    },
    {
      title: 'Scanner',
      url: '',
      icon: <ScanEye />,
      items: [
        { title: 'Dynamic', url: '/scanner/dynamic' },
        { title: 'Static', url: '/scanner/static' },
        { title: 'Scan List', url: '/scanner/list' },
      ],
    },
    {
      title: 'LLM',
      url: '#',
      icon: <Bot />,
      items: llmItems,
    },
    {
      title: 'Reports',
      url: '#',
      icon: <ClipboardList />,
      items: [{ title: 'List Reports', url: '/reports' }],
    },
    {
      title: 'Recommendations',
      url: '#',
      icon: <ListChecks />,
      items: [{ title: 'Remediation', url: '/recommendations' }],
    },
    {
      title: 'Settings',
      url: '#',
      icon: <Settings />,
      items: [
        { title: 'Account', url: '/settings/account' },
        { title: 'About', url: '/settings/about' },
      ],
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useQuery({
    queryKey: authSessionKey,
    queryFn: () => getAuthSession(),
    initialData: getAuthSession(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
  const authenticatedUser = session?.user
  const userName = authenticatedUser?.username ?? authenticatedUser?.email ?? 'User'
  const userEmail = authenticatedUser?.email ?? '—'
  const userAvatar = ''
  const isAdmin = authenticatedUser?.role === 'admin'
  const navMain = buildNavMain(isAdmin)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
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
