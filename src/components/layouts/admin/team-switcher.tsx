'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { ChevronsUpDown, Plus } from 'lucide-react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';

interface TeamUser {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  userTenants: {
    isCurrent: boolean;
  }[];
}

export function TeamSwitcher({ teams, onTeamChange }: { teams: TeamUser[]; onTeamChange: (teamId: string) => void }) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState<TeamUser | undefined>();

  React.useEffect(() => {
    const activeTeam = teams.find((team) => team.userTenants.some((userTenant) => userTenant.isCurrent));

    if (activeTeam) {
      setActiveTeam(activeTeam);
    } else if (teams.length > 0) {
      setActiveTeam(teams[0]);
    }
  }, [teams]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg border border-dashed bg-accent p-0.5">
                {activeTeam?.logoUrl && (
                  <Avatar>
                    <AvatarImage src={activeTeam.logoUrl ?? ''} alt={activeTeam.name} style={{ objectFit: 'contain', objectPosition: 'center' }} />
                    <AvatarFallback>RE</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeTeam?.name}</span>
                <span className="truncate text-xs">{activeTeam?.description}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem key={team.id} onClick={() => onTeamChange(team.id)} className="cursor-pointer gap-2 p-2 hover:bg-accent">
                <div className="flex aspect-square size-6 items-center justify-center rounded-lg border border-dashed bg-accent p-0.5">
                  {team?.logoUrl && (
                    <Avatar>
                      <AvatarImage src={team.logoUrl ?? ''} alt={team.name} style={{ objectFit: 'contain', objectPosition: 'center' }} />
                      <AvatarFallback>RE</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
