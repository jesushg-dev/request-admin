import { useFormatter, useTranslations } from 'next-intl';

interface ChannelHeroProps {
  name: string;
  creationTime: Date;
}

export const ChannelHero = ({ creationTime, name }: ChannelHeroProps) => {
  const t = useTranslations('component.chat.channelHero');
  const format = useFormatter();

  return (
    <div className="mx-5 mt-[88px] mb-4">
      <p className="mb-2 flex items-center text-2xl font-bold"># {name}</p>
      <p className="text-muted-foreground mb-4 font-normal">
        {t.rich('createdOn', {
          date: format.dateTime(creationTime, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          name: name,
          bold: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>
    </div>
  );
};
