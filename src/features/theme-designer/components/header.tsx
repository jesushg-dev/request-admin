"use client";

import discordIconUrl from "@/assets/discord.svg";
import figmaIconUrl from "@/assets/figma.svg";
import githubIconUrl from "@/assets/github.svg";
import logoUrl from "@/assets/logo.svg";
import twitterIconUrl from "@/assets/twitter.svg";
import { FigmaExportDialog } from "@/features/theme-designer/components/figma-export-dialog";
import { SocialLink } from "@/features/theme-designer/components/social-link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserProfileDropdown } from "@/features/theme-designer/components/user-profile-dropdown";
import { useGithubStars } from "@/features/theme-designer/hooks/use-github-stars";
import { formatCompactNumber } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GetProCTA } from "./get-pro-cta";

export function Header() {
  const { stargazersCount } = useGithubStars("jnsahaj", "tweakcn");
  const [figmaDialogOpen, setFigmaDialogOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logoUrl} alt="tweakcn" width={24} height={24} className="size-6" />
            <span className="hidden font-bold md:block">tweakcn</span>
          </Link>
        </div>
        <div className="flex items-center gap-3.5">
          <GetProCTA className="h-8" />

          <SocialLink
            href="https://github.com/jnsahaj/tweakcn"
            className="flex items-center gap-2 text-sm font-bold"
          >
            <Image src={githubIconUrl} alt="GitHub" width={16} height={16} className="size-4" />
            {stargazersCount > 0 && formatCompactNumber(stargazersCount)}
          </SocialLink>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex items-center gap-3.5">
            <div className="hidden items-center gap-3.5 md:flex">
              <SocialLink href="https://discord.gg/Phs4u2NM3n">
                <Image src={discordIconUrl} alt="Discord" width={20} height={20} className="size-5" />
              </SocialLink>
            </div>
            <SocialLink href="https://x.com/iamsahaj_xyz">
              <Image src={twitterIconUrl} alt="Twitter" width={16} height={16} className="size-4" />
            </SocialLink>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <Button
            onClick={() => setFigmaDialogOpen(true)}
            variant="outline"
            className="flex h-8 items-center gap-2"
          >
            <Image src={figmaIconUrl} alt="Figma" width={16} height={16} className="size-4" />
            Export to Figma
          </Button>
          <UserProfileDropdown />
        </div>
      </div>

      <FigmaExportDialog open={figmaDialogOpen} onOpenChange={setFigmaDialogOpen} />
    </header>
  );
}
