'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';

interface PedigreeHorse {
  id: string;
  barnName: string;
  profilePhotoUrl?: string | null;
}

interface PedigreeCardProps {
  horse: {
    id: string;
    barnName: string;
    sireId?: string | null;
    damId?: string | null;
  };
  sire?: PedigreeHorse | null;
  dam?: PedigreeHorse | null;
  offspring?: PedigreeHorse[];
  externalSire?: { name: string; studFarm?: string | null } | null;
}

export function PedigreeCard({ horse, sire, dam, offspring = [], externalSire }: PedigreeCardProps) {
  return (
    <div className="card p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">{horse.barnName}&apos;s Parents &amp; Offspring</h3>

      <div className="space-y-4">
        {/* Parents */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Sire (Father)</p>
            {sire ? (
              <Link href={`/horses/${sire.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {sire.profilePhotoUrl ? (
                    <Image src={sire.profilePhotoUrl} alt="" fill unoptimized className="object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium text-foreground truncate">{sire.barnName}</span>
              </Link>
            ) : externalSire ? (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{externalSire.name}</p>
                  {externalSire.studFarm && (
                    <p className="text-xs text-muted-foreground truncate">{externalSire.studFarm}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-2">Unknown</p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Dam (Mother)</p>
            {dam ? (
              <Link href={`/horses/${dam.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {dam.profilePhotoUrl ? (
                    <Image src={dam.profilePhotoUrl} alt="" fill unoptimized className="object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium text-foreground truncate">{dam.barnName}</span>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground p-2">Unknown</p>
            )}
          </div>
        </div>

        {/* Offspring */}
        {offspring.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Offspring ({offspring.length})</p>
            <div className="space-y-1">
              {offspring.map(foal => (
                <Link key={foal.id} href={`/horses/${foal.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    {foal.profilePhotoUrl ? (
                      <Image src={foal.profilePhotoUrl} alt="" fill unoptimized className="object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{foal.barnName}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
