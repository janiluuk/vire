type Props = {
  guildId: string;
  title: string;
};

/** Discord server widget (read-only presence + join). */
export function DiscordWidgetEmbed({ guildId, title }: Props) {
  const src = `https://discord.com/widget?id=${encodeURIComponent(guildId)}&theme=dark`;
  return (
    <div className="sparkki-card overflow-hidden p-0 sm:p-0">
      <iframe
        title={title}
        src={src}
        className="h-[500px] w-full max-w-full border-0 sm:min-h-[500px]"
        loading="lazy"
      />
    </div>
  );
}
